import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
	) {}

	/**
	 * Create new product
	 */
	async create(createProductDto: CreateProductDto) {
		const product = this.productRepository.create({
			name: createProductDto.name,
			price: createProductDto.price,
			quantity: createProductDto.quantity || 0,
			image: createProductDto.image || null,
			categoryId: createProductDto.categoryId || null,
		});

		return this.productRepository.save(product);
	}

	/**
	 * Get all products with optional category filter
	 */
	async findAll(categoryId?: number) {
		const where = categoryId ? { categoryId } : {};

		return this.productRepository.find({
			where,
			relations: ['category'],
			order: { id: 'ASC' },
		});
	}

	/**
	 * Get single product by ID
	 */
	async findOne(id: number) {
		const product = await this.productRepository.findOne({
			where: { id },
			relations: ['category'],
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		return product;
	}

	/**
	 * Search products by name
	 */
	async search(searchTerm: string) {
		return this.productRepository
			.createQueryBuilder('product')
			.leftJoinAndSelect('product.category', 'category')
			.where('product.name LIKE :searchTerm', {
				searchTerm: `%${searchTerm}%`,
			})
			.orderBy('product.id', 'ASC')
			.getMany();
	}

	/**
	 * Update product
	 */
	async update(id: number, updateProductDto: UpdateProductDto) {
		const product = await this.findOne(id);

		// Update fields
		if (updateProductDto.name !== undefined) {
			product.name = updateProductDto.name;
		}
		if (updateProductDto.price !== undefined) {
			product.price = updateProductDto.price;
		}
		if (updateProductDto.quantity !== undefined) {
			product.quantity = updateProductDto.quantity;
		}
		if (updateProductDto.image !== undefined) {
			product.image = updateProductDto.image;
		}
		if (updateProductDto.categoryId !== undefined) {
			product.categoryId = updateProductDto.categoryId;
		}

		return this.productRepository.save(product);
	}

	/**
	 * Update product quantity (for inventory management)
	 */
	async updateQuantity(id: number, quantity: number) {
		const product = await this.findOne(id);
		product.quantity = quantity;
		return this.productRepository.save(product);
	}

	/**
	 * Delete product
	 */
	async remove(id: number) {
		const product = await this.findOne(id);
		await this.productRepository.remove(product);

		return {
			message: 'Product deleted successfully',
			id,
		};
	}

	/**
	 * Get products by category (including subcategories)
	 */
	async findByCategory(categoryId: number) {
		return this.productRepository.find({
			where: { categoryId },
			relations: ['category'],
			order: { id: 'ASC' },
		});
	}

	/**
	 * Get low stock products
	 */
	async findLowStock(threshold: number = 10) {
		return this.productRepository
			.createQueryBuilder('product')
			.leftJoinAndSelect('product.category', 'category')
			.where('product.quantity <= :threshold', { threshold })
			.orderBy('product.quantity', 'ASC')
			.getMany();
	}
}
