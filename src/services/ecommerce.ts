import { api } from '@/services/api'
import { extractItem, extractList } from '@/utils/response'
import type {
  ApiListResult,
  Category,
  CartItem,
  CartPayload,
  CheckoutPayload,
  Order,
  Product,
  ProductQuery,
  Review,
  ReviewPayload,
  WishlistItem,
  UpdateCartPayload,
} from '@/types'

export interface ProductListResult extends ApiListResult<Product> {}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return extractList<Category>(data).items
}

export async function fetchProducts(query: ProductQuery = {}): Promise<ProductListResult> {
  const { data } = await api.get('/products', { params: query })
  return extractList<Product>(data)
}

export async function fetchProduct(id: number | string): Promise<Product> {
  const { data } = await api.get(`/products/${id}`)
  return extractItem<Product>(data)
}

export async function fetchProductReviews(id: number | string): Promise<Review[]> {
  const { data } = await api.get(`/products/${id}/reviews`)
  return extractList<Review>(data).items
}

export async function addToCart(payload: CartPayload): Promise<CartItem> {
  const { data } = await api.post('/cart', payload)
  return extractItem<CartItem>(data)
}

export async function fetchCart(): Promise<CartItem[]> {
  const { data } = await api.get('/cart')
  return extractList<CartItem>(data).items
}

export async function updateCartItem(id: number, payload: UpdateCartPayload): Promise<CartItem> {
  const { data } = await api.put(`/cart/${id}`, payload)
  return extractItem<CartItem>(data)
}

export async function removeCartItem(id: number): Promise<void> {
  await api.delete(`/cart/${id}`)
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const { data } = await api.get('/wishlist')
  return extractList<WishlistItem>(data).items
}

export async function addWishlist(productId: number): Promise<WishlistItem> {
  const { data } = await api.post('/wishlist', { product_id: productId })
  return extractItem<WishlistItem>(data)
}

export async function removeWishlist(id: number): Promise<void> {
  await api.delete(`/wishlist/${id}`)
}

export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const { data } = await api.post('/checkout', payload)
  return extractItem<Order>(data)
}

export async function fetchOrders(page?: number): Promise<ApiListResult<Order>> {
  const { data } = await api.get('/orders', { params: { page } })
  return extractList<Order>(data)
}

export async function addReview(payload: ReviewPayload): Promise<Review> {
  const { data } = await api.post('/reviews', payload)
  return extractItem<Review>(data)
}
