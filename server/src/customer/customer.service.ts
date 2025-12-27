import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
	constructor(
		@InjectRepository(Customer)
		private readonly customerRepository: Repository<Customer>,
	) {}

	/**
	 * Create new customer
	 */
	async create(createCustomerDto: CreateCustomerDto) {
		const customer = this.customerRepository.create({
			name: createCustomerDto.name || null,
			email: createCustomerDto.email || null,
			phone: createCustomerDto.phone || null,
		});

		return this.customerRepository.save(customer);
	}

	/**
	 * Get all customers
	 */
	async findAll() {
		return this.customerRepository.find({
			order: { id: 'DESC' },
		});
	}

	/**
	 * Get single customer by ID
	 */
	async findOne(id: number) {
		const customer = await this.customerRepository.findOne({
			where: { id },
		});

		if (!customer) {
			throw new NotFoundException('Customer not found');
		}

		return customer;
	}

	/**
	 * Search customers by name, email, or phone
	 */
	async search(searchTerm: string) {
		return this.customerRepository
			.createQueryBuilder('customer')
			.where('customer.name LIKE :searchTerm', {
				searchTerm: `%${searchTerm}%`,
			})
			.orWhere('customer.email LIKE :searchTerm', {
				searchTerm: `%${searchTerm}%`,
			})
			.orWhere('customer.phone LIKE :searchTerm', {
				searchTerm: `%${searchTerm}%`,
			})
			.orderBy('customer.id', 'DESC')
			.getMany();
	}

	/**
	 * Find customer by phone
	 */
	async findByPhone(phone: string) {
		return this.customerRepository.findOne({
			where: { phone },
		});
	}

	/**
	 * Find customer by email
	 */
	async findByEmail(email: string) {
		return this.customerRepository.findOne({
			where: { email },
		});
	}

	/**
	 * Update customer
	 */
	async update(id: number, updateCustomerDto: UpdateCustomerDto) {
		const customer = await this.findOne(id);

		// Update fields if provided
		if (updateCustomerDto.name !== undefined) {
			customer.name = updateCustomerDto.name || null;
		}
		if (updateCustomerDto.email !== undefined) {
			customer.email = updateCustomerDto.email || null;
		}
		if (updateCustomerDto.phone !== undefined) {
			customer.phone = updateCustomerDto.phone || null;
		}

		return this.customerRepository.save(customer);
	}

	/**
	 * Delete customer
	 */
	async remove(id: number) {
		const customer = await this.findOne(id);
		await this.customerRepository.remove(customer);

		return {
			message: 'Customer deleted successfully',
			id,
		};
	}

	/**
	 * Get total number of customers
	 */
	async count() {
		return this.customerRepository.count();
	}

	/**
	 * Get recently added customers
	 */
	async findRecent(limit: number = 10) {
		return this.customerRepository.find({
			order: { createdAt: 'DESC' },
			take: limit,
		});
	}
}
