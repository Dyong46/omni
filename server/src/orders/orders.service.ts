import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
	Order,
	OrderChannel,
	OrderPaymentStatus,
} from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { RevenueChartPeriod } from './dto/get-revenue-chart.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from '../products/entities/product.entity';

export interface RevenueChartPoint {
	date: string;
	amount: number;
	orders: number;
}

export interface RevenueChartResponse {
	period: RevenueChartPeriod;
	startDate: string;
	endDate: string;
	totalRevenue: number;
	totalOrders: number;
	points: RevenueChartPoint[];
}

@Injectable()
export class OrdersService {
	constructor(
		@InjectRepository(Order)
		private readonly ordersRepository: Repository<Order>,
		@InjectRepository(OrderItem)
		private readonly orderItemsRepository: Repository<OrderItem>,
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
		private readonly dataSource: DataSource,
	) {}

	private doesStatusReserveInventory(status?: string): boolean {
		return status !== 'draft' && status !== 'cancelled';
	}

	private async findOrderInTransaction(
		manager: EntityManager,
		id: number,
	): Promise<Order> {
		const order = await manager.findOne(Order, {
			where: { id },
			relations: ['items', 'items.product'],
		});

		if (!order) {
			throw new NotFoundException(`Order with ID ${id} not found`);
		}

		return order;
	}

	private async findProductForUpdate(
		manager: EntityManager,
		productId: number,
	): Promise<Product> {
		const product = await manager.findOne(Product, {
			where: { id: productId },
			lock: { mode: 'pessimistic_write' },
		});

		if (!product) {
			throw new BadRequestException(
				`Product with ID ${productId} not found`,
			);
		}

		return product;
	}

	private async deductInventory(
		manager: EntityManager,
		items: Array<{ productId: number; quantity: number }>,
	) {
		for (const item of items) {
			const product = await this.findProductForUpdate(manager, item.productId);

			if (product.quantity < item.quantity) {
				throw new BadRequestException(
					`Insufficient stock for product ${product.name}. Available: ${product.quantity}`,
				);
			}

			product.quantity -= item.quantity;
			await manager.save(product);
		}
	}

	private async restoreInventory(
		manager: EntityManager,
		items: Array<{ productId: number; quantity: number }>,
	) {
		for (const item of items) {
			const product = await manager.findOne(Product, {
				where: { id: item.productId },
				lock: { mode: 'pessimistic_write' },
			});

			if (!product) {
				continue;
			}

			product.quantity += item.quantity;
			await manager.save(product);
		}
	}

	private buildOrderItems(
		manager: EntityManager,
		items: CreateOrderDto['items'],
		orderId?: number,
	): OrderItem[] {
		return items.map((item) =>
			manager.create(OrderItem, {
				productId: item.productId,
				quantity: item.quantity,
				price: item.price,
				...(orderId ? { orderId } : {}),
			}),
		);
	}

	async create(createOrderDto: CreateOrderDto): Promise<Order> {
		return this.dataSource.transaction(async (manager) => {
			const totalAmount = createOrderDto.items.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0,
			);
			const status = createOrderDto.status ?? 'new';
			const items = this.buildOrderItems(manager, createOrderDto.items);

			for (const item of createOrderDto.items) {
				await this.findProductForUpdate(manager, item.productId);
			}

			if (this.doesStatusReserveInventory(status)) {
				await this.deductInventory(manager, createOrderDto.items);
			}

			const defaultPaymentStatus =
				createOrderDto.channel === OrderChannel.TIKTOK
					? OrderPaymentStatus.PAID
					: OrderPaymentStatus.UNPAID;

			const order = manager.create(Order, {
				channel: createOrderDto.channel,
				customerName: createOrderDto.customerName ?? null,
				phone: createOrderDto.phone,
				email: createOrderDto.email ?? null,
				shippingAddress: createOrderDto.shippingAddress ?? null,
				status,
				paymentStatus:
					createOrderDto.paymentStatus ?? defaultPaymentStatus,
				totalAmount,
				items,
			});

			return manager.save(order);
		});
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
		return this.dataSource.transaction(async (manager) => {
			const order = await this.findOrderInTransaction(manager, id);
			const currentReservesInventory = this.doesStatusReserveInventory(
				order.status,
			);
			const nextStatus = updateOrderDto.status ?? order.status;
			const nextReservesInventory = this.doesStatusReserveInventory(nextStatus);

			if (updateOrderDto.items) {
				if (currentReservesInventory) {
					await this.restoreInventory(manager, order.items);
				}

				await manager.remove(order.items);

				const newItems = this.buildOrderItems(
					manager,
					updateOrderDto.items,
					order.id,
				);
				const totalAmount = updateOrderDto.items.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0,
				);

				for (const item of updateOrderDto.items) {
					await this.findProductForUpdate(manager, item.productId);
				}

				if (nextReservesInventory) {
					await this.deductInventory(manager, updateOrderDto.items);
				}

				order.items = newItems;
				order.totalAmount = totalAmount;
			} else if (currentReservesInventory !== nextReservesInventory) {
				if (nextReservesInventory) {
					await this.deductInventory(manager, order.items);
				} else {
					await this.restoreInventory(manager, order.items);
				}
			}

			order.channel = updateOrderDto.channel ?? order.channel;
			order.customerName = updateOrderDto.customerName ?? order.customerName;
			order.phone = updateOrderDto.phone ?? order.phone;
			order.email = updateOrderDto.email ?? order.email;
			order.shippingAddress =
				updateOrderDto.shippingAddress ?? order.shippingAddress;
			order.status = nextStatus;

			if (updateOrderDto.paymentStatus) {
				order.paymentStatus = updateOrderDto.paymentStatus;
			}

			return manager.save(order);
		});
	}

	async remove(id: number): Promise<void> {
		await this.dataSource.transaction(async (manager) => {
			const order = await this.findOrderInTransaction(manager, id);

			if (this.doesStatusReserveInventory(order.status)) {
				await this.restoreInventory(manager, order.items);
			}

			await manager.remove(order);
		});
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
			.getRawOne<{ total: string | null }>();

		return {
			totalOrders,
			totalRevenue: Number(totalRevenue?.total || 0),
			ordersByChannel,
			ordersByStatus,
		};
	}

	async getRevenueChart(
		period: RevenueChartPeriod = 'daily',
		startDate?: string,
		endDate?: string,
	): Promise<RevenueChartResponse> {
		const normalizedPeriod = period ?? 'daily';
		const normalizedEndDate = this.parseDate(endDate) ?? new Date();
		const normalizedStartDate =
			this.parseDate(startDate) ??
			this.getDefaultStartDate(normalizedEndDate, normalizedPeriod);

		normalizedStartDate.setHours(0, 0, 0, 0);
		normalizedEndDate.setHours(23, 59, 59, 999);

		if (normalizedStartDate > normalizedEndDate) {
			throw new BadRequestException(
				'startDate must be earlier than or equal to endDate',
			);
		}

		const orders = await this.ordersRepository
			.createQueryBuilder('order')
			.select(['order.createdAt', 'order.totalAmount'])
			.where('order.createdAt >= :startDate', {
				startDate: normalizedStartDate,
			})
			.andWhere('order.createdAt <= :endDate', { endDate: normalizedEndDate })
			.orderBy('order.createdAt', 'ASC')
			.getMany();

		const buckets = new Map<string, RevenueChartPoint>();

		for (const order of orders) {
			const bucketStart = this.getBucketStartDate(
				order.createdAt,
				normalizedPeriod,
			);
			const bucketKey = this.formatDateKey(bucketStart);
			const currentBucket = buckets.get(bucketKey) ?? {
				date: bucketKey,
				amount: 0,
				orders: 0,
			};

			currentBucket.amount += Number(order.totalAmount || 0);
			currentBucket.orders += 1;

			buckets.set(bucketKey, currentBucket);
		}

		const points = Array.from(buckets.values()).sort((left, right) =>
			left.date.localeCompare(right.date),
		);

		return {
			period: normalizedPeriod,
			startDate: this.formatDateKey(normalizedStartDate),
			endDate: this.formatDateKey(normalizedEndDate),
			totalRevenue: points.reduce((sum, point) => sum + point.amount, 0),
			totalOrders: orders.length,
			points,
		};
	}

	async getRecentOrders(limit: number = 10): Promise<Order[]> {
		return this.ordersRepository.find({
			relations: ['items', 'items.product'],
			order: { createdAt: 'DESC' },
			take: limit,
		});
	}

	private parseDate(value?: string): Date | null {
		if (!value) {
			return null;
		}

		const parsedDate = new Date(value);

		if (Number.isNaN(parsedDate.getTime())) {
			throw new BadRequestException(`Invalid date value: ${value}`);
		}

		return parsedDate;
	}

	private getDefaultStartDate(date: Date, period: RevenueChartPeriod): Date {
		const startDate = new Date(date);

		if (period === 'monthly') {
			startDate.setMonth(startDate.getMonth() - 11);
			startDate.setDate(1);
			return startDate;
		}

		if (period === 'weekly') {
			startDate.setDate(startDate.getDate() - 83);
			return startDate;
		}

		startDate.setDate(startDate.getDate() - 29);
		return startDate;
	}

	private getBucketStartDate(date: Date, period: RevenueChartPeriod): Date {
		const bucketStart = new Date(date);
		bucketStart.setHours(0, 0, 0, 0);

		if (period === 'monthly') {
			bucketStart.setDate(1);
			return bucketStart;
		}

		if (period === 'weekly') {
			bucketStart.setDate(bucketStart.getDate() - bucketStart.getDay());
			return bucketStart;
		}

		return bucketStart;
	}

	private formatDateKey(date: Date): string {
		return date.toISOString().slice(0, 10);
	}
}
