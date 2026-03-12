import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInventoryDto {
	@ApiProperty({
		description: 'New inventory quantity',
		example: 12,
	})
	@IsInt()
	@Min(0)
	quantity: number;

	@ApiPropertyOptional({
		description: 'Inventory adjustment reason',
		example: 'manual_adjustment',
	})
	@IsOptional()
	@IsString()
	reason?: string;

	@ApiPropertyOptional({
		description: 'Optional note for the inventory adjustment',
		example: 'Counted again after shelf audit',
	})
	@IsOptional()
	@IsString()
	note?: string;
}