import axios from '~/utils/axios';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  categoryId?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  categoryId?: number;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  stock?: number;
  categoryId?: number;
  imageUrl?: string;
}

export interface ProductSearchParams {
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

class ProductService {
  private readonly endpoint = '/products';

  /**
   * Get all products
   */
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
    return axios.patch(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a product
   */
  async delete(id: number): Promise<void> {
    return axios.delete(`${this.endpoint}/${id}`);
  }
}

export default new ProductService();
