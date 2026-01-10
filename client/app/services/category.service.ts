import axios from "~/utils/axios";

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CreateCategoryDto {
  name: string;
  parentId?: number | null;
}

export interface UpdateCategoryDto {
  name?: string;
  parentId?: number | null;
}

class CategoryService {
	private readonly endpoint = "/categories";

	/**
   * Get all categories (flat list)
   */
	async getAll(): Promise<Category[]> {
		return axios.get(this.endpoint);
	}

	/**
   * Get categories as tree structure
   */
	async getTree(): Promise<Category[]> {
		return axios.get(`${this.endpoint}/tree`);
	}

	/**
   * Get a single category by ID
   */
	async getById(id: number): Promise<Category> {
		return axios.get(`${this.endpoint}/${id}`);
	}

	/**
   * Create a new category
   */
	async create(data: CreateCategoryDto): Promise<Category> {
		return axios.post(this.endpoint, data);
	}

	/**
   * Update a category
   */
	async update(id: number, data: UpdateCategoryDto): Promise<Category> {
		return axios.patch(`${this.endpoint}/${id}`, data);
	}

	/**
   * Delete a category
   */
	async delete(id: number): Promise<void> {
		return axios.delete(`${this.endpoint}/${id}`);
	}
}

export default new CategoryService();
