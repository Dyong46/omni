import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderChannel } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { OrdersService } from '../orders/orders.service';
import { TikTokWebhookDto } from './dto/tiktok-order.dto';

@Injectable()
export class TiktokService {
	constructor(
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
		private readonly ordersService: OrdersService,
	) {}

	/**
	 * Process a TikTok Shop webhook payload and create an order.
	 * In production, this would verify the x-tts-signature header first.
	 */
	async processWebhook(payload: TikTokWebhookDto): Promise<Order> {
		const { data } = payload;

		if (!data.item_list || data.item_list.length === 0) {
			throw new BadRequestException('item_list must not be empty');
		}

		return this.ordersService.create({
			channel: OrderChannel.TIKTOK,
			phone: data.buyer_info.phone,
			customerName: data.buyer_info.buyer_name,
			email: data.buyer_info.email,
			shippingAddress: data.recipient_address?.full_address,
			status: 'new',
			items: data.item_list.map((item) => ({
				productId: item.product_id,
				quantity: item.quantity,
				price: item.sale_price,
			})),
		});
	}

	/**
	 * Generate a random fake TikTok order using real products from the database.
	 * Useful for testing the TikTok channel flow without a real TikTok account.
	 */
	async generateMockOrder(): Promise<Order> {
		const products = await this.productsRepository.find({ take: 20 });

		if (products.length === 0) {
			throw new BadRequestException(
				'No products in the database. Please create some products first.',
			);
		}

		// Pick 1–3 random products
		const shuffled = [...products].sort(() => Math.random() - 0.5);
		const picked = shuffled.slice(
			0,
			Math.min(3, Math.floor(Math.random() * 3) + 1),
		);

		const mockNames = [
			'Nguyen Van A',
			'Tran Thi B',
			'Le Van C',
			'Pham Thi D',
			'Hoang Van E',
		];
		const mockPhones = [
			'0901234567',
			'0912345678',
			'0923456789',
			'0934567890',
			'0945678901',
		];
		const mockEmails = [
			'buyer1@tiktok.test',
			'buyer2@tiktok.test',
			'buyer3@tiktok.test',
		];
		const mockAddresses = [
			'123 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
			'45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
			'78 Trần Phú, Hải Châu, Đà Nẵng',
			'12 Hoàn Kiếm, Hà Nội',
		];

		const idx = Math.floor(Math.random() * mockNames.length);
		const tiktokOrderId = `TT-${Date.now()}-${Math.floor(Math.random() * 100000)
			.toString()
			.padStart(6, '0')}`;

		return this.ordersService.create({
			channel: OrderChannel.TIKTOK,
			phone: mockPhones[idx % mockPhones.length],
			customerName: mockNames[idx],
			email: mockEmails[idx % mockEmails.length],
			shippingAddress: `[Mock TikTok #${tiktokOrderId}] ${mockAddresses[Math.floor(Math.random() * mockAddresses.length)]}`,
			status: 'new',
			items: picked.map((p) => ({
				productId: p.id,
				quantity: Math.floor(Math.random() * 3) + 1,
				price: p.price,
			})),
		});
	}
}
