import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order } from '../orders/entities/order.entity';

interface StripeWebhookPayload {
	type?: string;
	data?: {
		object?: Stripe.Checkout.Session;
	};
}

@Injectable()
export class PaymentService {
	private readonly stripe: Stripe;
	private readonly webhookSecret?: string;

	constructor(
		@InjectRepository(Order)
		private readonly ordersRepository: Repository<Order>,
		private readonly configService: ConfigService,
	) {
		const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
		this.webhookSecret = this.configService.get<string>(
			'STRIPE_WEBHOOK_SECRET',
		);

		if (!secretKey || secretKey === 'sk_test_replace_with_your_key') {
			throw new Error('STRIPE_SECRET_KEY is not configured in .env');
		}

		this.stripe = new Stripe(secretKey);
	}

	/**
	 * Creates a Stripe Checkout Session for the given order.
	 * Returns the session URL to redirect the customer to.
	 */
	async createCheckoutSession(
		orderId: number,
	): Promise<{ url: string; sessionId: string }> {
		const order = await this.ordersRepository.findOne({
			where: { id: orderId },
			relations: ['items', 'items.product'],
		});

		if (!order) {
			throw new NotFoundException(`Order #${orderId} not found`);
		}

		if (!order.items || order.items.length === 0) {
			throw new BadRequestException(`Order #${orderId} has no items`);
		}

		const appUrl =
			this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';

		const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
			order.items.map((item) => ({
				quantity: item.quantity,
				price_data: {
					currency: 'vnd',
					unit_amount: item.price, // VND is zero-decimal in Stripe
					product_data: {
						name: item.product?.name ?? `Product #${item.productId}`,
						...(item.product?.image ? { images: [item.product.image] } : {}),
					},
				},
			}));

		const session = await this.stripe.checkout.sessions.create({
			mode: 'payment',
			line_items: lineItems,
			customer_email: order.email ?? undefined,
			metadata: {
				orderId: order.id.toString(),
				channel: order.channel,
			},
			success_url: `${appUrl}/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${appUrl}/orders/${order.id}?payment=cancelled`,
		});

		if (!session.url) {
			throw new BadRequestException('Stripe did not return a checkout URL');
		}

		return { url: session.url, sessionId: session.id };
	}

	async getCheckoutSessionStatus(sessionId: string): Promise<{
		sessionId: string;
		status: Stripe.Checkout.Session.Status | null;
		paymentStatus: Stripe.Checkout.Session.PaymentStatus;
		paid: boolean;
		orderId?: number;
	}> {
		const session = await this.stripe.checkout.sessions.retrieve(sessionId);
		const paid = session.payment_status === 'paid';
		const orderId = session.metadata?.orderId
			? Number(session.metadata.orderId)
			: undefined;

		if (paid && orderId) {
			await this.ordersRepository.update({ id: orderId }, { status: 'paid' });
		}

		return {
			sessionId: session.id,
			status: session.status,
			paymentStatus: session.payment_status,
			paid,
			...(orderId ? { orderId } : {}),
		};
	}

	constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
		if (!this.webhookSecret) {
			throw new BadRequestException(
				'STRIPE_WEBHOOK_SECRET is not configured in .env',
			);
		}

		if (!signature) {
			throw new BadRequestException('Missing Stripe-Signature header');
		}

		return this.stripe.webhooks.constructEvent(
			rawBody,
			signature,
			this.webhookSecret,
		);
	}

	async handleStripeWebhook(payload: StripeWebhookPayload) {
		if (
			payload.type !== 'checkout.session.completed' &&
			payload.type !== 'checkout.session.async_payment_succeeded'
		) {
			return { received: true, ignored: true };
		}

		const session = payload.data?.object;

		if (!session) {
			throw new BadRequestException('Invalid webhook payload');
		}

		const paid = session.payment_status === 'paid';
		const orderId = session.metadata?.orderId
			? Number(session.metadata.orderId)
			: undefined;

		if (paid && orderId) {
			await this.ordersRepository.update({ id: orderId }, { status: 'paid' });
		}

		return {
			received: true,
			type: payload.type,
			paid,
			...(orderId ? { orderId } : {}),
		};
	}
}
