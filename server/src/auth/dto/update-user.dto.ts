import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class UpdateUserDto {
	@ApiPropertyOptional({
		description: 'New username',
		example: 'updateduser',
	})
	@IsOptional()
	@IsString()
	username?: string;

	@ApiPropertyOptional({
		description: 'New password (minimum 6 characters)',
		example: 'newpassword123',
		minLength: 6,
	})
	@IsOptional()
	@IsString()
	@MinLength(6, { message: 'Password must be at least 6 characters' })
	password?: string;

	@ApiPropertyOptional({
		description: 'New user role',
		enum: UserRole,
		example: UserRole.ADMIN,
	})
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;
}
