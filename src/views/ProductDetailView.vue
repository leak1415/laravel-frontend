<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addReview, addToCart, addWishlist, fetchProduct, fetchProductReviews } from '@/services/ecommerce'
import { authUser, isAuthenticated } from '@/stores/auth'
import type { Product, Review } from '@/types'
import { formatCurrency, formatDate, formatRating, ratingStars } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const route = useRoute()
const router = useRouter()

const product = ref<Product | null>(null)
const reviews = ref<Review[]>([])
const loading = ref(true)
const actionMessage = ref('')
const actionError = ref('')
const reviewMessage = ref('')
const reviewError = ref('')
const actionLoading = ref(false)
const reviewLoading = ref(false)
const quantity = ref(1)

const reviewForm = reactive({
  rating: 5,
  comment: '',
})

const productId = computed(() => String(route.params.id))

async function loadProduct() {
  loading.value = true
  actionError.value = ''
  reviewError.value = ''

  try {
    const [productData, reviewData] = await Promise.all([
      fetchProduct(productId.value),
      fetchProductReviews(productId.value),
    ])

    product.value = productData
    reviews.value = reviewData
    quantity.value = 1
  } catch (err) {
    actionError.value = getErrorMessage(err, 'Unable to load the product.')
  } finally {
    loading.value = false
  }
}

function requireAuth() {
  if (isAuthenticated.value) {
    return true
  }

  router.push({ name: 'login', query: { redirect: route.fullPath } })
  return false
}

async function handleAddToCart() {
  if (!product.value || !requireAuth()) {
    return
  }

  actionLoading.value = true
  actionMessage.value = ''
  actionError.value = ''

  try {
    await addToCart({
      product_id: product.value.id,
      quantity: quantity.value,
    })

    actionMessage.value = 'Added to cart.'
  } catch (err) {
    actionError.value = getErrorMessage(err, 'Unable to add the product to your cart.')
  } finally {
    actionLoading.value = false
  }
}

async function handleAddWishlist() {
  if (!product.value || !requireAuth()) {
    return
  }

  actionLoading.value = true
  actionMessage.value = ''
  actionError.value = ''

  try {
    await addWishlist(product.value.id)
    actionMessage.value = 'Saved to wishlist.'
  } catch (err) {
    actionError.value = getErrorMessage(err, 'Unable to save the product to your wishlist.')
  } finally {
    actionLoading.value = false
  }
}

async function handleReviewSubmit() {
  if (!product.value || !requireAuth()) {
    return
  }

  reviewLoading.value = true
  reviewMessage.value = ''
  reviewError.value = ''

  try {
    await addReview({
      product_id: product.value.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment || undefined,
    })

    reviewMessage.value = 'Review submitted successfully.'
    reviewForm.comment = ''
    reviews.value = await fetchProductReviews(productId.value)
  } catch (err) {
    reviewError.value = getErrorMessage(err, 'Unable to submit your review.')
  } finally {
    reviewLoading.value = false
  }
}

watch(productId, loadProduct, { immediate: true })
</script>

<template>
  <div class="stack">
    <div v-if="loading" class="empty-state">Loading product details...</div>
    <div v-else-if="actionError" class="notice notice--danger">{{ actionError }}</div>
    <template v-else-if="product">
      <section class="split">
        <article class="panel product-detail">
          <img v-if="product.image" class="product-detail__image" :src="product.image" :alt="product.name" />
          <div v-else class="product-detail__image product-detail__image--fallback">
            <span>{{ product.name.slice(0, 1) }}</span>
          </div>

          <div class="product-detail__content">
            <div class="product-detail__meta">
              <span class="badge badge--muted">{{ product.category?.name ?? 'Uncategorized' }}</span>
              <span v-if="product.is_featured" class="badge badge--brand">Featured</span>
              <span v-if="product.sale_price" class="badge badge--success">Sale</span>
            </div>

            <h1 class="section__title">{{ product.name }}</h1>
            <p class="subtitle">{{ product.short_description ?? product.description }}</p>

            <div class="product-detail__prices">
              <span class="price">{{ formatCurrency(product.effective_price) }}</span>
              <span v-if="product.sale_price" class="price price--strike">{{ formatCurrency(product.price) }}</span>
            </div>

            <div class="product-detail__stats">
              <span class="badge badge--muted">SKU {{ product.sku ?? 'N/A' }}</span>
              <span class="badge badge--muted">Stock {{ product.stock }}</span>
              <span class="badge badge--muted">
                {{ formatRating(product.reviews_avg_rating) }} stars
              </span>
            </div>

            <p class="product-detail__body">{{ product.description ?? 'No description available.' }}</p>
          </div>
        </article>

        <aside class="stack">
          <div class="panel product-cta">
            <p class="badge badge--brand">Buy now</p>
            <div class="field">
              <label class="field__label" for="quantity">Quantity</label>
              <input id="quantity" v-model.number="quantity" class="input" type="number" min="1" max="99" />
            </div>
            <div class="actions">
              <button class="button button--primary" type="button" :disabled="actionLoading" @click="handleAddToCart">
                {{ actionLoading ? 'Working...' : 'Add to cart' }}
              </button>
              <button class="button button--ghost" type="button" :disabled="actionLoading" @click="handleAddWishlist">
                Wishlist
              </button>
            </div>
            <p v-if="actionMessage" class="notice">{{ actionMessage }}</p>
            <RouterLink class="button button--ghost" to="/cart">Go to cart</RouterLink>
          </div>

          <div class="panel product-review-form">
            <p class="badge badge--muted">Write a review</p>
            <p v-if="!isAuthenticated" class="muted">
              <RouterLink class="button button--ghost" :to="{ name: 'login', query: { redirect: route.fullPath } }">
                Sign in
              </RouterLink>
              to review this product.
            </p>
            <form v-else class="stack" @submit.prevent="handleReviewSubmit">
              <div class="field">
                <label class="field__label" for="rating">Rating</label>
                <select id="rating" v-model.number="reviewForm.rating" class="select">
                  <option :value="5">5 - Excellent</option>
                  <option :value="4">4 - Great</option>
                  <option :value="3">3 - Good</option>
                  <option :value="2">2 - Fair</option>
                  <option :value="1">1 - Poor</option>
                </select>
              </div>

              <div class="field">
                <label class="field__label" for="comment">Comment</label>
                <textarea
                  id="comment"
                  v-model="reviewForm.comment"
                  class="textarea"
                  rows="5"
                  placeholder="What did you think of the product?"
                />
              </div>

              <button class="button button--primary" type="submit" :disabled="reviewLoading">
                {{ reviewLoading ? 'Submitting...' : 'Submit review' }}
              </button>
              <p v-if="reviewMessage" class="notice">{{ reviewMessage }}</p>
              <p v-if="reviewError" class="notice notice--danger">{{ reviewError }}</p>
            </form>
          </div>
        </aside>
      </section>

      <section class="section">
        <div class="section__header">
          <div>
            <h2 class="section__title">Customer reviews</h2>
            <p class="section__lead">
              {{ reviews.length }} review{{ reviews.length === 1 ? '' : 's' }} for this product.
            </p>
          </div>
        </div>

        <div v-if="reviews.length === 0" class="empty-state">No reviews yet. Be the first to leave one.</div>
        <div v-else class="grid review-list">
          <article v-for="review in reviews" :key="review.id" class="card review-card">
            <div class="review-card__top">
              <strong>{{ review.user_name ?? 'Anonymous' }}</strong>
              <span class="rating">
                <span v-for="(filled, index) in ratingStars(review.rating)" :key="index">
                  {{ filled ? '★' : '☆' }}
                </span>
              </span>
            </div>
            <p class="review-card__comment">{{ review.comment ?? 'No comment provided.' }}</p>
            <small class="muted">{{ formatDate(review.created_at) }}</small>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.product-detail {
  overflow: hidden;
}

.product-detail__image {
  width: 100%;
  aspect-ratio: 16 / 11;
  object-fit: cover;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.06);
}

.product-detail__image--fallback {
  display: grid;
  place-items: center;
  font-family: 'Source Serif 4', serif;
  font-size: 4rem;
  background: linear-gradient(135deg, rgba(255, 138, 61, 0.25), rgba(143, 211, 255, 0.18));
}

.product-detail__content {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.product-detail__meta,
.product-detail__stats {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.product-detail__prices {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.product-detail__body {
  margin: 0;
  color: var(--muted);
  line-height: 1.75;
}

.product-cta,
.product-review-form {
  display: grid;
  gap: 1rem;
}

.review-list {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.review-card {
  display: grid;
  gap: 0.8rem;
}

.review-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.review-card__comment {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}
</style>
