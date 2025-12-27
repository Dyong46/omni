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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}

	/**
	 * Create new customer
	 */
	@Post()
	@ApiOperation({
		summary: 'Create new customer',
		description: 'Create a new customer record',
	})
	@ApiBody({
		type: CreateCustomerDto,
		examples: {
			full: {
				summary: 'Customer with all info',
				value: {
					name: 'Nguyen Van A',
					email: 'a.nguyen@gmail.com',
					phone: '0901234567',
				},
			},
			minimal: {
				summary: 'Customer with phone only',
				value: {
					phone: '0987654321',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Customer created successfully',
		schema: {
			example: {
				id: 5,
				name: 'Nguyen Van A',
				email: 'a.nguyen@gmail.com',
				phone: '0901234567',
				createdAt: '2025-12-27T14:00:00.000Z',
				updatedAt: '2025-12-27T14:00:00.000Z',
			},
		},
	})
	create(@Body() createCustomerDto: CreateCustomerDto) {
		return this.customerService.create(createCustomerDto);
	}

	/**
	 * Get all customers
	 */
	@Get()
	@ApiOperation({
		summary: 'Get all customers',
		description: 'Get list of all customers',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved customers',
		schema: {
			example: [
				{
					id: 1,
					name: 'Nguyen Van A',
					email: 'a.nguyen@gmail.com',
					phone: '0901234567',
					createdAt: '2025-12-27T10:00:00.000Z',
					updatedAt: '2025-12-27T10:00:00.000Z',
				},
			],
		},
	})
	findAll() {
		return this.customerService.findAll();
	}

	/**
	 * Search customers
	 */
	@Get('search')
	@ApiOperation({
		summary: 'Search customers',
		description: 'Search customers by name, email, or phone',
	})
	@ApiQuery({
		name: 'q',
		required: true,
		description: 'Search term',
		example: 'Nguyen',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved search results',
		schema: {
			example: [
				{
					id: 1,
					name: 'Nguyen Van A',
					email: 'a.nguyen@gmail.com',
					phone: '0901234567',
				},
			],
		},
	})
	search(@Query('q') searchTerm: string) {
		return this.customerService.search(searchTerm);
	}

	/**
	 * Get customer statistics
	 */
	@Get('stats/count')
	@ApiOperation({
		summary: 'Get customer count',
		description: 'Get total number of customers',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved count',
		schema: {
			example: {
				count: 150,
			},
		},
	})
	async getCount() {
		const count = await this.customerService.count();
		return { count };
	}

	/**
	 * Get recent customers
	 */
	@Get('recent')
	@ApiOperation({
		summary: 'Get recent customers',
		description: 'Get recently added customers',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Number of customers to return',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved recent customers',
		schema: {
			example: [
				{
					id: 5,
					name: 'New Customer',
					email: 'new@example.com',
					phone: '0999999999',
					createdAt: '2025-12-27T15:00:00.000Z',
				},
			],
		},
	})
	findRecent(
		@Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
	) {
		return this.customerService.findRecent(limit);
	}

	/**
	 * Get single customer
	 */
	@Get(':id')
	@ApiOperation({
		summary: 'Get customer by ID',
		description: 'Get detailed information of a customer by ID',
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved customer',
		schema: {
			example: {
				id: 1,
				name: 'Nguyen Van A',
				email: 'a.nguyen@gmail.com',
				phone: '0901234567',
				createdAt: '2025-12-27T10:00:00.000Z',
				updatedAt: '2025-12-27T10:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Customer not found',
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.customerService.findOne(id);
	}

	/**
	 * Update customer
	 */
	@Put(':id')
	@ApiOperation({
		summary: 'Update customer',
		description: 'Update customer information',
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID to update',
		example: 1,
	})
	@ApiBody({
		type: UpdateCustomerDto,
		examples: {
			updateName: {
				summary: 'Update name',
				value: {
					name: 'Nguyen Van B',
				},
			},
			updateEmail: {
				summary: 'Update email',
				value: {
					email: 'newmail@example.com',
				},
			},
			updateAll: {
				summary: 'Update all fields',
				value: {
					name: 'Updated Name',
					email: 'updated@example.com',
					phone: '0988888888',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Customer updated successfully',
		schema: {
			example: {
				id: 1,
				name: 'Updated Name',
				email: 'updated@example.com',
				phone: '0988888888',
				createdAt: '2025-12-27T10:00:00.000Z',
				updatedAt: '2025-12-27T15:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Customer not found',
	})
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCustomerDto: UpdateCustomerDto,
	) {
		return this.customerService.update(id, updateCustomerDto);
	}

	/**
	 * Delete customer
	 */
	@Delete(':id')
	@ApiOperation({
		summary: 'Delete customer',
		description: 'Delete a customer from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID to delete',
		example: 5,
	})
	@ApiResponse({
		status: 200,
		description: 'Customer deleted successfully',
		schema: {
			example: {
				message: 'Customer deleted successfully',
				id: 5,
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Customer not found',
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.customerService.remove(id);
	}
}
