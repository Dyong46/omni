import axios from "~/utils/axios";

export interface Customer {
  id: number;
  name?: string;
  email?: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name?: string;
  email?: string;
  phone: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerSearchParams {
  q?: string;
}

class CustomerService {
	private readonly endpoint = "/customer";

	/**
   * Get all customers
   */
	async getAll(params?: CustomerSearchParams): Promise<Customer[]> {
		return axios.get(this.endpoint, { params });
	}

	/**
   * Search customers
   */
	async search(query: string): Promise<Customer[]> {
		return axios.get(`${this.endpoint}/search`, {
			params: { q: query }
		});
	}

	/**
   * Get a single customer by ID
   */
	async getById(id: number): Promise<Customer> {
		return axios.get(`${this.endpoint}/${id}`);
	}

	/**
   * Create a new customer
   */
	async create(data: CreateCustomerDto): Promise<Customer> {
		return axios.post(this.endpoint, data);
	}

	/**
   * Update a customer
   */
	async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
		return axios.put(`${this.endpoint}/${id}`, data);
	}

	/**
   * Delete a customer
   */
	async delete(id: number): Promise<void> {
		return axios.delete(`${this.endpoint}/${id}`);
	}
}

export default new CustomerService();
