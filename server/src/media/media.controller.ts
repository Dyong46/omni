import {
	Controller,
	Post,
	Delete,
	Get,
	Param,
	UploadedFile,
	UseInterceptors,
	UseGuards,
	BadRequestException,
	Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiConsumes,
	ApiBody,
	ApiParam,
	ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import type { Request } from 'express';

const ALLOWED_MIME_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
	constructor(private readonly mediaService: MediaService) {}

	@Post('upload')
	@ApiOperation({
		summary: 'Upload a product image (max 5 MB, jpg/png/webp/gif)',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' },
			},
		},
	})
	@ApiOkResponse({
		description: 'Returns the stored filename and public URL',
		schema: {
			example: {
				filename: 'a3f1bc2d-4e56-789f-abcd-ef0123456789.jpg',
				url: 'http://localhost:4000/uploads/images/a3f1bc2d-4e56-789f-abcd-ef0123456789.jpg',
				size: 204800,
			},
		},
	})
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads/images',
				filename: (_req, file, cb) => {
					cb(null, `${uuidv4()}${extname(file.originalname).toLowerCase()}`);
				},
			}),
			fileFilter: (_req, file, cb) => {
				if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
					return cb(
						new BadRequestException(
							`Unsupported file type "${file.mimetype}". Allowed: jpg, png, webp, gif`,
						),
						false,
					);
				}
				cb(null, true);
			},
			limits: { fileSize: MAX_FILE_SIZE },
		}),
	)
	uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
		if (!file) {
			throw new BadRequestException('No file provided');
		}

		const baseUrl = `${req.protocol}://${req.get('host')}`;

		return {
			filename: file.filename,
			url: this.mediaService.getFileUrl(file.filename, baseUrl),
			size: file.size,
		};
	}

	@Delete(':filename')
	@ApiOperation({ summary: 'Delete an uploaded image by filename' })
	@ApiParam({
		name: 'filename',
		example: 'a3f1bc2d-4e56-789f-abcd-ef0123456789.jpg',
	})
	@ApiOkResponse({
		schema: { example: { message: 'File deleted successfully' } },
	})
	deleteImage(@Param('filename') filename: string) {
		// Prevent path traversal
		if (filename.includes('/') || filename.includes('..')) {
			throw new BadRequestException('Invalid filename');
		}

		this.mediaService.deleteFile(filename);

		return { message: 'File deleted successfully' };
	}

	@Get()
	@ApiOperation({ summary: 'List all uploaded images' })
	@ApiOkResponse({
		schema: {
			example: [
				{
					filename: 'a3f1bc2d-4e56-789f-abcd-ef0123456789.jpg',
					size: 204800,
					uploadedAt: '2026-03-11T08:00:00.000Z',
				},
			],
		},
	})
	listImages() {
		return this.mediaService.listFiles();
	}
}
