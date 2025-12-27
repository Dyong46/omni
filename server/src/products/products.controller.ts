import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
	ParseIntPipe,
	Query,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	/**
	 * Create new product
	 */
	@Post()
	@ApiOperation({
		summary: 'Create new product',
		description: 'Create a new product with details',
	})
	@ApiBody({
		type: CreateProductDto,
		examples: {
			example1: {
				summary: 'iPhone product',
				value: {
					name: 'iPhone 15 Pro',
					price: 30000000,
					quantity: 10,
					image: 'iphone15pro.jpg',
					categoryId: 3,
				},
			},
			example2: {
				summary: 'Basic product',
				value: {
					name: 'Basic Product',
					price: 100000,
					quantity: 0,
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Product created successfully',
		schema: {
			example: {
				id: 9,
				name: 'iPhone 15 Pro',
				price: 30000000,
				quantity: 10,
				image: 'iphone15pro.jpg',
				categoryId: 3,
				createdAt: '2025-12-27T14:00:00.000Z',
				updatedAt: '2025-12-27T14:00:00.000Z',
			},
		},
	})
	create(@Body() createProductDto: CreateProductDto) {
		return this.productsService.create(createProductDto);
	}

	/**
	 * Get all products
	 */
	@Get()
	@ApiOperation({
		summary: 'Get all products',
		description: 'Get all products with optional category filter',
	})
	@ApiQuery({
		name: 'categoryId',
		required: false,
		description: 'Filter by category ID',
		example: 3,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved products',
		schema: {
			example: [
				{
					id: 1,
					name: 'iPhone 15 Pro',
					price: 30000000,
					quantity: 10,
					image: 'iphone15pro.jpg',
					categoryId: 3,
					createdAt: '2025-12-27T10:00:00.000Z',
					updatedAt: '2025-12-27T10:00:00.000Z',
					category: {
						id: 3,
						name: 'Mobile Phones',
						parentId: 1,
					},
				},
			],
		},
	})
	findAll(@Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number) {
		return this.productsService.findAll(categoryId);
	}

	/**
	 * Search products
	 */
	@Get('search')
	@ApiOperation({
		summary: 'Search products',
		description: 'Search products by name',
	})
	@ApiQuery({
		name: 'q',
		required: true,
		description: 'Search term',
		example: 'iPhone',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved search results',
		schema: {
			example: [
				{
					id: 1,
					name: 'iPhone 15 Pro',
					price: 30000000,
					quantity: 10,
					image: 'iphone15pro.jpg',
					categoryId: 3,
					category: {
						id: 3,
						name: 'Mobile Phones',
					},
				},
			],
		},
	})
	search(@Query('q') searchTerm: string) {
		return this.productsService.search(searchTerm);
	}

	/**
	 * Get low stock products
	 */
	@Get('low-stock')
	@ApiOperation({
		summary: 'Get low stock products',
		description: 'Get products with quantity below threshold',
	})
	@ApiQuery({
		name: 'threshold',
		required: false,
		description: 'Stock threshold',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved low stock products',
		schema: {
			example: [
				{
					id: 3,
					name: 'MacBook Air M2',
					price: 28000000,
					quantity: 5,
					image: 'macbook-air-m2.jpg',
					categoryId: 4,
				},
			],
		},
	})
	findLowStock(@Query('threshold', new ParseIntPipe({ optional: true })) threshold?: number) {
		return this.productsService.findLowStock(threshold);
	}

	/**
	 * Get products by category
	 */
	@Get('category/:categoryId')
	@ApiOperation({
		summary: 'Get products by category',
		description: 'Get all products in a specific category',
	})
	@ApiParam({
		name: 'categoryId',
		description: 'Category ID',
		example: 3,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved products',
		schema: {
			example: [
				{
					id: 1,
					name: 'iPhone 15 Pro',
					price: 30000000,
					quantity: 10,
					categoryId: 3,
					category: {
						id: 3,
						name: 'Mobile Phones',
					},
				},
			],
		},
	})
	findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
		return this.productsService.findByCategory(categoryId);
	}

	/**
	 * Get single product
	 */
	@Get(':id')
	@ApiOperation({
		summary: 'Get product by ID',
		description: 'Get detailed information of a product by ID',
	})
	@ApiParam({
		name: 'id',
		description: 'Product ID',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved product',
		schema: {
			example: {
				id: 1,
				name: 'iPhone 15 Pro',
				price: 30000000,
				quantity: 10,
				image: 'iphone15pro.jpg',
				categoryId: 3,
				createdAt: '2025-12-27T10:00:00.000Z',
				updatedAt: '2025-12-27T10:00:00.000Z',
				category: {
					id: 3,
					name: 'Mobile Phones',
					parentId: 1,
				},
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Product not found',
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.findOne(id);
	}

	/**
	 * Update product
	 */
	@Put(':id')
	@ApiOperation({
		summary: 'Update product',
		description: 'Update product information',
	})
	@ApiParam({
		name: 'id',
		description: 'Product ID to update',
		example: 1,
	})
	@ApiBody({
		type: UpdateProductDto,
		examples: {
			updatePrice: {
				summary: 'Update price',
				value: {
					price: 32000000,
				},
			},
			updateQuantity: {
				summary: 'Update quantity',
				value: {
					quantity: 15,
				},
			},
			updateAll: {
				summary: 'Update all fields',
				value: {
					name: 'iPhone 15 Pro Max',
					price: 35000000,
					quantity: 20,
					image: 'iphone15promax.jpg',
					categoryId: 3,
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Product updated successfully',
		schema: {
			example: {
				id: 1,
				name: 'iPhone 15 Pro Max',
				price: 35000000,
				quantity: 20,
				image: 'iphone15promax.jpg',
				categoryId: 3,
				createdAt: '2025-12-27T10:00:00.000Z',
				updatedAt: '2025-12-27T15:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Product not found',
	})
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProductDto: UpdateProductDto,
	) {
		return this.productsService.update(id, updateProductDto);
	}

	/**
	 * Delete product
	 */
	@Delete(':id')
	@ApiOperation({
		summary: 'Delete product',
		description: 'Delete a product from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'Product ID to delete',
		example: 9,
	})
	@ApiResponse({
		status: 200,
		description: 'Product deleted successfully',
		schema: {
			example: {
				message: 'Product deleted successfully',
				id: 9,
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Product not found',
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.remove(id);
	}
}
