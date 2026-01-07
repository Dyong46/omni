import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('app_config')
export class AppConfig {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 100, unique: true })
	key: string;

	@Column({ type: 'text' })
	value: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	category: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
