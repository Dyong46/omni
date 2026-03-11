import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TiktokService } from './tiktok.service';
import { TikTokWebhookDto } from './dto/tiktok-order.dto';

@ApiTags('TikTok (Mock)')
@Controller('tiktok')
export class TiktokController {
	constructor(private readonly tiktokService: TiktokService) {}

	/**
	 * Simulates a TikTok Shop webhook event for order creation.
	 * In production this endpoint would verify x-tts-signature from TikTok.
	 *
	 * Example payload:
	 * {
	 *   "type": "ORDER_STATUS_CHANGE",
	 *   "data": {
	 *     "order_id": "TT-20260311-000001",
	 *     "buyer_info": { "buyer_name": "Nguyen Van A", "phone": "0901234567" },
	 *     "recipient_address": { "full_address": "123 Le Loi, Q1, TP.HCM" },
	 *     "item_list": [{ "product_id": 1, "quantity": 2, "sale_price": 250000 }]
	 *   }
	 * }
	 */
	@Post('webhook')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Receive TikTok Shop order webhook',
		description:
			'Accepts a TikTok Shop-style webhook payload and creates an order with channel=tiktok. ' +
			'In production, the x-tts-signature header would be verified against your TikTok App Secret.',
	})
	@ApiResponse({
		status: 201,
		description: 'Order created from TikTok webhook',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid payload or insufficient stock',
	})
	processWebhook(@Body() body: TikTokWebhookDto) {
		return this.tiktokService.processWebhook(body);
	}

	/**
	 * Generates a fully random fake TikTok order using real products from the DB.
	 * No payload needed — just call this endpoint to seed test data.
	 */
	@Post('mock/generate')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Generate a random mock TikTok order',
		description:
			'Picks random products from the database and creates a fake TikTok order. ' +
			'Useful for testing the order list, statistics, and TikTok channel flows without a real account.',
	})
	@ApiResponse({
		status: 201,
		description: 'Mock TikTok order created',
	})
	@ApiResponse({
		status: 400,
		description: 'No products in database',
	})
	generateMock() {
		return this.tiktokService.generateMockOrder();
	}
}
