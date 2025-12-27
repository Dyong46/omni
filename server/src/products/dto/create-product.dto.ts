import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsInt,
	Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
	@ApiProperty({
		description: 'Product name',
		example: 'iPhone 15 Pro',
	})
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({
		description: 'Product price (in VND)',
		example: 30000000,
	})
	@IsNotEmpty()
	@IsInt()
	@Min(0)
	price: number;

	@ApiProperty({
		description: 'Product quantity in stock',
		example: 10,
		default: 0,
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	quantity?: number;

	@ApiPropertyOptional({
		description: 'Product image filename',
		example: 'iphone15pro.jpg',
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
