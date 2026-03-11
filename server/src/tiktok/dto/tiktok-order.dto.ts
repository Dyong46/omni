import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Mirrors the TikTok Shop webhook payload for order creation.
 * Reference: https://partner.tiktokshop.com/docv2/page/649a54c0e7b2d202fb1c899e
 */

export class TikTokBuyerInfoDto {
	@ApiPropertyOptional({ example: 'Nguyen Van A' })
	@IsOptional()
	@IsString()
	buyer_name?: string;

	@ApiPropertyOptional({ example: 'buyer@example.com' })
	@IsOptional()
	@IsString()
	email?: string;

	@ApiProperty({ example: '0901234567' })
	@IsNotEmpty()
	@IsString()
	phone: string;
}

export class TikTokRecipientAddressDto {
	@ApiPropertyOptional({ example: '123 Lê Lợi, Quận 1, TP. Hồ Chí Minh' })
	@IsOptional()
	@IsString()
	full_address?: string;
}

export class TikTokOrderItemDto {
	@ApiProperty({
		description: 'Internal product ID in your system',
		example: 1,
	})
	@IsNotEmpty()
	@IsNumber()
	product_id: number;

	@ApiProperty({ example: 2 })
	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	quantity: number;

	@ApiProperty({ description: 'Sale price per unit in VND', example: 250000 })
	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	sale_price: number;
}

export class TikTokOrderDataDto {
	@ApiPropertyOptional({
		description: 'TikTok order ID',
		example: 'TT-20260311-000123',
	})
	@IsOptional()
	@IsString()
	order_id?: string;

	@ApiProperty({ type: TikTokBuyerInfoDto })
	@IsNotEmpty()
	@ValidateNested()
	@Type(() => TikTokBuyerInfoDto)
	buyer_info: TikTokBuyerInfoDto;

	@ApiPropertyOptional({ type: TikTokRecipientAddressDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => TikTokRecipientAddressDto)
	recipient_address?: TikTokRecipientAddressDto;

	@ApiProperty({ type: [TikTokOrderItemDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TikTokOrderItemDto)
	item_list: TikTokOrderItemDto[];
}

/** Top-level TikTok webhook envelope */
export class TikTokWebhookDto {
	@ApiPropertyOptional({ example: 'ORDER_STATUS_CHANGE' })
	@IsOptional()
	@IsString()
	type?: string;

	@ApiProperty({ type: TikTokOrderDataDto })
	@IsNotEmpty()
	@ValidateNested()
	@Type(() => TikTokOrderDataDto)
	data: TikTokOrderDataDto;
}
