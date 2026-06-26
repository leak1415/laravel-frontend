<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Product } from '@/types'
import { formatCurrency, formatRating, ratingStars } from '@/utils/format'

defineProps<{
  product: Product
}>()
</script>

<template>
  <article class="product-card card card--interactive">
    <RouterLink class="product-card__media" :to="`/products/${product.id}`">
      <img v-if="product.image" class="card__image" :src="product.image" :alt="product.name" />
      <div v-else class="product-card__fallback">
        <span>{{ product.name.slice(0, 1) }}</span>
      </div>
      <span v-if="product.is_featured" class="product-card__chip badge badge--brand">Featured</span>
      <span v-else-if="product.sale_price" class="product-card__chip badge badge--success">On sale</span>
    </RouterLink>

    <div class="product-card__body">
      <div class="product-card__meta">
        <span class="badge badge--muted">{{ product.category?.name ?? 'Uncategorized' }}</span>
        <span class="rating">
          <span v-for="(filled, index) in ratingStars(product.reviews_avg_rating)" :key="index">
            {{ filled ? '★' : '☆' }}
          </span>
          <small>{{ formatRating(product.reviews_avg_rating) }}</small>
        </span>
      </div>

      <h3 class="product-card__title">
        <RouterLink :to="`/products/${product.id}`">{{ product.name }}</RouterLink>
      </h3>

      <p class="product-card__desc">{{ product.short_description ?? product.description }}</p>

      <div class="product-card__footer">
        <div class="product-card__prices">
          <span class="price">{{ formatCurrency(product.effective_price) }}</span>
          <span v-if="product.sale_price" class="price price--strike">{{ formatCurrency(product.price) }}</span>
        </div>
        <RouterLink class="button button--ghost" :to="`/products/${product.id}`">View</RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: grid;
  gap: 0;
  overflow: hidden;
}

.product-card__media {
  position: relative;
  display: block;
  text-decoration: none;
}

.product-card__fallback {
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(255, 138, 61, 0.25), rgba(143, 211, 255, 0.2));
  font-family: 'Source Serif 4', serif;
  font-size: 3rem;
}

.product-card__chip {
  position: absolute;
  left: 1rem;
  top: 1rem;
}

.product-card__body {
  display: grid;
  gap: 0.85rem;
  padding: 1.1rem 1.1rem 1.2rem;
}

.product-card__meta,
.product-card__footer {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.product-card__title {
  margin: 0;
  font-family: 'Source Serif 4', serif;
  font-size: 1.4rem;
  line-height: 1.15;
}

.product-card__title a {
  color: inherit;
}

.product-card__desc {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.product-card__prices {
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.rating {
  white-space: nowrap;
}
</style>
