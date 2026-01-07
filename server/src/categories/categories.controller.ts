import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	/**
	 * Create new category
	 */
	@Post()
	@ApiOperation({
		summary: 'Create new category',
		description: 'Create a new category with optional parent for nested hierarchy',
	})
	@ApiBody({
		type: CreateCategoryDto,
		examples: {
			rootCategory: {
				summary: 'Root category',
				value: {
					name: 'Electronics',
				},
			},
			childCategory: {
				summary: 'Child category',
				value: {
					name: 'Mobile Phones',
					parentId: 1,
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Category created successfully',
		schema: {
			example: {
				id: 7,
				name: 'Tablets',
				parentId: 1,
				createdAt: '2025-12-27T14:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Parent category not found',
	})
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto);
	}

	/**
	 * Get all categories (flat list)
	 */
	@Get()
	@ApiOperation({
		summary: 'Get all categories',
		description: 'Get all categories as a flat list',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved categories',
		schema: {
			example: [
				{
					id: 1,
					name: 'Electronics',
					parentId: null,
					createdAt: '2025-12-27T10:00:00.000Z',
				},
				{
					id: 3,
					name: 'Mobile Phones',
					parentId: 1,
					createdAt: '2025-12-27T10:00:00.000Z',
				},
			],
		},
	})
	findAll() {
		return this.categoriesService.findAll();
	}

	/**
	 * Get categories tree
	 */
	@Get('tree')
	@ApiOperation({
		summary: 'Get category tree',
		description: 'Get all categories in hierarchical tree structure',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved category tree',
		schema: {
			example: [
				{
					id: 1,
					name: 'Electronics',
					parentId: null,
					createdAt: '2025-12-27T10:00:00.000Z',
					children: [
						{
							id: 3,
							name: 'Mobile Phones',
							parentId: 1,
							createdAt: '2025-12-27T10:00:00.000Z',
						},
						{
							id: 4,
							name: 'Laptops',
							parentId: 1,
							createdAt: '2025-12-27T10:00:00.000Z',
						},
					],
				},
			],
		},
	})
	findTree() {
		return this.categoriesService.findTree();
	}

	/**
	 * Get single category
	 */
	@Get(':id')
	@ApiOperation({
		summary: 'Get category by ID',
		description: 'Get detailed information of a category by ID',
	})
	@ApiParam({
		name: 'id',
		description: 'Category ID',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved category',
		schema: {
			example: {
				id: 1,
				name: 'Electronics',
				parentId: null,
				createdAt: '2025-12-27T10:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Category not found',
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.findOne(id);
	}

	/**
	 * Get category with children
	 */
	@Get(':id/tree')
	@ApiOperation({
		summary: 'Get category with children',
		description: 'Get a category with all its nested children',
	})
	@ApiParam({
		name: 'id',
		description: 'Category ID',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved category tree',
		schema: {
			example: {
				id: 1,
				name: 'Electronics',
				parentId: null,
				createdAt: '2025-12-27T10:00:00.000Z',
				children: [
					{
						id: 3,
						name: 'Mobile Phones',
						parentId: 1,
						createdAt: '2025-12-27T10:00:00.000Z',
					},
				],
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Category not found',
	})
	findOneWithChildren(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.findOneWithChildren(id);
	}

	/**
	 * Get children of a category
	 */
	@Get(':id/children')
	@ApiOperation({
		summary: 'Get category children',
		description: 'Get direct children of a category',
	})
	@ApiParam({
		name: 'id',
		description: 'Parent category ID',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved children',
		schema: {
			example: [
				{
					id: 3,
					name: 'Mobile Phones',
					parentId: 1,
					createdAt: '2025-12-27T10:00:00.000Z',
				},
				{
					id: 4,
					name: 'Laptops',
					parentId: 1,
					createdAt: '2025-12-27T10:00:00.000Z',
				},
			],
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Category not found',
	})
	findChildren(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.findChildren(id);
	}

	/**
	 * Update category
	 */
	@Put(':id')
	@ApiOperation({
		summary: 'Update category',
		description: 'Update category information',
	})
	@ApiParam({
		name: 'id',
		description: 'Category ID to update',
		example: 1,
	})
	@ApiBody({
		type: UpdateCategoryDto,
		examples: {
			updateName: {
				summary: 'Update name only',
				value: {
					name: 'Consumer Electronics',
				},
			},
			updateParent: {
				summary: 'Change parent',
				value: {
					parentId: 2,
				},
			},
			updateAll: {
				summary: 'Update all fields',
				value: {
					name: 'Updated Electronics',
					parentId: null,
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Category updated successfully',
		schema: {
			example: {
				id: 1,
				name: 'Consumer Electronics',
				parentId: null,
				createdAt: '2025-12-27T10:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request (circular reference or self-parent)',
	})
	@ApiResponse({
		status: 404,
		description: 'Category not found',
	})
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCategoryDto: UpdateCategoryDto,
	) {
		return this.categoriesService.update(id, updateCategoryDto);
	}

	/**
	 * Delete category
	 */
	@Delete(':id')
	@ApiOperation({
		summary: 'Delete category',
		description: 'Delete a category (must have no children)',
	})
	@ApiParam({
		name: 'id',
		description: 'Category ID to delete',
		example: 7,
	})
	@ApiResponse({
		status: 200,
		description: 'Category deleted successfully',
		schema: {
			example: {
				message: 'Category deleted successfully',
				id: 7,
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Category not found',
	})
	@ApiResponse({
		status: 409,
		description: 'Category has children',
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.categoriesService.remove(id);
	}
}
