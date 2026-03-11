import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
	@ApiProperty({
		description: 'ID of the order to create a Stripe Checkout session for',
		example: 1,
	})
	@IsNotEmpty()
	@IsInt()
	@Min(1)
	orderId: number;
}
