import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('inventory_movements')
export class InventoryMovement {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int', name: 'product_id' })
	productId: number;

	@ManyToOne(() => Product, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'product_id' })
	product: Product;

	@Column({ type: 'int', name: 'previous_quantity' })
	previousQuantity: number;

	@Column({ type: 'int', name: 'new_quantity' })
	newQuantity: number;

	@Column({ type: 'int', name: 'change_quantity' })
	changeQuantity: number;

	@Column({ type: 'varchar', length: 100 })
	reason: string;

	@Column({ type: 'text', nullable: true })
	note: string | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}