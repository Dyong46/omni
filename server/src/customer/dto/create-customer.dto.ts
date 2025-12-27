import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
	@ApiPropertyOptional({
		description: 'Customer name',
		example: 'Nguyen Van A',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description: 'Customer email',
		example: 'customer@example.com',
	})
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({
		description: 'Customer phone number',
		example: '0901234567',
	})
	@IsOptional()
	@IsString()
	phone?: string;
}
