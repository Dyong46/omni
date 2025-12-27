import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
	@ApiProperty({
		description: 'Category name',
		example: 'Electronics',
	})
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiPropertyOptional({
		description: 'Parent category ID for nested categories',
		example: 1,
		nullable: true,
	})
	@IsOptional()
	@IsInt()
	parentId?: number | null;
}
