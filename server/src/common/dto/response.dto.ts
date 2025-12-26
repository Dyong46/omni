import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
	@ApiProperty({ example: true })
	success: boolean;

	@ApiProperty({ example: 200 })
	statusCode: number;

	@ApiProperty({ example: 'Success' })
	message: string;

	@ApiProperty()
	data: T;

	@ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
	timestamp: string;
}

export class ErrorResponseDto {
	@ApiProperty({ example: false })
	success: boolean;

	@ApiProperty({ example: 400 })
	statusCode: number;

	@ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
	timestamp: string;

	@ApiProperty({ example: '/api/products' })
	path: string;

	@ApiProperty({ example: 'POST' })
	method: string;

	@ApiProperty({ example: 'Bad Request' })
	error: string;

	@ApiProperty({
		example: 'Validation failed',
		oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
	})
	message: string | string[];
}
