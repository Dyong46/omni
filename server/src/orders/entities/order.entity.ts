import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderChannel {
	OFFLINE = 'offline',
	TIKTOK = 'tiktok',
	SHOPEE = 'shopee',
}

@Entity('orders')
export class Order {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'enum',
		enum: OrderChannel,
	})
	channel: OrderChannel;

	@Column({ type: 'varchar', length: 150, name: 'customer_name', nullable: true })
	customerName: string | null;

	@Column({ type: 'varchar', length: 20 })
	phone: string;

	@Column({ type: 'varchar', length: 150, nullable: true })
	email: string | null;

	@Column({ type: 'text', name: 'shipping_address', nullable: true })
	shippingAddress: string | null;

	@Column({ type: 'varchar', length: 50, nullable: true })
	status: string | null;

	@Column({ type: 'int', name: 'total_amount', default: 0 })
	totalAmount: number;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
		cascade: true,
		eager: true,
	})
	items: OrderItem[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
