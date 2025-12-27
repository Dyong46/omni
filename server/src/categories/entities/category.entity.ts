import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 150 })
	name: string;

	@Column({ name: 'parent_id', nullable: true })
	parentId: number | null;

	@ManyToOne(() => Category, (category) => category.children, {
		onDelete: 'SET NULL',
		nullable: true,
	})
	@JoinColumn({ name: 'parent_id' })
	parent: Category | null;

	@OneToMany(() => Category, (category) => category.parent)
	children: Category[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
