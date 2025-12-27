import {
	Controller,
	Get,
	Post,
	Body,
	Put,
	Param,
	Delete,
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiQuery,
	ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderChannel } from './entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new order' })
	@ApiResponse({
		status: 201,
		description: 'Order created successfully',
		schema: {
			example: {
				id: 1,
				channel: 'offline',
				customerName: 'Nguyen Van A',
				phone: '0901234567',
				email: 'customer@example.com',
				shippingAddress: '123 Main St, District 1, Ho Chi Minh City',
				status: 'pending',
				totalAmount: 60450000,
				items: [
					{
						id: 1,
						productId: 1,
						quantity: 2,
						price: 30000000,
						product: {
							id: 1,
							name: 'iPhone 15 Pro Max',
						},
					},
					{
						id: 2,
						productId: 5,
						quantity: 1,
						price: 450000,
						product: {
							id: 5,
							name: 'AirPods Pro',
						},
					},
				],
				createdAt: '2024-01-15T10:30:00.000Z',
			},
		},
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	create(@Body() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all orders with optional filters' })
	@ApiQuery({
		name: 'channel',
		required: false,
		enum: OrderChannel,
		description: 'Filter by sales channel',
	})
	@ApiQuery({
		name: 'status',
		required: false,
		type: String,
		description: 'Filter by order status',
	})
	@ApiQuery({
		name: 'startDate',
		required: false,
		type: String,
		description: 'Filter orders from this date (ISO format)',
	})
	@ApiQuery({
		name: 'endDate',
		required: false,
		type: String,
		description: 'Filter orders until this date (ISO format)',
	})
	@ApiResponse({
		status: 200,
		description: 'List of orders',
		schema: {
			example: [
				{
					id: 1,
					channel: 'shopee',
					customerName: 'Tran Thi B',
					phone: '0912345678',
					email: 'customer2@example.com',
					shippingAddress: '456 Street, District 3, Ho Chi Minh City',
					status: 'delivered',
					totalAmount: 25000000,
					items: [
						{
							id: 3,
							productId: 2,
							quantity: 1,
							price: 25000000,
							product: {
								id: 2,
								name: 'Samsung Galaxy S24',
							},
						},
					],
					createdAt: '2024-01-14T14:20:00.000Z',
				},
			],
		},
	})
	findAll(
		@Query('channel') channel?: OrderChannel,
		@Query('status') status?: string,
		@Query('startDate') startDate?: string,
		@Query('endDate') endDate?: string,
	) {
		const start = startDate ? new Date(startDate) : undefined;
		const end = endDate ? new Date(endDate) : undefined;
		return this.ordersService.findAll(channel, status, start, end);
	}

	@Get('statistics')
	@ApiOperation({ summary: 'Get order statistics' })
	@ApiResponse({
		status: 200,
		description: 'Order statistics',
		schema: {
			example: {
				totalOrders: 150,
				totalRevenue: 3500000000,
				ordersByChannel: [
					{
						channel: 'offline',
						count: '80',
						totalRevenue: '2000000000',
					},
					{
						channel: 'shopee',
						count: '45',
						totalRevenue: '900000000',
					},
					{
						channel: 'tiktok',
						count: '25',
						totalRevenue: '600000000',
					},
				],
				ordersByStatus: [
					{
						status: 'pending',
						count: '30',
					},
					{
						status: 'processing',
						count: '20',
					},
					{
						status: 'delivered',
						count: '95',
					},
					{
						status: 'cancelled',
						count: '5',
					},
				],
			},
		},
	})
	getStatistics() {
		return this.ordersService.getStatistics();
	}

	@Get('recent')
	@ApiOperation({ summary: 'Get recent orders' })
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of recent orders to retrieve (default: 10)',
	})
	@ApiResponse({
		status: 200,
		description: 'Recent orders',
	})
	getRecentOrders(@Query('limit') limit?: number) {
		return this.ordersService.getRecentOrders(limit);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get order by ID' })
	@ApiParam({ name: 'id', description: 'Order ID' })
	@ApiResponse({
		status: 200,
		description: 'Order details',
		schema: {
			example: {
				id: 1,
				channel: 'tiktok',
				customerName: 'Le Van C',
				phone: '0923456789',
				email: 'customer3@example.com',
				shippingAddress: '789 Avenue, District 7, Ho Chi Minh City',
				status: 'processing',
				totalAmount: 15500000,
				items: [
					{
						id: 4,
						productId: 3,
						quantity: 1,
						price: 15000000,
						product: {
							id: 3,
							name: 'MacBook Air M2',
						},
					},
					{
						id: 5,
						productId: 6,
						quantity: 1,
						price: 500000,
						product: {
							id: 6,
							name: 'USB-C Cable',
						},
					},
				],
				createdAt: '2024-01-13T09:15:00.000Z',
			},
		},
	})
	@ApiResponse({ status: 404, description: 'Order not found' })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.ordersService.findOne(id);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update an order' })
	@ApiParam({ name: 'id', description: 'Order ID' })
	@ApiResponse({
		status: 200,
		description: 'Order updated successfully',
	})
	@ApiResponse({ status: 404, description: 'Order not found' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateOrderDto: UpdateOrderDto,
	) {
		return this.ordersService.update(id, updateOrderDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an order' })
	@ApiParam({ name: 'id', description: 'Order ID' })
	@ApiResponse({
		status: 200,
		description: 'Order deleted successfully',
	})
	@ApiResponse({ status: 404, description: 'Order not found' })
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.ordersService.remove(id);
	}
}
