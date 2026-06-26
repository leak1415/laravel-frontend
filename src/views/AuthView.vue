<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { login, register } from '@/stores/auth'
import { getErrorMessage } from '@/utils/error'

const props = defineProps<{
  mode: 'login' | 'register'
}>()

const route = useRoute()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')

const isLogin = computed(() => props.mode === 'login')
const title = computed(() => (isLogin.value ? 'Customer sign in' : 'Create your customer account'))
const subtitle = computed(() =>
  isLogin.value
    ? 'Sign in as a customer to manage your wishlist, cart, checkout, and order history.'
    : 'Create a customer account to shop, save items, and place orders from the storefront.',
)
const submitLabel = computed(() => (isLogin.value ? 'Login' : 'Register'))
const toggleLabel = computed(() => (isLogin.value ? 'Create a new account' : 'Already have an account? Login'))
const toggleRoute = computed(() => (isLogin.value ? '/register' : '/login'))

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      await login({
        email: form.email,
        password: form.password,
      })
    } else {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (err) {
    error.value = getErrorMessage(
      err,
      isLogin.value ? 'Unable to sign in. Check your credentials.' : 'Unable to complete registration.',
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="panel auth-layout">
    <div class="auth-layout__copy">
      <p class="badge badge--brand">Secure access</p>
      <h1 class="title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>

      <div class="stack auth-points">
        <div class="card">
          <strong>Sanctum token auth</strong>
          <p class="muted">Tokens are stored in localStorage and sent with every protected API call.</p>
        </div>
        <div class="card">
          <strong>Protected pages</strong>
          <p class="muted">Wishlist, cart, checkout, orders, and profile routes stay behind auth.</p>
        </div>
        <div class="card">
          <strong>Customer storefront</strong>
          <p class="muted">This page is for customers only. Admins use the separate Blade login panel.</p>
        </div>
      </div>
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="field">
        <label class="field__label" for="email">Email</label>
        <input id="email" v-model="form.email" class="input" type="email" autocomplete="email" required />
      </div>

      <div v-if="!isLogin" class="field">
        <label class="field__label" for="name">Name</label>
        <input id="name" v-model="form.name" class="input" type="text" autocomplete="name" required />
      </div>

      <div class="field">
        <label class="field__label" for="password">Password</label>
        <input id="password" v-model="form.password" class="input" type="password" autocomplete="current-password" required />
      </div>

      <div v-if="!isLogin" class="field">
        <label class="field__label" for="password_confirmation">Confirm password</label>
        <input
          id="password_confirmation"
          v-model="form.password_confirmation"
          class="input"
          type="password"
          autocomplete="new-password"
          required
        />
      </div>

      <p v-if="error" class="notice notice--danger">{{ error }}</p>

      <button class="button button--primary" type="submit" :disabled="loading">
        {{ loading ? 'Working...' : submitLabel }}
      </button>

      <RouterLink class="button button--ghost" :to="toggleRoute">
        {{ toggleLabel }}
      </RouterLink>

      <p class="muted auth-form__note">
        Admin users should sign in through the backend admin login page.
      </p>
    </form>
  </section>
</template>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  gap: 1.25rem;
  padding: clamp(1.2rem, 2vw, 1.5rem);
}

.auth-layout__copy {
  display: grid;
  gap: 1rem;
}

.auth-points .card {
  box-shadow: none;
}

.auth-form {
  display: grid;
  gap: 1rem;
  align-content: start;
  padding: 1.2rem;
  border-radius: 1.3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
}

.auth-form__note {
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 960px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
}
</style>
