import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomerDto {
	@ApiPropertyOptional({
		description: 'Customer name',
		example: 'Nguyen Van B',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description: 'Customer email',
		example: 'updated@example.com',
	})
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({
		description: 'Customer phone number',
		example: '0912345678',
	})
	@IsOptional()
	@IsString()
	phone?: string;
}
