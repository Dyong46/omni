import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int', name: 'order_id' })
	orderId: number;

	@Column({ type: 'int', name: 'product_id' })
	productId: number;

	@Column({ type: 'int' })
	quantity: number;

	@Column({ type: 'int' })
	price: number;

	@ManyToOne(() => Order, (order) => order.items, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'order_id' })
	order: Order;

	@ManyToOne(() => Product, {
		onDelete: 'RESTRICT',
		eager: true,
	})
	@JoinColumn({ name: 'product_id' })
	product: Product;
}
