import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 150, nullable: true })
	name: string | null;

	@Column({ type: 'varchar', length: 150, nullable: true })
	email: string | null;

	@Column({ type: 'varchar', length: 20, nullable: true })
	phone: string | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
