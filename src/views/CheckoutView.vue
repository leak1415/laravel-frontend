<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { checkout, fetchCart } from '@/services/ecommerce'
import { authUser } from '@/stores/auth'
import type { CartItem } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const router = useRouter()

const items = ref<CartItem[]>([])
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const notice = ref('')

const form = reactive({
  shipping_name: '',
  shipping_email: '',
  shipping_address: '',
  shipping_city: '',
  shipping_state: '',
  shipping_zip: '',
  shipping_country: 'Cambodia',
  shipping_phone: '',
  payment_method: 'cash_on_delivery',
  notes: '',
})

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + (item.subtotal ?? 0), 0),
)

const total = computed(() => subtotal.value)

async function loadCheckoutData() {
  loading.value = true
  error.value = ''

  try {
    items.value = await fetchCart()
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to load checkout data.')
  } finally {
    loading.value = false
  }
}

function fillFromProfile() {
  form.shipping_name = authUser.value?.name ?? form.shipping_name
  form.shipping_email = authUser.value?.email ?? form.shipping_email
}

async function handleSubmit() {
  submitting.value = true
  notice.value = ''
  error.value = ''

  try {
    await checkout({
      shipping_name: form.shipping_name || undefined,
      shipping_email: form.shipping_email || undefined,
      shipping_address: form.shipping_address,
      shipping_city: form.shipping_city,
      shipping_state: form.shipping_state || undefined,
      shipping_zip: form.shipping_zip || undefined,
      shipping_country: form.shipping_country || undefined,
      shipping_phone: form.shipping_phone || undefined,
      payment_method: form.payment_method || undefined,
      notes: form.notes || undefined,
    })

    notice.value = 'Order placed successfully.'
    await router.replace('/orders')
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to place your order.')
  } finally {
    submitting.value = false
  }
}

watch(
  authUser,
  () => {
    fillFromProfile()
  },
  { immediate: true },
)

onMounted(loadCheckoutData)
</script>

<template>
  <div class="stack">
    <section class="section">
      <div class="section__header">
        <div>
          <h1 class="section__title">Checkout</h1>
          <p class="section__lead">Send your shipping details and create the final order record.</p>
        </div>
        <RouterLink class="button button--ghost" to="/cart">Back to cart</RouterLink>
      </div>

      <div v-if="loading" class="empty-state">Loading checkout...</div>
      <div v-else-if="error" class="notice notice--danger">{{ error }}</div>
      <div v-else-if="items.length === 0" class="empty-state">
        Your cart is empty. Add products before checking out.
      </div>
      <div v-else class="split checkout-layout">
        <form class="panel checkout-form" @submit.prevent="handleSubmit">
          <div class="grid checkout-grid">
            <div class="field">
              <label class="field__label" for="shipping_name">Full name</label>
              <input id="shipping_name" v-model="form.shipping_name" class="input" type="text" required />
            </div>

            <div class="field">
              <label class="field__label" for="shipping_email">Email</label>
              <input id="shipping_email" v-model="form.shipping_email" class="input" type="email" required />
            </div>

            <div class="field checkout-grid__wide">
              <label class="field__label" for="shipping_address">Address</label>
              <input id="shipping_address" v-model="form.shipping_address" class="input" type="text" required />
            </div>

            <div class="field">
              <label class="field__label" for="shipping_city">City</label>
              <input id="shipping_city" v-model="form.shipping_city" class="input" type="text" required />
            </div>

            <div class="field">
              <label class="field__label" for="shipping_state">State / Province</label>
              <input id="shipping_state" v-model="form.shipping_state" class="input" type="text" />
            </div>

            <div class="field">
              <label class="field__label" for="shipping_zip">ZIP / Postal code</label>
              <input id="shipping_zip" v-model="form.shipping_zip" class="input" type="text" />
            </div>

            <div class="field">
              <label class="field__label" for="shipping_country">Country</label>
              <input id="shipping_country" v-model="form.shipping_country" class="input" type="text" />
            </div>

            <div class="field">
              <label class="field__label" for="shipping_phone">Phone</label>
              <input id="shipping_phone" v-model="form.shipping_phone" class="input" type="text" />
            </div>

            <div class="field">
              <label class="field__label" for="payment_method">Payment method</label>
              <select id="payment_method" v-model="form.payment_method" class="select">
                <option value="cash_on_delivery">Cash on delivery</option>
                <option value="credit_card">Credit card</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </div>

            <div class="field checkout-grid__wide">
              <label class="field__label" for="notes">Notes</label>
              <textarea
                id="notes"
                v-model="form.notes"
                class="textarea"
                rows="5"
                placeholder="Delivery notes or special instructions"
              />
            </div>
          </div>

          <p v-if="notice" class="notice">{{ notice }}</p>
          <p v-if="error" class="notice notice--danger">{{ error }}</p>

          <button class="button button--primary" type="submit" :disabled="submitting">
            {{ submitting ? 'Placing order...' : 'Place order' }}
          </button>
        </form>

        <aside class="panel checkout-summary">
          <p class="badge badge--brand">Order summary</p>
          <div class="stack">
            <article v-for="item in items" :key="item.id" class="checkout-summary__item">
              <div>
                <strong>{{ item.product?.name ?? 'Unknown product' }}</strong>
                <p class="muted">{{ item.quantity }} x {{ formatCurrency(item.product?.effective_price ?? 0) }}</p>
              </div>
              <strong>{{ formatCurrency(item.subtotal) }}</strong>
            </article>
          </div>

          <div class="checkout-summary__totals">
            <div class="checkout-summary__row">
              <span>Subtotal</span>
              <strong>{{ formatCurrency(subtotal) }}</strong>
            </div>
            <div class="checkout-summary__row">
              <span>Shipping</span>
              <strong>Included later</strong>
            </div>
            <div class="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <strong>{{ formatCurrency(total) }}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.checkout-form {
  display: grid;
  gap: 1rem;
}

.checkout-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkout-grid__wide {
  grid-column: 1 / -1;
}

.checkout-summary {
  display: grid;
  gap: 1rem;
  position: sticky;
  top: 6.5rem;
}

.checkout-summary__item,
.checkout-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
}

.checkout-summary__item {
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--line);
}

.checkout-summary__item p {
  margin: 0.35rem 0 0;
}

.checkout-summary__totals {
  display: grid;
  gap: 0.75rem;
}

.checkout-summary__row {
  color: var(--muted);
}

.checkout-summary__row--total {
  padding-top: 0.85rem;
  border-top: 1px solid var(--line);
  color: var(--text);
}

@media (max-width: 960px) {
  .checkout-summary {
    position: static;
  }
}

@media (max-width: 720px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
