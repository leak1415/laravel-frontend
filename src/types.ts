export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page?: number
  total: number
}

export interface ApiListResult<T> {
  items: T[]
  meta?: PaginationMeta
}

export interface Category {
  id: number
  parent_id: number | null
  name: string
  slug: string | null
  description: string | null
  image: string | null
  is_active: boolean
  products_count?: number
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  category_id: number
  category: Category | null
  name: string
  slug: string | null
  sku: string | null
  short_description: string | null
  description: string | null
  price: number
  sale_price: number | null
  effective_price: number
  stock: number
  image: string | null
  is_active: boolean
  is_featured: boolean
  reviews_count?: number
  reviews_avg_rating?: number | null
  created_at?: string
  updated_at?: string
}

export interface Review {
  id: number
  user_id: number
  user_name: string | null
  product_id: number
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: number
  product_id: number
  product: Product | null
  quantity: number
  subtotal: number
  created_at?: string
  updated_at?: string
}

export interface WishlistItem {
  id: number
  product_id: number
  product: Product | null
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: number
  product_id: number | null
  product_name: string
  product_sku: string | null
  quantity: number
  unit_price: number
  price?: number
  subtotal: number
}

export interface Order {
  id: number
  user_id: number
  order_number: string
  subtotal: number
  total: number
  status: string
  payment_status: string
  payment_method: string | null
  shipping_name: string
  shipping_email: string | null
  shipping_address: string
  shipping_city: string
  shipping_state: string | null
  shipping_zip: string | null
  shipping_country: string | null
  shipping_phone: string | null
  discount: number
  shipping_fee: number
  tax: number
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface UpdateProfileResponse {
  message: string
  data: User
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends AuthCredentials {
  name: string
  password_confirmation: string
}

export interface UpdateProfilePayload {
  name: string
  email: string
  password?: string
  password_confirmation?: string
}

export interface ReviewPayload {
  product_id: number
  rating: number
  comment?: string
}

export interface CartPayload {
  product_id: number
  quantity: number
}

export interface UpdateCartPayload {
  quantity: number
}

export interface CheckoutPayload {
  shipping_name?: string
  shipping_email?: string
  shipping_address: string
  shipping_city: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  shipping_phone?: string
  payment_method?: string
  notes?: string
}

export interface ProductQuery {
  search?: string
  category_id?: number | string | null
  page?: number
}
