import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AppConfig } from './entities/app-config.entity';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';

@Injectable()
export class AppConfigService {
	constructor(
		@InjectRepository(AppConfig)
		private readonly appConfigRepository: Repository<AppConfig>,
	) {}

	/**
	 * Create new config
	 */
	async create(createAppConfigDto: CreateAppConfigDto): Promise<AppConfig> {
		const config = this.appConfigRepository.create(createAppConfigDto);
		return await this.appConfigRepository.save(config);
	}

	/**
	 * Get all configs
	 */
	async findAll(category?: string): Promise<AppConfig[]> {
		if (category) {
			return await this.appConfigRepository.find({
				where: { category },
				order: { key: 'ASC' },
			});
		}
		return await this.appConfigRepository.find({
			order: { category: 'ASC', key: 'ASC' },
		});
	}

	/**
	 * Get config by ID
	 */
	async findOne(id: number): Promise<AppConfig> {
		const config = await this.appConfigRepository.findOne({ where: { id } });
		if (!config) {
			throw new NotFoundException(`Config with ID ${id} not found`);
		}
		return config;
	}

	/**
	 * Get config by key
	 */
	async findByKey(key: string): Promise<AppConfig> {
		const config = await this.appConfigRepository.findOne({ where: { key } });
		if (!config) {
			throw new NotFoundException(`Config with key ${key} not found`);
		}
		return config;
	}

	/**
	 * Get config value by key
	 */
	async getValue(key: string): Promise<string> {
		const config = await this.findByKey(key);
		return config.value;
	}

	/**
	 * Search configs
	 */
	async search(searchTerm: string): Promise<AppConfig[]> {
		return await this.appConfigRepository.find({
			where: [
				{ key: Like(`%${searchTerm}%`) },
				{ description: Like(`%${searchTerm}%`) },
			],
			order: { key: 'ASC' },
		});
	}

	/**
	 * Update config
	 */
	async update(
		id: number,
		updateAppConfigDto: UpdateAppConfigDto,
	): Promise<AppConfig> {
		const config = await this.findOne(id);
		Object.assign(config, updateAppConfigDto);
		return await this.appConfigRepository.save(config);
	}

	/**
	 * Update config by key
	 */
	async updateByKey(
		key: string,
		value: string,
	): Promise<AppConfig> {
		const config = await this.findByKey(key);
		config.value = value;
		return await this.appConfigRepository.save(config);
	}

	/**
	 * Delete config
	 */
	async remove(id: number): Promise<{ message: string; id: number }> {
		const config = await this.findOne(id);
		await this.appConfigRepository.remove(config);
		return {
			message: 'Config deleted successfully',
			id,
		};
	}

	/**
	 * Delete config by key
	 */
	async removeByKey(key: string): Promise<{ message: string; key: string }> {
		const config = await this.findByKey(key);
		await this.appConfigRepository.remove(config);
		return {
			message: 'Config deleted successfully',
			key,
		};
	}

	/**
	 * Get configs by category
	 */
	async findByCategory(category: string): Promise<AppConfig[]> {
		return await this.appConfigRepository.find({
			where: { category },
			order: { key: 'ASC' },
		});
	}

	/**
	 * Get all categories
	 */
	async getCategories(): Promise<string[]> {
		const result = await this.appConfigRepository
			.createQueryBuilder('config')
			.select('DISTINCT config.category', 'category')
			.where('config.category IS NOT NULL')
			.getRawMany();

		return result.map((r) => r.category);
	}
}
