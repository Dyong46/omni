import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
	@ApiPropertyOptional({
		description: 'Category name',
		example: 'Updated Electronics',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description: 'Parent category ID',
		example: 2,
		nullable: true,
	})
	@IsOptional()
	@IsInt()
	parentId?: number | null;
}
