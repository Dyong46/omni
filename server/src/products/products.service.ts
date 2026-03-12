import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
		@InjectRepository(InventoryMovement)
		private readonly inventoryMovementRepository: Repository<InventoryMovement>,
		private readonly dataSource: DataSource,
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
		return this.updateInventory(id, { quantity });
	}

	async updateInventory(id: number, updateInventoryDto: UpdateInventoryDto) {
		return this.dataSource.transaction(async (manager) => {
			const product = await manager.findOne(Product, {
				where: { id },
				relations: ['category'],
				lock: { mode: 'pessimistic_write' },
			});

			if (!product) {
				throw new NotFoundException('Product not found');
			}

			const previousQuantity = product.quantity;
			const newQuantity = updateInventoryDto.quantity;

			product.quantity = newQuantity;
			const updatedProduct = await manager.save(product);

			if (previousQuantity !== newQuantity) {
				const movement = manager.create(InventoryMovement, {
					productId: id,
					previousQuantity,
					newQuantity,
					changeQuantity: newQuantity - previousQuantity,
					reason: updateInventoryDto.reason ?? 'manual_adjustment',
					note: updateInventoryDto.note ?? null,
				});

				await manager.save(movement);
			}

			return updatedProduct;
		});
	}

	async findInventoryMovements(productId: number) {
		await this.findOne(productId);

		return this.inventoryMovementRepository.find({
			where: { productId },
			order: { createdAt: 'DESC' },
			take: 50,
		});
	}

	/**
	 * Update product price
	 */
	async updatePrice(id: number, price: number) {
		const product = await this.findOne(id);
		product.price = price;
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
