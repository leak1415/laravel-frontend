<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { fetchCategories, fetchProducts } from '@/services/ecommerce'
import { isAuthenticated } from '@/stores/auth'
import type { Category, Product } from '@/types'
import { getErrorMessage } from '@/utils/error'

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')

async function loadHome() {
  loading.value = true
  error.value = ''

  try {
    const [categoryList, productList] = await Promise.all([
      fetchCategories(),
      fetchProducts({ page: 1 }),
    ])

    categories.value = categoryList
    products.value = productList.items
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to load the storefront.')
  } finally {
    loading.value = false
  }
}

const featuredProducts = computed(() => {
  const featured = products.value.filter((product) => product.is_featured)
  return (featured.length ? featured : products.value).slice(0, 6)
})

const topCategories = computed(() => categories.value.slice(0, 6))

const stats = computed(() => [
  { label: 'Categories', value: categories.value.length },
  { label: 'Products', value: products.value.length },
  { label: 'Featured', value: featuredProducts.value.length },
  { label: 'Protected flows', value: 8 },
])

onMounted(loadHome)
</script>

<template>
  <div class="stack">
    <section class="panel hero">
      <div class="hero__copy">
        <p class="hero__eyebrow badge badge--brand">Full Stack E-Commerce</p>
        <h1 class="title">A polished Laravel + Vue storefront with token auth, checkout, and order history.</h1>
        <p class="subtitle">
          Browse products, filter by category, save your wishlist, manage cart items, place orders,
          and update your profile in a clean modern interface built to match the backend spec.
        </p>

        <div class="actions">
          <RouterLink class="button button--primary" to="/products">Browse products</RouterLink>
          <RouterLink class="button button--ghost" :to="isAuthenticated ? '/cart' : '/login'">
            {{ isAuthenticated ? 'Open cart' : 'Sign in to shop' }}
          </RouterLink>
        </div>

        <div class="grid grid--stats">
          <article v-for="stat in stats" :key="stat.label" class="card">
            <div class="muted">{{ stat.label }}</div>
            <div class="home-stat">{{ stat.value }}</div>
          </article>
        </div>
      </div>

      <div class="hero__art">
        <p class="badge badge--muted">Included workflow</p>
        <div class="stack">
          <div class="hero__metric">
            <strong>Admin panel</strong>
            <span>Blade-based category, product, and order management</span>
          </div>
          <div class="hero__metric">
            <strong>REST API</strong>
            <span>Sanctum-protected cart, checkout, profile, and reviews</span>
          </div>
          <div class="hero__metric">
            <strong>Customer store</strong>
            <span>Products, wishlist, cart, and order history in Vue</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">Shop by category</h2>
          <p class="section__lead">Start with the major collections and jump straight into filtered product pages.</p>
        </div>
        <RouterLink class="button button--ghost" to="/products">View all categories</RouterLink>
      </div>

      <div v-if="loading" class="empty-state">Loading categories and products...</div>
      <div v-else-if="error" class="notice notice--danger">{{ error }}</div>
      <div v-else class="grid grid--cards">
        <RouterLink
          v-for="category in topCategories"
          :key="category.id"
          class="card card--interactive category-card"
          :to="{ name: 'products', query: { category_id: category.id } }"
        >
          <div class="badge badge--muted">{{ category.products_count ?? 0 }} products</div>
          <h3 class="category-card__title">{{ category.name }}</h3>
          <p class="category-card__desc">{{ category.description ?? 'Explore products in this collection.' }}</p>
        </RouterLink>
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">Featured products</h2>
          <p class="section__lead">A hand-picked slice of the catalog to show the product detail and cart flow.</p>
        </div>
        <RouterLink class="button button--ghost" to="/products">Browse catalog</RouterLink>
      </div>

      <div v-if="loading" class="empty-state">Loading featured products...</div>
      <div v-else-if="featuredProducts.length === 0" class="empty-state">
        No products are available yet.
      </div>
      <div v-else class="grid grid--cards">
        <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-stat {
  font-size: 1.35rem;
  font-weight: 800;
}

.category-card {
  display: grid;
  gap: 0.85rem;
}

.category-card__title {
  margin: 0;
  font-family: 'Source Serif 4', serif;
  font-size: 1.55rem;
}

.category-card__desc {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}
</style>
