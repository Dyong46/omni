import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAppConfigDto {
	@ApiProperty({
		description: 'Config key (unique)',
		example: 'tiktok.app_id',
	})
	@IsNotEmpty()
	@IsString()
	key: string;

	@ApiProperty({
		description: 'Config value',
		example: 'your_tiktok_app_id_here',
	})
	@IsNotEmpty()
	@IsString()
	value: string;

	@ApiProperty({
		description: 'Config category for grouping',
		example: 'tiktok',
		required: false,
	})
	@IsOptional()
	@IsString()
	category?: string;

	@ApiProperty({
		description: 'Description of the config',
		example: 'TikTok App ID for API integration',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;
}
