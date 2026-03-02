<script setup lang="ts">
import { z } from 'zod'

useSeo({
  title: 'Log in — EnigmaBox',
  description: 'Log in to EnigmaBox to create and manage your escape rooms.',
})
useWebPageSchema({
  name: 'Log in — EnigmaBox',
  description: 'Log in to EnigmaBox to create and manage your escape rooms.',
})

const { user } = useAuth()

if (user.value) {
  await navigateTo('/dashboard')
}

const state = reactive({
  email: '',
  password: '',
  error: '',
  loading: false,
})

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

const { login } = useAuthApi()

async function onSubmit() {
  state.error = ''
  state.loading = true
  try {
    await login({ email: state.email, password: state.password })
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    state.error = (e as { data?: { message?: string } })?.data?.message ?? 'Login failed'
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard class="mx-auto max-w-md">
        <template #header>
          <h1 class="text-xl font-semibold">
            Log in
          </h1>
        </template>

        <UForm :state="state" :schema="schema" @submit="onSubmit">
          <div class="form-section space-y-4">
            <UAlert
              v-if="state.error"
              color="error"
              :title="state.error"
              class="mb-4"
            />
            <UFormField name="email" label="Email">
              <UInput
                v-model="state.email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
              />
            </UFormField>
            <UFormField name="password" label="Password">
              <UInput
                v-model="state.password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </UFormField>
            <div class="form-actions flex flex-wrap gap-2">
              <UButton
                type="submit"
                :loading="state.loading"
                label="Log in"
              />
              <UButton
                to="/register"
                color="neutral"
                variant="ghost"
                label="Create account"
              />
            </div>
          </div>
        </UForm>
      </UCard>
    </UPageBody>
  </UPage>
</template>
