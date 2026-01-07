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
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiQuery,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { AppConfigService } from './app-config.service';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('App Config')
@Controller('app-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppConfigController {
	constructor(private readonly appConfigService: AppConfigService) {}

	/**
	 * Create new config
	 */
	@Post()
	@ApiOperation({
		summary: 'Create new config',
		description: 'Create a new application configuration',
	})
	@ApiBody({
		type: CreateAppConfigDto,
		examples: {
			tiktok: {
				summary: 'TikTok config',
				value: {
					key: 'tiktok.app_id',
					value: 'your_app_id',
					category: 'tiktok',
					description: 'TikTok App ID for API integration',
				},
			},
			email: {
				summary: 'Email config',
				value: {
					key: 'email.smtp_host',
					value: 'smtp.gmail.com',
					category: 'email',
					description: 'SMTP host for sending emails',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Config created successfully',
	})
	create(@Body() createAppConfigDto: CreateAppConfigDto) {
		return this.appConfigService.create(createAppConfigDto);
	}

	/**
	 * Get all configs
	 */
	@Get()
	@ApiOperation({
		summary: 'Get all configs',
		description: 'Get all application configurations',
	})
	@ApiQuery({
		name: 'category',
		required: false,
		description: 'Filter by category',
		example: 'tiktok',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved configs',
	})
	findAll(@Query('category') category?: string) {
		return this.appConfigService.findAll(category);
	}

	/**
	 * Get all categories
	 */
	@Get('categories/list')
	@ApiOperation({
		summary: 'Get all config categories',
		description: 'Get list of all config categories',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved categories',
		schema: {
			example: ['tiktok', 'email', 'shopee', 'payment'],
		},
	})
	getCategories() {
		return this.appConfigService.getCategories();
	}

	/**
	 * Search configs
	 */
	@Get('search')
	@ApiOperation({
		summary: 'Search configs',
		description: 'Search configs by key or description',
	})
	@ApiQuery({
		name: 'q',
		required: true,
		description: 'Search term',
		example: 'tiktok',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved search results',
	})
	search(@Query('q') searchTerm: string) {
		return this.appConfigService.search(searchTerm);
	}

	/**
	 * Get config by key
	 */
	@Get('key/:key')
	@ApiOperation({
		summary: 'Get config by key',
		description: 'Get configuration by its key',
	})
	@ApiParam({
		name: 'key',
		description: 'Config key',
		example: 'tiktok.app_id',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved config',
	})
	@ApiResponse({
		status: 404,
		description: 'Config not found',
	})
	findByKey(@Param('key') key: string) {
		return this.appConfigService.findByKey(key);
	}

	/**
	 * Get config value by key
	 */
	@Get('value/:key')
	@ApiOperation({
		summary: 'Get config value by key',
		description: 'Get only the value of a configuration',
	})
	@ApiParam({
		name: 'key',
		description: 'Config key',
		example: 'tiktok.app_id',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved config value',
		schema: {
			example: 'your_app_id_here',
		},
	})
	getValue(@Param('key') key: string) {
		return this.appConfigService.getValue(key);
	}

	/**
	 * Update config by key
	 */
	@Put('key/:key')
	@ApiOperation({
		summary: 'Update config by key',
		description: 'Update configuration value by key',
	})
	@ApiParam({
		name: 'key',
		description: 'Config key to update',
		example: 'tiktok.app_id',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				value: {
					type: 'string',
					description: 'New config value',
					example: 'new_app_id_value',
				},
			},
			required: ['value'],
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Config updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Config not found',
	})
	updateByKey(@Param('key') key: string, @Body('value') value: string) {
		return this.appConfigService.updateByKey(key, value);
	}

	/**
	 * Delete config by key
	 */
	@Delete('key/:key')
	@ApiOperation({
		summary: 'Delete config by key',
		description: 'Delete configuration by key',
	})
	@ApiParam({
		name: 'key',
		description: 'Config key to delete',
		example: 'tiktok.app_id',
	})
	@ApiResponse({
		status: 200,
		description: 'Config deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Config not found',
	})
	removeByKey(@Param('key') key: string) {
		return this.appConfigService.removeByKey(key);
	}

	/**
	 * Get config by category
	 */
	@Get('category/:category')
	@ApiOperation({
		summary: 'Get configs by category',
		description: 'Get all configurations in a category',
	})
	@ApiParam({
		name: 'category',
		description: 'Config category',
		example: 'tiktok',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved configs',
	})
	findByCategory(@Param('category') category: string) {
		return this.appConfigService.findByCategory(category);
	}

	/**
	 * Get single config
	 */
	@Get(':id')
	@ApiOperation({
		summary: 'Get config by ID',
		description: 'Get configuration by its ID',
	})
	@ApiParam({
		name: 'id',
		description: 'Config ID',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved config',
	})
	@ApiResponse({
		status: 404,
		description: 'Config not found',
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.appConfigService.findOne(id);
	}

	/**
	 * Update config
	 */
	@Put(':id')
	@ApiOperation({
		summary: 'Update config',
		description: 'Update configuration',
	})
	@ApiParam({
		name: 'id',
		description: 'Config ID to update',
		example: 1,
	})
	@ApiBody({
		type: UpdateAppConfigDto,
		examples: {
			updateValue: {
				summary: 'Update value',
				value: {
					value: 'new_app_id',
				},
			},
			updateAll: {
				summary: 'Update all fields',
				value: {
					key: 'tiktok.app_secret',
					value: 'new_secret',
					category: 'tiktok',
					description: 'Updated TikTok App Secret',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Config updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Config not found',
	})
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateAppConfigDto: UpdateAppConfigDto,
	) {
		return this.appConfigService.update(id, updateAppConfigDto);
	}

	/**
	 * Delete config
	 */
	@Delete(':id')
	@ApiOperation({
		summary: 'Delete config',
		description: 'Delete a configuration',
	})
	@ApiParam({
		name: 'id',
		description: 'Config ID to delete',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Config deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Config not found',
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.appConfigService.remove(id);
	}
}
