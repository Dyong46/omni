import axios from "~/utils/axios";

export interface UploadResult {
	filename: string;
	url: string;
	size: number;
}

class MediaService {
	async uploadImage(file: File): Promise<UploadResult> {
		const formData = new FormData();

		formData.append("file", file);

		return axios.post("/media/upload", formData, {
			headers: { "Content-Type": "multipart/form-data" }
		});
	}
}

export default new MediaService();
