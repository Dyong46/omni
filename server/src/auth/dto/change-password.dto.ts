import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
	@ApiProperty({
		description: 'Current password for verification',
		example: 'oldpassword123',
		minLength: 6,
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	currentPassword: string;

	@ApiProperty({
		description: 'New password to set',
		example: 'newpassword123',
		minLength: 6,
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	newPassword: string;
}
