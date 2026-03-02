<script setup lang="ts">
import { z } from 'zod'

useSeo({
  title: 'Create account — EnigmaBox',
  description: 'Create an EnigmaBox account to build and share escape rooms.',
})
useWebPageSchema({
  name: 'Create account — EnigmaBox',
  description: 'Create an EnigmaBox account to build and share escape rooms.',
})

const { user } = useAuth()

if (user.value) {
  await navigateTo('/dashboard')
}

const state = reactive({
  email: '',
  password: '',
  name: '',
  error: '',
  loading: false,
})

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  name: z.string().optional(),
})

const { register } = useAuthApi()

async function onSubmit() {
  state.error = ''
  state.loading = true
  try {
    await register({ email: state.email, password: state.password, name: state.name || undefined })
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    state.error = (e as { data?: { message?: string } })?.data?.message ?? 'Registration failed'
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
            Create account
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
            <UFormField name="name" label="Name (optional)">
              <UInput
                v-model="state.name"
                type="text"
                placeholder="Your name"
                autocomplete="name"
              />
            </UFormField>
            <UFormField name="password" label="Password">
              <UInput
                v-model="state.password"
                type="password"
                placeholder="At least 8 characters"
                autocomplete="new-password"
              />
            </UFormField>
            <div class="form-actions flex flex-wrap gap-2">
              <UButton
                type="submit"
                :loading="state.loading"
                label="Create account"
              />
              <UButton
                to="/login"
                color="neutral"
                variant="ghost"
                label="Already have an account?"
              />
            </div>
          </div>
        </UForm>
      </UCard>
    </UPageBody>
  </UPage>
</template>