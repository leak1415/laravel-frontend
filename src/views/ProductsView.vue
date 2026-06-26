<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { fetchCategories, fetchProducts } from '@/services/ecommerce'
import type { Category, PaginationMeta, Product } from '@/types'
import { getErrorMessage } from '@/utils/error'

const route = useRoute()
const router = useRouter()

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(true)
const error = ref('')
const search = ref('')
const categoryId = ref('')
const currentPage = ref(1)

const totalResults = computed(() => meta.value?.total ?? products.value.length)

function syncFiltersFromRoute() {
  search.value = typeof route.query.search === 'string' ? route.query.search : ''
  categoryId.value = typeof route.query.category_id === 'string' ? route.query.category_id : ''
  currentPage.value = typeof route.query.page === 'string' ? Number(route.query.page) || 1 : 1
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const [categoryList, productList] = await Promise.all([
      categories.value.length ? Promise.resolve(categories.value) : fetchCategories(),
      fetchProducts({
        search: search.value || undefined,
        category_id: categoryId.value || undefined,
        page: currentPage.value,
      }),
    ])

    categories.value = categoryList
    products.value = productList.items
    meta.value = productList.meta ?? null
    currentPage.value = meta.value?.current_page ?? currentPage.value
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to load products.')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  router.push({
    name: 'products',
    query: {
      ...(search.value ? { search: search.value } : {}),
      ...(categoryId.value ? { category_id: categoryId.value } : {}),
    },
  })
}

function resetFilters() {
  router.push({ name: 'products' })
}

function goToPage(page: number) {
  if (page < 1 || (meta.value && page > meta.value.last_page)) {
    return
  }

  router.push({
    name: 'products',
    query: {
      ...(search.value ? { search: search.value } : {}),
      ...(categoryId.value ? { category_id: categoryId.value } : {}),
      page,
    },
  })
}

watch(
  () => [route.query.search, route.query.category_id, route.query.page],
  async () => {
    syncFiltersFromRoute()
    await loadData()
  },
  { immediate: true },
)
</script>

<template>
  <div class="stack">
    <section class="panel hero">
      <div class="hero__copy">
        <p class="hero__eyebrow badge badge--brand">Product Catalog</p>
        <h1 class="title">Search, filter, and browse the public storefront API.</h1>
        <p class="subtitle">
          This page uses the Laravel public endpoints, category filter, and paginated product listing
          to power the customer shopping experience.
        </p>
        <div class="actions">
          <RouterLink class="button button--primary" to="/cart">Open cart</RouterLink>
          <RouterLink class="button button--ghost" to="/wishlist">Open wishlist</RouterLink>
        </div>
      </div>

      <div class="hero__art">
        <div class="stack">
          <div class="hero__metric">
            <strong>{{ totalResults }}</strong>
            <span>Products available in the catalog</span>
          </div>
          <div class="hero__metric">
            <strong>{{ categories.length }}</strong>
            <span>Filters from the API</span>
          </div>
          <div class="hero__metric">
            <strong>{{ meta?.last_page ?? 1 }}</strong>
            <span>Pages of results</span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel catalog-toolbar">
      <div class="field">
        <label class="field__label" for="search">Search products</label>
        <input
          id="search"
          v-model="search"
          class="input"
          type="search"
          placeholder="Headphones, jacket, speaker..."
          @keyup.enter="applyFilters"
        />
      </div>

      <div class="field">
        <label class="field__label" for="category">Category</label>
        <select id="category" v-model="categoryId" class="select">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category.id" :value="String(category.id)">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="catalog-toolbar__actions">
        <button class="button button--primary" type="button" @click="applyFilters">Apply</button>
        <button class="button button--ghost" type="button" @click="resetFilters">Reset</button>
      </div>
    </section>

    <div v-if="loading" class="empty-state">Loading products...</div>
    <div v-else-if="error" class="notice notice--danger">{{ error }}</div>
    <div v-else-if="products.length === 0" class="empty-state">
      No products match your filters.
    </div>
    <div v-else class="grid grid--cards">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>

    <div v-if="meta && meta.last_page > 1" class="catalog-pagination">
      <button class="button button--ghost" type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
        Previous
      </button>
      <span class="catalog-pagination__meta">
        Page {{ meta.current_page }} of {{ meta.last_page }}
      </span>
      <button
        class="button button--ghost"
        type="button"
        :disabled="currentPage >= meta.last_page"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.catalog-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(180px, 0.8fr) auto;
  gap: 1rem;
  align-items: end;
  padding: 1.1rem;
}

.catalog-toolbar__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.catalog-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.catalog-pagination__meta {
  color: var(--muted);
}

@media (max-width: 720px) {
  .catalog-toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
