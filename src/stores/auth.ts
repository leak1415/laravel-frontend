import { computed, ref } from 'vue'
import { api, getStoredToken, setStoredToken } from '@/services/api'
import type {
  AuthCredentials,
  AuthResponse,
  RegisterPayload,
  UpdateProfilePayload,
  UpdateProfileResponse,
  User,
} from '@/types'

const currentUser = ref<User | null>(null)
const initialized = ref(false)

export const isAuthenticated = computed(() => currentUser.value !== null)
export const authUser = computed(() => currentUser.value)
export const authInitialized = computed(() => initialized.value)

function setSession(token: string | null, user: User | null): void {
  setStoredToken(token)
  currentUser.value = user
}

export async function initializeAuth(): Promise<void> {
  const token = getStoredToken()

  if (!token) {
    setSession(null, null)
    initialized.value = true
    return
  }

  setStoredToken(token)

  try {
    const { data } = await api.get<User>('/profile')
    currentUser.value = data
  } catch {
    setSession(null, null)
  } finally {
    initialized.value = true
  }
}

export async function login(payload: AuthCredentials): Promise<User> {
  const { data } = await api.post<AuthResponse>('/login', payload)
  setSession(data.token, data.user)
  return data.user
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>('/register', payload)
  setSession(data.token, data.user)
  return data.user
}

export async function logout(): Promise<void> {
  try {
    await api.post('/logout')
  } finally {
    setSession(null, null)
  }
}

export async function refreshProfile(): Promise<User> {
  const { data } = await api.get<User>('/profile')
  currentUser.value = data
  return data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.put<UpdateProfileResponse>('/profile', payload)
  currentUser.value = data.data
  return data.data
}

export function useAuthState() {
  return {
    user: authUser,
    isAuthenticated,
    initialized: authInitialized,
  }
}
