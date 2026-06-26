<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { addToCart, fetchWishlist, removeWishlist } from '@/services/ecommerce'
import type { WishlistItem } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const items = ref<WishlistItem[]>([])
const loading = ref(true)
const error = ref('')
const actionMessage = ref('')

async function loadWishlist() {
  loading.value = true
  error.value = ''

  try {
    items.value = await fetchWishlist()
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to load your wishlist.')
  } finally {
    loading.value = false
  }
}

async function handleRemove(item: WishlistItem) {
  actionMessage.value = ''
  try {
    await removeWishlist(item.id)
    items.value = items.value.filter((entry) => entry.id !== item.id)
    actionMessage.value = 'Removed from wishlist.'
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to remove the item.')
  }
}

async function handleAddToCart(item: WishlistItem) {
  if (!item.product) {
    return
  }

  actionMessage.value = ''

  try {
    await addToCart({
      product_id: item.product.id,
      quantity: 1,
    })

    actionMessage.value = 'Added to cart.'
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to move the item to your cart.')
  }
}

onMounted(loadWishlist)
</script>

<template>
  <div class="stack">
    <section class="section">
      <div class="section__header">
        <div>
          <h1 class="section__title">Wishlist</h1>
          <p class="section__lead">Store the products you want to revisit later.</p>
        </div>
        <RouterLink class="button button--ghost" to="/products">Continue shopping</RouterLink>
      </div>

      <p v-if="actionMessage" class="notice">{{ actionMessage }}</p>
      <div v-if="loading" class="empty-state">Loading wishlist...</div>
      <div v-else-if="error" class="notice notice--danger">{{ error }}</div>
      <div v-else-if="items.length === 0" class="empty-state">
        Your wishlist is empty. Explore the catalog and save products you love.
      </div>
      <div v-else class="grid grid--cards">
        <article v-for="item in items" :key="item.id" class="card card--interactive wishlist-card">
          <RouterLink v-if="item.product" :to="`/products/${item.product.id}`">
            <img v-if="item.product.image" class="card__image" :src="item.product.image" :alt="item.product.name" />
            <div v-else class="wishlist-card__fallback">{{ item.product.name.slice(0, 1) }}</div>
          </RouterLink>

          <div class="stack">
            <div class="wishlist-card__meta">
              <span class="badge badge--muted">{{ item.product?.category?.name ?? 'Product' }}</span>
              <span class="price">{{ formatCurrency(item.product?.effective_price ?? 0) }}</span>
            </div>
            <h3 class="wishlist-card__title">{{ item.product?.name ?? 'Unknown product' }}</h3>
            <p class="muted">{{ item.product?.short_description ?? 'No description available.' }}</p>
          </div>

          <div class="actions">
            <button class="button button--primary" type="button" @click="handleAddToCart(item)">Add to cart</button>
            <button class="button button--ghost" type="button" @click="handleRemove(item)">Remove</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wishlist-card {
  display: grid;
  gap: 1rem;
}

.wishlist-card__fallback {
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(255, 138, 61, 0.26), rgba(143, 211, 255, 0.18));
  font-family: 'Source Serif 4', serif;
  font-size: 3rem;
}

.wishlist-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.wishlist-card__title {
  margin: 0;
  font-family: 'Source Serif 4', serif;
  font-size: 1.45rem;
}
</style>
