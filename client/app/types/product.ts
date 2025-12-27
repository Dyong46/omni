export interface Product {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  categoryId?: number
  createdAt?: string
  updatedAt?: string
  category?: {
    id: number
    name: string
    parentId?: number
  }
}

export interface Category {
  id: number
  name: string
  parentId?: number
}
