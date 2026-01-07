import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
	ADMIN = 'admin',
	USER = 'user',
}

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100, unique: true })
	username: string;

	@Column({ length: 255 })
	password: string;

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
