import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 200 })
	name: string;

	@Column({ type: 'int' })
	price: number;

	@Column({ type: 'int', default: 0 })
	quantity: number;

	@Column({ type: 'varchar', length: 255, nullable: true })
	image: string | null;

	@Column({ type: 'int', name: 'category_id', nullable: true })
	categoryId: number | null;

	@ManyToOne(() => Category, {
		onDelete: 'SET NULL',
		nullable: true,
	})
	@JoinColumn({ name: 'category_id' })
	category: Category | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
