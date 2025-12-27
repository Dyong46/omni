import {
	Injectable,
	UnauthorizedException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Login - Authenticate user and return JWT token
	 */
	async login(loginDto: LoginDto) {
		const { username, password } = loginDto;

		// Find user by username
		const user = await this.userRepository.findOne({ where: { username } });
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		// Create JWT payload
		const payload = {
			sub: user.id,
			username: user.username,
			role: user.role,
		};

		// Return token and user info (excluding password)
		return {
			access_token: await this.jwtService.signAsync(payload),
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		};
	}

	/**
	 * Create new user
	 */
	async createUser(createUserDto: CreateUserDto) {
		const { username, password, role } = createUserDto;

		// Check if username already exists
		const existingUser = await this.userRepository.findOne({
			where: { username },
		});
		if (existingUser) {
			throw new ConflictException('Username already exists');
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const user = this.userRepository.create({
			username,
			password: hashedPassword,
			role: role || undefined, // Will use default value from entity
		});

		// Save to database
		const savedUser = await this.userRepository.save(user);

		// Return user info (excluding password)
		return {
			id: savedUser.id,
			username: savedUser.username,
			role: savedUser.role,
			createdAt: savedUser.createdAt,
			updatedAt: savedUser.updatedAt,
		};
	}

	/**
	 * Update user
	 */
	async updateUser(id: number, updateUserDto: UpdateUserDto) {
		// Check if user exists
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// If updating username, check for duplicates
		if (updateUserDto.username && updateUserDto.username !== user.username) {
			const existingUser = await this.userRepository.findOne({
				where: { username: updateUserDto.username },
			});
			if (existingUser) {
				throw new ConflictException('Username already exists');
			}
			user.username = updateUserDto.username;
		}

		// If updating password, hash new password
		if (updateUserDto.password) {
			user.password = await bcrypt.hash(updateUserDto.password, 10);
		}

		// Update role if provided
		if (updateUserDto.role) {
			user.role = updateUserDto.role;
		}

		// Save to database
		const updatedUser = await this.userRepository.save(user);

		// Return user info (excluding password)
		return {
			id: updatedUser.id,
			username: updatedUser.username,
			role: updatedUser.role,
			createdAt: updatedUser.createdAt,
			updatedAt: updatedUser.updatedAt,
		};
	}

	/**
	 * Delete user
	 */
	async deleteUser(id: number) {
		// Check if user exists
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// Delete user
		await this.userRepository.remove(user);

		return {
			message: 'User deleted successfully',
			id,
		};
	}

	/**
	 * Get all users
	 */
	async getAllUsers() {
		const users = await this.userRepository.find({
			select: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
		});
		return users;
	}

	/**
	 * Get user by ID
	 */
	async getUserById(id: number) {
		const user = await this.userRepository.findOne({
			where: { id },
			select: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return user;
	}

	/**
	 * Validate user for JWT strategy
	 */
	async validateUser(userId: number) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
			select: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
		});
		return user;
	}
}
