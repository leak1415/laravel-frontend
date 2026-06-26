<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { authUser, isAuthenticated, logout } from '@/stores/auth'

const router = useRouter()

const userName = computed(() => authUser.value?.name ?? 'Guest')
const userRole = computed(() => (authUser.value?.is_admin ? 'Admin' : 'Customer'))

async function handleLogout() {
  await logout()
  await router.push('/')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <RouterLink class="brand" to="/">
        <span class="brand__mark">A</span>
        <span>Aurora Market</span>
      </RouterLink>

      <nav class="nav" aria-label="Primary">
        <RouterLink class="nav__link" to="/">Home</RouterLink>
        <RouterLink class="nav__link" to="/products">Products</RouterLink>
        <RouterLink v-if="isAuthenticated" class="nav__link" to="/wishlist">Wishlist</RouterLink>
        <RouterLink v-if="isAuthenticated" class="nav__link" to="/cart">Cart</RouterLink>
        <RouterLink v-if="isAuthenticated" class="nav__link" to="/orders">Orders</RouterLink>
        <RouterLink v-if="isAuthenticated" class="nav__link" to="/profile">Profile</RouterLink>
      </nav>

      <div class="toolbar">
        <span v-if="isAuthenticated" class="badge badge--muted">
          {{ userName }} · {{ userRole }}
        </span>
        <template v-if="!isAuthenticated">
          <RouterLink class="button button--ghost" to="/login">Login</RouterLink>
          <RouterLink class="button button--primary" to="/register">Register</RouterLink>
        </template>
        <button v-else class="button button--ghost" type="button" @click="handleLogout">Logout</button>
      </div>
    </div>
  </header>
</template>
