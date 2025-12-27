import {
	IsEnum,
	IsOptional,
	IsString,
	IsArray,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderChannel } from '../entities/order.entity';
import { CreateOrderItemDto } from './create-order.dto';

export class UpdateOrderDto {
	@ApiPropertyOptional({
		description: 'Sales channel',
		enum: OrderChannel,
		example: OrderChannel.SHOPEE,
	})
	@IsOptional()
	@IsEnum(OrderChannel)
	channel?: OrderChannel;

	@ApiPropertyOptional({
		description: 'Customer name',
		example: 'Updated Customer Name',
	})
	@IsOptional()
	@IsString()
	customerName?: string;

	@ApiPropertyOptional({
		description: 'Customer phone number',
		example: '0912345678',
	})
	@IsOptional()
	@IsString()
	phone?: string;

	@ApiPropertyOptional({
		description: 'Customer email',
		example: 'updated@example.com',
	})
	@IsOptional()
	@IsString()
	email?: string;

	@ApiPropertyOptional({
		description: 'Shipping address',
		example: '456 New St, District 3, Ho Chi Minh City',
	})
	@IsOptional()
	@IsString()
	shippingAddress?: string;

	@ApiPropertyOptional({
		description: 'Order status',
		example: 'delivered',
	})
	@IsOptional()
	@IsString()
	status?: string;

	@ApiPropertyOptional({
		description: 'Order items (replaces all existing items)',
		type: [CreateOrderItemDto],
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateOrderItemDto)
	items?: CreateOrderItemDto[];
}
