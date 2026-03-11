import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class MediaService {
	private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'images');

	getFileUrl(filename: string, baseUrl: string): string {
		return `${baseUrl}/uploads/images/${filename}`;
	}

	deleteFile(filename: string): void {
		const filePath = path.join(this.uploadsDir, filename);

		if (!fs.existsSync(filePath)) {
			throw new NotFoundException(`File "${filename}" not found`);
		}

		fs.unlinkSync(filePath);
	}

	listFiles(): { filename: string; size: number; uploadedAt: Date }[] {
		if (!fs.existsSync(this.uploadsDir)) {
			return [];
		}

		return fs
			.readdirSync(this.uploadsDir)
			.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
			.map((filename) => {
				const stat = fs.statSync(path.join(this.uploadsDir, filename));

				return {
					filename,
					size: stat.size,
					uploadedAt: stat.birthtime,
				};
			})
			.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
	}
}
