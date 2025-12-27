import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
	) {}

	/**
	 * Create new category
	 */
	async create(createCategoryDto: CreateCategoryDto) {
		const { name, parentId } = createCategoryDto;

		// Check if parent exists if parentId is provided
		if (parentId) {
			const parent = await this.categoryRepository.findOne({
				where: { id: parentId },
			});
			if (!parent) {
				throw new NotFoundException('Parent category not found');
			}
		}

		const category = this.categoryRepository.create({
			name,
			parentId: parentId || null,
		});

		return this.categoryRepository.save(category);
	}

	/**
	 * Get all categories (flat list)
	 */
	async findAll() {
		return this.categoryRepository.find({
			order: { id: 'ASC' },
		});
	}

	/**
	 * Get categories tree structure (hierarchical)
	 */
	async findTree() {
		// Get root categories (no parent)
		const rootCategories = await this.categoryRepository.find({
			where: { parentId: IsNull() },
			order: { id: 'ASC' },
		});

		// Build tree for each root category
		const tree = await Promise.all(
			rootCategories.map((category) => this.buildCategoryTree(category)),
		);

		return tree;
	}

	/**
	 * Recursively build category tree with children
	 */
	private async buildCategoryTree(category: Category): Promise<any> {
		const children = await this.categoryRepository.find({
			where: { parentId: category.id },
			order: { id: 'ASC' },
		});

		const childrenWithSubChildren = await Promise.all(
			children.map((child) => this.buildCategoryTree(child)),
		);

		return {
			id: category.id,
			name: category.name,
			parentId: category.parentId,
			createdAt: category.createdAt,
			children: childrenWithSubChildren.length > 0 ? childrenWithSubChildren : undefined,
		};
	}

	/**
	 * Get single category by ID
	 */
	async findOne(id: number) {
		const category = await this.categoryRepository.findOne({
			where: { id },
		});

		if (!category) {
			throw new NotFoundException('Category not found');
		}

		return category;
	}

	/**
	 * Get category with its children
	 */
	async findOneWithChildren(id: number) {
		const category = await this.categoryRepository.findOne({
			where: { id },
		});

		if (!category) {
			throw new NotFoundException('Category not found');
		}

		return this.buildCategoryTree(category);
	}

	/**
	 * Get children of a category
	 */
	async findChildren(id: number) {
		const category = await this.findOne(id);

		return this.categoryRepository.find({
			where: { parentId: category.id },
			order: { id: 'ASC' },
		});
	}

	/**
	 * Update category
	 */
	async update(id: number, updateCategoryDto: UpdateCategoryDto) {
		const category = await this.findOne(id);

		// Check if trying to set self as parent
		if (updateCategoryDto.parentId === id) {
			throw new BadRequestException('Category cannot be its own parent');
		}

		// Check if parent exists if parentId is provided
		if (updateCategoryDto.parentId) {
			const parent = await this.categoryRepository.findOne({
				where: { id: updateCategoryDto.parentId },
			});
			if (!parent) {
				throw new NotFoundException('Parent category not found');
			}

			// Check if new parent is a descendant of current category
			const isDescendant = await this.isDescendant(
				id,
				updateCategoryDto.parentId,
			);
			if (isDescendant) {
				throw new BadRequestException(
					'Cannot set a descendant as parent (circular reference)',
				);
			}
		}

		// Update fields
		if (updateCategoryDto.name) {
			category.name = updateCategoryDto.name;
		}
		if (updateCategoryDto.parentId !== undefined) {
			category.parentId = updateCategoryDto.parentId;
		}

		return this.categoryRepository.save(category);
	}

	/**
	 * Check if targetId is a descendant of categoryId
	 */
	private async isDescendant(
		categoryId: number,
		targetId: number,
	): Promise<boolean> {
		const children = await this.categoryRepository.find({
			where: { parentId: categoryId },
		});

		for (const child of children) {
			if (child.id === targetId) {
				return true;
			}
			const isChildDescendant = await this.isDescendant(child.id, targetId);
			if (isChildDescendant) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Delete category
	 */
	async remove(id: number) {
		const category = await this.findOne(id);

		// Check if category has children
		const children = await this.categoryRepository.find({
			where: { parentId: id },
		});

		if (children.length > 0) {
			throw new ConflictException(
				'Cannot delete category with children. Delete children first or reassign them.',
			);
		}

		await this.categoryRepository.remove(category);

		return {
			message: 'Category deleted successfully',
			id,
		};
	}
}
