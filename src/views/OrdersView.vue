<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchOrders } from '@/services/ecommerce'
import type { Order, PaginationMeta } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const orders = ref<Order[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)

const hasOrders = computed(() => orders.value.length > 0)

function statusClass(status: string): string {
  if (status === 'delivered') return 'badge badge--success'
  if (status === 'cancelled') return 'badge badge--danger'
  return 'badge badge--brand'
}

async function loadOrders(page = currentPage.value) {
  loading.value = true
  error.value = ''

  try {
    const result = await fetchOrders(page)
    orders.value = result.items
    meta.value = result.meta ?? null
    currentPage.value = meta.value?.current_page ?? page
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to load your order history.')
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || (meta.value && page > meta.value.last_page)) {
    return
  }

  loadOrders(page)
}

onMounted(() => loadOrders(1))
</script>

<template>
  <div class="stack">
    <section class="section">
      <div class="section__header">
        <div>
          <h1 class="section__title">Orders</h1>
          <p class="section__lead">Each customer only sees their own orders and order details.</p>
        </div>
        <RouterLink class="button button--ghost" to="/products">Shop more</RouterLink>
      </div>

      <div v-if="loading" class="empty-state">Loading orders...</div>
      <div v-else-if="error" class="notice notice--danger">{{ error }}</div>
      <div v-else-if="!hasOrders" class="empty-state">
        You have not placed an order yet. Start shopping to see your history here.
      </div>
      <div v-else class="grid orders-grid">
        <article v-for="order in orders" :key="order.id" class="panel order-card">
          <div class="order-card__header">
            <div>
              <p class="badge badge--muted">{{ order.order_number }}</p>
              <h3 class="order-card__title">Order #{{ order.order_number }}</h3>
            </div>
            <span :class="statusClass(order.status)">{{ order.status }}</span>
          </div>

          <div class="order-card__summary">
            <div>
              <span class="muted">Placed</span>
              <strong>{{ formatDate(order.created_at) }}</strong>
            </div>
            <div>
              <span class="muted">Payment</span>
              <strong>{{ order.payment_method ?? 'Pending' }}</strong>
            </div>
            <div>
              <span class="muted">Total</span>
              <strong>{{ formatCurrency(order.total) }}</strong>
            </div>
          </div>

          <div class="order-card__shipping">
            <strong>{{ order.shipping_name }}</strong>
            <p class="muted">
              {{ order.shipping_address }}, {{ order.shipping_city }}
              <span v-if="order.shipping_country">, {{ order.shipping_country }}</span>
            </p>
          </div>

          <div class="stack order-items">
            <article v-for="item in order.items" :key="item.id" class="order-item">
              <div>
                <strong>{{ item.product_name }}</strong>
                <p class="muted">SKU {{ item.product_sku ?? 'N/A' }} • Qty {{ item.quantity }}</p>
              </div>
              <strong>{{ formatCurrency(item.subtotal) }}</strong>
            </article>
          </div>
        </article>
      </div>

      <div v-if="meta && meta.last_page > 1" class="catalog-pagination">
        <button class="button button--ghost" type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
          Previous
        </button>
        <span class="catalog-pagination__meta">Page {{ meta.current_page }} of {{ meta.last_page }}</span>
        <button
          class="button button--ghost"
          type="button"
          :disabled="currentPage >= meta.last_page"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.orders-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.order-card {
  display: grid;
  gap: 1rem;
}

.order-card__header,
.order-card__summary,
.order-card__shipping {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.order-card__title {
  margin: 0.4rem 0 0;
  font-family: 'Source Serif 4', serif;
  font-size: 1.5rem;
}

.order-card__summary {
  padding: 0.9rem 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.order-card__summary div {
  display: grid;
  gap: 0.25rem;
}

.order-items {
  gap: 0.65rem;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--line);
}

.order-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
</style>
