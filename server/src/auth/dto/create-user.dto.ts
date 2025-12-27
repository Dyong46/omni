import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class CreateUserDto {
	@ApiProperty({
		description: 'Username (unique)',
		example: 'newuser',
	})
	@IsNotEmpty()
	@IsString()
	username: string;

	@ApiProperty({
		description: 'Password (minimum 6 characters)',
		example: 'password123',
		minLength: 6,
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(6, { message: 'Password must be at least 6 characters' })
	password: string;

	@ApiProperty({
		description: 'User role',
		enum: UserRole,
		example: UserRole.USER,
		required: false,
		default: UserRole.USER,
	})
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;
}
