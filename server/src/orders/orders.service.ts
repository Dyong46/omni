import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderChannel } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
	constructor(
		@InjectRepository(Order)
		private readonly ordersRepository: Repository<Order>,
		@InjectRepository(OrderItem)
		private readonly orderItemsRepository: Repository<OrderItem>,
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
	) {}

	async create(createOrderDto: CreateOrderDto): Promise<Order> {
		// Validate products and calculate total
		let totalAmount = 0;
		const items: OrderItem[] = [];

		for (const itemDto of createOrderDto.items) {
			const product = await this.productsRepository.findOne({
				where: { id: itemDto.productId },
			});

			if (!product) {
				throw new BadRequestException(
					`Product with ID ${itemDto.productId} not found`,
				);
			}

			if (product.quantity < itemDto.quantity) {
				throw new BadRequestException(
					`Insufficient stock for product ${product.name}. Available: ${product.quantity}`,
				);
			}

			totalAmount += itemDto.price * itemDto.quantity;

			// Create order item
			const orderItem = this.orderItemsRepository.create({
				productId: itemDto.productId,
				quantity: itemDto.quantity,
				price: itemDto.price,
			});

			items.push(orderItem);

			// Update product quantity
			product.quantity -= itemDto.quantity;
			await this.productsRepository.save(product);
		}

		// Create order
		const order = this.ordersRepository.create({
			...createOrderDto,
			totalAmount,
			items,
		});

		return this.ordersRepository.save(order);
	}

	async findAll(
		channel?: OrderChannel,
		status?: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<Order[]> {
		const queryBuilder = this.ordersRepository
			.createQueryBuilder('order')
			.leftJoinAndSelect('order.items', 'items')
			.leftJoinAndSelect('items.product', 'product')
			.orderBy('order.createdAt', 'DESC');

		if (channel) {
			queryBuilder.andWhere('order.channel = :channel', { channel });
		}

		if (status) {
			queryBuilder.andWhere('order.status = :status', { status });
		}

		if (startDate) {
			queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
		}

		if (endDate) {
			queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
		}

		return queryBuilder.getMany();
	}

	async findOne(id: number): Promise<Order> {
		const order = await this.ordersRepository.findOne({
			where: { id },
			relations: ['items', 'items.product'],
		});

		if (!order) {
			throw new NotFoundException(`Order with ID ${id} not found`);
		}

		return order;
	}

	async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
		const order = await this.findOne(id);

		// If items are being updated, handle them
		if (updateOrderDto.items) {
			// Remove old items and restore product quantities
			for (const item of order.items) {
				const product = await this.productsRepository.findOne({
					where: { id: item.productId },
				});
				if (product) {
					product.quantity += item.quantity;
					await this.productsRepository.save(product);
				}
			}

			// Remove old items
			await this.orderItemsRepository.remove(order.items);

			// Add new items and update quantities
			let totalAmount = 0;
			const newItems: OrderItem[] = [];

			for (const itemDto of updateOrderDto.items) {
				const product = await this.productsRepository.findOne({
					where: { id: itemDto.productId },
				});

				if (!product) {
					throw new BadRequestException(
						`Product with ID ${itemDto.productId} not found`,
					);
				}

				if (product.quantity < itemDto.quantity) {
					throw new BadRequestException(
						`Insufficient stock for product ${product.name}. Available: ${product.quantity}`,
					);
				}

				totalAmount += itemDto.price * itemDto.quantity;

				const orderItem = this.orderItemsRepository.create({
					...itemDto,
					orderId: order.id,
				});

				newItems.push(orderItem);

				// Update product quantity
				product.quantity -= itemDto.quantity;
				await this.productsRepository.save(product);
			}

			order.items = newItems;
			order.totalAmount = totalAmount;
		}

		// Update other fields
		Object.assign(order, {
			channel: updateOrderDto.channel ?? order.channel,
			customerName: updateOrderDto.customerName ?? order.customerName,
			phone: updateOrderDto.phone ?? order.phone,
			email: updateOrderDto.email ?? order.email,
			shippingAddress: updateOrderDto.shippingAddress ?? order.shippingAddress,
			status: updateOrderDto.status ?? order.status,
		});

		return this.ordersRepository.save(order);
	}

	async remove(id: number): Promise<void> {
		const order = await this.findOne(id);

		// Restore product quantities
		for (const item of order.items) {
			const product = await this.productsRepository.findOne({
				where: { id: item.productId },
			});
			if (product) {
				product.quantity += item.quantity;
				await this.productsRepository.save(product);
			}
		}

		await this.ordersRepository.remove(order);
	}

	async getStatistics(): Promise<any> {
		const totalOrders = await this.ordersRepository.count();

		const ordersByChannel = await this.ordersRepository
			.createQueryBuilder('order')
			.select('order.channel', 'channel')
			.addSelect('COUNT(order.id)', 'count')
			.addSelect('SUM(order.totalAmount)', 'totalRevenue')
			.groupBy('order.channel')
			.getRawMany();

		const ordersByStatus = await this.ordersRepository
			.createQueryBuilder('order')
			.select('order.status', 'status')
			.addSelect('COUNT(order.id)', 'count')
			.groupBy('order.status')
			.getRawMany();

		const totalRevenue = await this.ordersRepository
			.createQueryBuilder('order')
			.select('SUM(order.totalAmount)', 'total')
			.getRawOne();

		return {
			totalOrders,
			totalRevenue: Number(totalRevenue?.total || 0),
			ordersByChannel,
			ordersByStatus,
		};
	}

	async getRecentOrders(limit: number = 10): Promise<Order[]> {
		return this.ordersRepository.find({
			relations: ['items', 'items.product'],
			order: { createdAt: 'DESC' },
			take: limit,
		});
	}
}
