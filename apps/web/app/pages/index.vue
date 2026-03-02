<script setup lang="ts">
useSeo({
  title: 'EnigmaBox — Digital escape room builder',
  description: 'Build and play escape rooms. Create locks, riddles, and puzzles; validate answers securely at the edge.',
})
useWebPageSchema({
  name: 'EnigmaBox — Digital escape room builder',
  description: 'Build and play escape rooms. Create locks, riddles, and puzzles; validate answers securely at the edge.',
})

const { isAuthenticated } = useAuth()
</script>

<template>
  <UPage>
    <UPageBody>
      <section class="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary-500/15 via-primary-600/10 to-transparent dark:from-primary-600/20 dark:via-primary-700/15 p-8 sm:p-12 lg:p-16 shadow-card border border-default">
        <div class="relative z-10 max-w-2xl">
          <h1 class="font-display text-3xl font-bold tracking-tight text-highlighted sm:text-4xl animate-count-in">
            EnigmaBox
          </h1>
          <p class="mt-4 text-lg text-muted animate-count-in" style="animation-delay: 0.1s">
            Build and play digital escape rooms. Create puzzles, set answers, and let players solve them — validation happens securely at the edge.
          </p>
          <div class="mt-8 flex flex-wrap gap-3 animate-count-in transition-base" style="animation-delay: 0.2s">
            <UButton
              v-if="isAuthenticated"
              to="/dashboard"
              icon="i-lucide-layout-dashboard"
              size="lg"
              class="transition-base"
            >
              Dashboard
            </UButton>
            <UButton
              v-else
              to="/login"
              icon="i-lucide-log-in"
              size="lg"
              class="transition-base"
            >
              Log in
            </UButton>
            <UButton
              to="/register"
              color="neutral"
              variant="outline"
              icon="i-lucide-user-plus"
              size="lg"
              class="transition-base"
            >
              Create account
            </UButton>
          </div>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>
