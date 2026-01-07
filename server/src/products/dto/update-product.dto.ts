import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
	@ApiPropertyOptional({
		description: 'Product name',
		example: 'iPhone 15 Pro Max',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description: 'Product price (in VND)',
		example: 35000000,
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	price?: number;

	@ApiPropertyOptional({
		description: 'Product quantity in stock',
		example: 15,
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	quantity?: number;

	@ApiPropertyOptional({
		description: 'Product image filename',
		example: 'iphone15promax.jpg',
	})
	@IsOptional()
	@IsString()
	image?: string;

	@ApiPropertyOptional({
		description: 'Category ID',
		example: 3,
	})
	@IsOptional()
	@IsInt()
	categoryId?: number;
}
