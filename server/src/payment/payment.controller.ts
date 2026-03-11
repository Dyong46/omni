import {
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@Post('checkout')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a Stripe Checkout Session',
		description:
			'Creates a Stripe Checkout Session for the specified order. ' +
			'Returns a checkout URL to redirect the customer to for payment. ' +
			'On success, Stripe redirects to /orders?payment=success. ' +
			'On cancel, Stripe redirects to /orders/:id?payment=cancelled.',
	})
	@ApiResponse({
		status: 201,
		description: 'Checkout session created',
		schema: {
			example: {
				url: 'https://checkout.stripe.com/pay/cs_test_xxx',
				sessionId: 'cs_test_xxx',
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Order has no items or Stripe error',
	})
	@ApiResponse({ status: 404, description: 'Order not found' })
	createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
		return this.paymentService.createCheckoutSession(dto.orderId);
	}

	@Get('session-status/:sessionId')
	@ApiOperation({
		summary: 'Get Stripe Checkout session payment status',
		description:
			'Returns the payment status for a checkout session. ' +
			'If paid, order status is updated to paid.',
	})
	@ApiResponse({
		status: 200,
		description: 'Session status returned',
		schema: {
			example: {
				sessionId: 'cs_test_xxx',
				status: 'complete',
				paymentStatus: 'paid',
				paid: true,
				orderId: 123,
			},
		},
	})
	getSessionStatus(@Param('sessionId') sessionId: string) {
		return this.paymentService.getCheckoutSessionStatus(sessionId);
	}

	@Post('webhook')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Stripe webhook receiver',
		description:
			'Receives Stripe webhook events, verifies Stripe-Signature, and marks related orders as paid.',
	})
	@ApiResponse({ status: 200, description: 'Webhook handled' })
	handleWebhook(
		@Req() req: Request & { rawBody?: Buffer },
		@Headers('stripe-signature') signature: string,
		@Body()
		payload: { type?: string; data?: { object?: Stripe.Checkout.Session } },
	) {
		if (req.rawBody) {
			const event = this.paymentService.constructWebhookEvent(
				req.rawBody,
				signature,
			);

			return this.paymentService.handleStripeWebhook({
				type: event.type,
				data: {
					object: event.data.object as Stripe.Checkout.Session,
				},
			});
		}

		return this.paymentService.handleStripeWebhook(payload);
	}
}
