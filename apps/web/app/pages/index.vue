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
    <UPageHero
      title="EnigmaBox"
      description="Build and play digital escape rooms. Create puzzles, set answers, and let players solve them — validation happens securely at the edge."
    >
      <template #links>
        <UButton
          v-if="isAuthenticated"
          to="/dashboard"
          icon="i-lucide-layout-dashboard"
        >
          Dashboard
        </UButton>
        <UButton
          v-else
          to="/login"
          icon="i-lucide-log-in"
        >
          Log in
        </UButton>
        <UButton
          to="/register"
          color="neutral"
          variant="outline"
          icon="i-lucide-user-plus"
        >
          Create account
        </UButton>
      </template>
    </UPageHero>
  </UPage>
</template>
