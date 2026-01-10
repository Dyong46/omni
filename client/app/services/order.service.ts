import axios from '~/utils/axios';

export interface Order {
  id: number;
  channel: 'offline' | 'shopee' | 'tiktok';
  customerName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  status: string;
  totalAmount: number;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
  };
}

export interface CreateOrderDto {
  channel: 'offline' | 'shopee' | 'tiktok';
  customerName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface UpdateOrderDto {
  channel?: 'offline' | 'shopee' | 'tiktok';
  customerName?: string;
  phone?: string;
  email?: string;
  shippingAddress?: string;
  status?: string;
}

export interface OrderFilters {
  channel?: 'offline' | 'shopee' | 'tiktok';
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  ordersByChannel: {
    channel: string;
    count: string;
    totalRevenue: string;
  }[];
  ordersByStatus: {
    status: string;
    count: string;
  }[];
}

class OrderService {
  private readonly endpoint = '/orders';

  /**
   * Get all orders with optional filters
   */
  async getAll(filters?: OrderFilters): Promise<Order[]> {
    return axios.get(this.endpoint, { params: filters });
  }

  /**
   * Get order statistics
   */
  async getStatistics(): Promise<OrderStatistics> {
    return axios.get(`${this.endpoint}/statistics`);
  }

  /**
   * Get recent orders
   */
  async getRecent(limit?: number): Promise<Order[]> {
    return axios.get(`${this.endpoint}/recent`, {
      params: { limit }
    });
  }

  /**
   * Get a single order by ID
   */
  async getById(id: number): Promise<Order> {
    return axios.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new order
   */
  async create(data: CreateOrderDto): Promise<Order> {
    return axios.post(this.endpoint, data);
  }

  /**
   * Update an order
   */
  async update(id: number, data: UpdateOrderDto): Promise<Order> {
    return axios.put(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete an order
   */
  async delete(id: number): Promise<void> {
    return axios.delete(`${this.endpoint}/${id}`);
  }
}

export default new OrderService();
