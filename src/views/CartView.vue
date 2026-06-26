<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { fetchCart, removeCartItem, updateCartItem } from '@/services/ecommerce'
import type { CartItem } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const router = useRouter()

const items = ref<CartItem[]>([])
const loading = ref(true)
const error = ref('')
const notice = ref('')
const syncingId = ref<number | null>(null)

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + (item.subtotal ?? 0), 0),
)

const grandTotal = computed(() => subtotal.value)

async function loadCart() {
  loading.value = true
  error.value = ''

  try {
    items.value = await fetchCart()
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to load your cart.')
  } finally {
    loading.value = false
  }
}

async function changeQuantity(item: CartItem, delta: number) {
  const nextQuantity = Math.max(1, item.quantity + delta)
  syncingId.value = item.id
  notice.value = ''

  try {
    const updated = await updateCartItem(item.id, { quantity: nextQuantity })
    items.value = items.value.map((entry) => (entry.id === item.id ? updated : entry))
    notice.value = 'Cart updated.'
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to update the cart.')
  } finally {
    syncingId.value = null
  }
}

async function handleRemove(item: CartItem) {
  syncingId.value = item.id
  notice.value = ''

  try {
    await removeCartItem(item.id)
    items.value = items.value.filter((entry) => entry.id !== item.id)
    notice.value = 'Item removed from cart.'
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to remove the cart item.')
  } finally {
    syncingId.value = null
  }
}

function startCheckout() {
  router.push('/checkout')
}

onMounted(loadCart)
</script>

<template>
  <div class="stack">
    <section class="section">
      <div class="section__header">
        <div>
          <h1 class="section__title">Cart</h1>
          <p class="section__lead">Review quantities, update items, and proceed to checkout.</p>
        </div>
        <RouterLink class="button button--ghost" to="/products">Continue shopping</RouterLink>
      </div>

      <p v-if="notice" class="notice">{{ notice }}</p>
      <div v-if="loading" class="empty-state">Loading cart...</div>
      <div v-else-if="error" class="notice notice--danger">{{ error }}</div>
      <div v-else-if="items.length === 0" class="empty-state">
        Your cart is empty. Add something from the catalog to continue.
      </div>
      <div v-else class="split cart-layout">
        <div class="stack">
          <article v-for="item in items" :key="item.id" class="card cart-card">
            <RouterLink v-if="item.product" :to="`/products/${item.product.id}`" class="cart-card__media">
              <img v-if="item.product.image" class="card__image" :src="item.product.image" :alt="item.product.name" />
              <div v-else class="cart-card__fallback">{{ item.product.name.slice(0, 1) }}</div>
            </RouterLink>

            <div class="cart-card__content">
              <div class="cart-card__head">
                <div>
                  <h3 class="cart-card__title">{{ item.product?.name ?? 'Unknown product' }}</h3>
                  <p class="muted">{{ item.product?.category?.name ?? 'Uncategorized' }}</p>
                </div>
                <span class="price">{{ formatCurrency(item.subtotal) }}</span>
              </div>

              <div class="cart-card__controls">
                <button
                  class="button button--ghost"
                  type="button"
                  :disabled="syncingId === item.id"
                  @click="changeQuantity(item, -1)"
                >
                  -
                </button>
                <span class="badge badge--muted">Qty {{ item.quantity }}</span>
                <button
                  class="button button--ghost"
                  type="button"
                  :disabled="syncingId === item.id"
                  @click="changeQuantity(item, 1)"
                >
                  +
                </button>
                <button
                  class="button button--danger"
                  type="button"
                  :disabled="syncingId === item.id"
                  @click="handleRemove(item)"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        </div>

        <aside class="panel cart-summary">
          <p class="badge badge--brand">Order summary</p>
          <div class="cart-summary__row">
            <span>Subtotal</span>
            <strong>{{ formatCurrency(subtotal) }}</strong>
          </div>
          <div class="cart-summary__row">
            <span>Shipping</span>
            <strong>Calculated at checkout</strong>
          </div>
          <div class="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <strong>{{ formatCurrency(grandTotal) }}</strong>
          </div>

          <button class="button button--primary" type="button" @click="startCheckout">Proceed to checkout</button>
          <RouterLink class="button button--ghost" to="/orders">View orders</RouterLink>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cart-layout {
  align-items: start;
}

.cart-card {
  display: grid;
  grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
  gap: 1rem;
}

.cart-card__media {
  display: block;
}

.cart-card__fallback {
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(255, 138, 61, 0.24), rgba(143, 211, 255, 0.18));
  font-family: 'Source Serif 4', serif;
  font-size: 3rem;
}

.cart-card__content {
  display: grid;
  gap: 1rem;
}

.cart-card__head,
.cart-card__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.cart-card__title {
  margin: 0;
  font-family: 'Source Serif 4', serif;
  font-size: 1.5rem;
}

.cart-summary {
  display: grid;
  gap: 1rem;
  position: sticky;
  top: 6.5rem;
}

.cart-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--muted);
}

.cart-summary__row--total {
  padding-top: 0.9rem;
  margin-top: 0.4rem;
  border-top: 1px solid var(--line);
  color: var(--text);
}

@media (max-width: 960px) {
  .cart-card {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}
</style>
