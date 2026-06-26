<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { authUser, updateProfile } from '@/stores/auth'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const notice = ref('')

const memberSince = computed(() => formatDate(authUser.value?.created_at ?? null))

watch(
  authUser,
  () => {
    form.name = authUser.value?.name ?? ''
    form.email = authUser.value?.email ?? ''
  },
  { immediate: true },
)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    await updateProfile({
      name: form.name,
      email: form.email,
      ...(form.password
        ? {
            password: form.password,
            password_confirmation: form.password_confirmation,
          }
        : {}),
    })

    notice.value = 'Profile updated successfully.'
    form.password = ''
    form.password_confirmation = ''
  } catch (err) {
    error.value = getErrorMessage(err, 'Unable to update your profile.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="stack">
    <section class="section">
      <div class="section__header">
        <div>
          <h1 class="section__title">Profile</h1>
          <p class="section__lead">Update your profile details or change your password.</p>
        </div>
      </div>

      <div class="split profile-layout">
        <aside class="panel profile-summary">
          <p class="badge badge--brand">Account</p>
        <div class="stack">
            <div>
              <div class="muted">Name</div>
              <strong>{{ authUser?.name }}</strong>
            </div>
            <div>
              <div class="muted">Email</div>
              <strong>{{ authUser?.email }}</strong>
            </div>
            <div>
              <div class="muted">Role</div>
              <strong>{{ authUser?.is_admin ? 'Admin' : 'Customer' }}</strong>
            </div>
            <div>
              <div class="muted">Member since</div>
              <strong>{{ memberSince }}</strong>
            </div>
          </div>
        </aside>

        <form class="panel profile-form" @submit.prevent="handleSubmit">
          <div class="field">
            <label class="field__label" for="name">Name</label>
            <input id="name" v-model="form.name" class="input" type="text" required />
          </div>

          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input id="email" v-model="form.email" class="input" type="email" required />
          </div>

          <div class="profile-form__password-grid">
            <div class="field">
              <label class="field__label" for="password">New password</label>
              <input id="password" v-model="form.password" class="input" type="password" />
            </div>
            <div class="field">
              <label class="field__label" for="password_confirmation">Confirm password</label>
              <input id="password_confirmation" v-model="form.password_confirmation" class="input" type="password" />
            </div>
          </div>

          <p v-if="notice" class="notice">{{ notice }}</p>
          <p v-if="error" class="notice notice--danger">{{ error }}</p>

          <button class="button button--primary" type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save profile' }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-summary,
.profile-form {
  display: grid;
  gap: 1rem;
}

.profile-form__password-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .profile-form__password-grid {
    grid-template-columns: 1fr;
  }
}
</style>
