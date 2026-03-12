import axios from "~/utils/axios";

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryId?: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface CreateProductDto {
  name: string;
  price: number;
  quantity?: number;
  categoryId?: number;
  image?: string;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  quantity?: number;
  categoryId?: number;
  image?: string;
}

export interface UpdateInventoryDto {
   quantity: number;
   reason?: string;
   note?: string;
}

export interface InventoryMovement {
   id: number;
   productId: number;
   previousQuantity: number;
   newQuantity: number;
   changeQuantity: number;
   reason: string;
   note?: string | null;
   createdAt: string;
}

export interface ProductSearchParams {
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

class ProductService {
	private readonly endpoint = "/products";

	/**
   /* Get all products
   /* Update product inventory and create a movement log
    */
	async updateInventory(id: number, data: UpdateInventoryDto): Promise<Product> {
		return axios.put(`${this.endpoint}/${id}/inventory`, data);
	}

	/**
    * Get recent inventory movements for a product
    */
	async getInventoryMovements(id: number): Promise<InventoryMovement[]> {
		return axios.get(`${this.endpoint}/${id}/inventory-movements`);
	}

	async getAll(params?: ProductSearchParams): Promise<Product[]> {
		return axios.get(this.endpoint, { params });
	}

	/**
   * Search products
   */
	async search(query: string): Promise<Product[]> {
		return axios.get(`${this.endpoint}/search`, {
			params: { q: query }
		});
	}

	/**
   * Get a single product by ID
   */
	async getById(id: number): Promise<Product> {
		return axios.get(`${this.endpoint}/${id}`);
	}

	/**
   * Create a new product
   */
	async create(data: CreateProductDto): Promise<Product> {
		return axios.post(this.endpoint, data);
	}

	/**
   * Update a product
   */
	async update(id: number, data: UpdateProductDto): Promise<Product> {
		return axios.put(`${this.endpoint}/${id}`, data);
	}

	/**
   * Delete a product
   */
	async delete(id: number): Promise<void> {
		return axios.delete(`${this.endpoint}/${id}`);
	}
}

export default new ProductService();
