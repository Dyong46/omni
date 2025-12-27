import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsInt,
	IsArray,
	ValidateNested,
	ArrayMinSize,
	Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderChannel } from '../entities/order.entity';

export class CreateOrderItemDto {
	@ApiProperty({
		description: 'Product ID',
		example: 1,
	})
	@IsNotEmpty()
	@IsInt()
	productId: number;

	@ApiProperty({
		description: 'Quantity',
		example: 2,
		minimum: 1,
	})
	@IsNotEmpty()
	@IsInt()
	@Min(1)
	quantity: number;

	@ApiProperty({
		description: 'Price per unit (in VND)',
		example: 30000000,
	})
	@IsNotEmpty()
	@IsInt()
	@Min(0)
	price: number;
}

export class CreateOrderDto {
	@ApiProperty({
		description: 'Sales channel',
		enum: OrderChannel,
		example: OrderChannel.OFFLINE,
	})
	@IsNotEmpty()
	@IsEnum(OrderChannel)
	channel: OrderChannel;

	@ApiPropertyOptional({
		description: 'Customer name',
		example: 'Nguyen Van A',
	})
	@IsOptional()
	@IsString()
	customerName?: string;

	@ApiProperty({
		description: 'Customer phone number',
		example: '0901234567',
	})
	@IsNotEmpty()
	@IsString()
	phone: string;

	@ApiPropertyOptional({
		description: 'Customer email',
		example: 'customer@example.com',
	})
	@IsOptional()
	@IsString()
	email?: string;

	@ApiPropertyOptional({
		description: 'Shipping address',
		example: '123 Main St, District 1, Ho Chi Minh City',
	})
	@IsOptional()
	@IsString()
	shippingAddress?: string;

	@ApiPropertyOptional({
		description: 'Order status',
		example: 'pending',
	})
	@IsOptional()
	@IsString()
	status?: string;

	@ApiProperty({
		description: 'Order items',
		type: [CreateOrderItemDto],
		example: [
			{
				productId: 1,
				quantity: 2,
				price: 30000000,
			},
			{
				productId: 5,
				quantity: 1,
				price: 450000,
			},
		],
	})
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateOrderItemDto)
	items: CreateOrderItemDto[];
}
