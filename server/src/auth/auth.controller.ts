import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Put,
	Delete,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBody,
	ApiParam,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication & User Management')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Login
	 */
	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Login',
		description: 'Login to the system and receive JWT token',
	})
	@ApiBody({
		type: LoginDto,
		examples: {
			admin: {
				summary: 'Admin account',
				value: {
					username: 'admin',
					password: 'admin123',
				},
			},
			user: {
				summary: 'User account',
				value: {
					username: 'user01',
					password: 'password123',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Login successful',
		schema: {
			example: {
				access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				user: {
					id: 1,
					username: 'admin',
					role: 'admin',
					createdAt: '2025-12-27T10:00:00.000Z',
					updatedAt: '2025-12-27T10:00:00.000Z',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid credentials',
	})
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	/**
	 * Register new user
	 */
	@Public()
	@Post('register')
	@ApiOperation({
		summary: 'Register new account',
		description: 'Create a new user account in the system',
	})
	@ApiBody({
		type: CreateUserDto,
		examples: {
			example1: {
				summary: 'Register regular user',
				value: {
					username: 'newuser',
					password: 'password123',
					role: 'user',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Registration successful',
		schema: {
			example: {
				id: 5,
				username: 'newuser',
				role: 'user',
				createdAt: '2025-12-27T11:00:00.000Z',
				updatedAt: '2025-12-27T11:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Username already exists',
	})
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.createUser(createUserDto);
	}

	/**
	 * Create new user (for admin)
	 */
	@Post('users')
	@ApiOperation({
		summary: 'Create new user (Admin)',
		description: 'Admin creates a new user with custom permissions',
	})
	@ApiBody({
		type: CreateUserDto,
		examples: {
			admin: {
				summary: 'Create admin',
				value: {
					username: 'admin02',
					password: 'admin123456',
					role: 'admin',
				},
			},
			user: {
				summary: 'Create user',
				value: {
					username: 'user02',
					password: 'user123456',
					role: 'user',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'User created successfully',
		schema: {
			example: {
				id: 6,
				username: 'admin02',
				role: 'admin',
				createdAt: '2025-12-27T12:00:00.000Z',
				updatedAt: '2025-12-27T12:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Username already exists',
	})
	async createUser(@Body() createUserDto: CreateUserDto) {
		return this.authService.createUser(createUserDto);
	}

	/**
	 * Get all users
	 */
	@Get('users')
	@ApiOperation({
		summary: 'Get list of users',
		description: 'Get all users in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved list',
		schema: {
			example: [
				{
					id: 1,
					username: 'admin',
					role: 'admin',
					createdAt: '2025-12-27T10:00:00.000Z',
					updatedAt: '2025-12-27T10:00:00.000Z',
				},
				{
					id: 2,
					username: 'user01',
					role: 'user',
					createdAt: '2025-12-27T10:30:00.000Z',
					updatedAt: '2025-12-27T10:30:00.000Z',
				},
			],
		},
	})
	async getAllUsers() {
		return this.authService.getAllUsers();
	}

	/**
	 * Get user by ID
	 */
	@Get('users/:id')
	@ApiOperation({
		summary: 'Get user information',
		description: 'Get detailed user information by ID',
	})
	@ApiParam({
		name: 'id',
		description: 'User ID',
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved information',
		schema: {
			example: {
				id: 1,
				username: 'admin',
				role: 'admin',
				createdAt: '2025-12-27T10:00:00.000Z',
				updatedAt: '2025-12-27T10:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	async getUserById(@Param('id', ParseIntPipe) id: number) {
		return this.authService.getUserById(id);
	}

	/**
	 * Update user
	 */
	@Put('users/:id')
	@ApiOperation({
		summary: 'Update user',
		description: 'Update user information (username, password, role)',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the user to update',
		example: 1,
	})
	@ApiBody({
		type: UpdateUserDto,
		examples: {
			updateUsername: {
				summary: 'Change username',
				value: {
					username: 'newusername',
				},
			},
			updatePassword: {
				summary: 'Change password',
				value: {
					password: 'newpassword123',
				},
			},
			updateRole: {
				summary: 'Change role',
				value: {
					role: 'admin',
				},
			},
			updateAll: {
				summary: 'Update all fields',
				value: {
					username: 'updateduser',
					password: 'newpass123',
					role: 'user',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Update successful',
		schema: {
			example: {
				id: 1,
				username: 'updateduser',
				role: 'user',
				createdAt: '2025-12-27T10:00:00.000Z',
				updatedAt: '2025-12-27T13:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	@ApiResponse({
		status: 409,
		description: 'Username already exists',
	})
	async updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.authService.updateUser(id, updateUserDto);
	}

	/**
	 * Delete user
	 */
	@Delete('users/:id')
	@ApiOperation({
		summary: 'Delete user',
		description: 'Delete user from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the user to delete',
		example: 5,
	})
	@ApiResponse({
		status: 200,
		description: 'Delete successful',
		schema: {
			example: {
				message: 'User deleted successfully',
				id: 5,
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	async deleteUser(@Param('id', ParseIntPipe) id: number) {
		return this.authService.deleteUser(id);
	}

	/**
	 * Change password
	 */
	@Put('change-password/:id')
	@ApiOperation({
		summary: 'Change password',
		description:
			'Change user password with current password verification (User can only change their own password)',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the user changing password',
		example: 1,
	})
	@ApiBody({
		type: ChangePasswordDto,
		examples: {
			changePassword: {
				summary: 'Change password',
				value: {
					currentPassword: 'oldpassword123',
					newPassword: 'newpassword123',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Password changed successfully',
		schema: {
			example: {
				id: 1,
				username: 'admin',
				role: 'admin',
				createdAt: '2025-12-27T10:00:00.000Z',
				updatedAt: '2025-12-27T14:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Current password is incorrect',
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	@ApiResponse({
		status: 409,
		description: 'New password must be different from current password',
	})
	async changePassword(
		@Param('id', ParseIntPipe) id: number,
		@Body() changePasswordDto: ChangePasswordDto,
	) {
		return this.authService.changePassword(id, changePasswordDto);
	}
}
