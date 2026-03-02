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
const { data: rooms, pending: roomsPending } = usePublicRooms()
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
          <p class="mt-2 text-sm text-dimmed animate-count-in" style="animation-delay: 0.15s">
            New? <NuxtLink to="/guide/play" class="text-primary-600 dark:text-primary-400 hover:underline">Read how to play</NuxtLink>.
          </p>
          <div class="mt-8 flex flex-wrap gap-3 animate-count-in transition-base" style="animation-delay: 0.2s">
            <UButton
              to="/play"
              icon="i-lucide-play"
              size="lg"
              class="transition-base"
            >
              Play a room
            </UButton>
            <UButton
              v-if="isAuthenticated"
              to="/dashboard"
              color="neutral"
              variant="outline"
              icon="i-lucide-layout-dashboard"
              size="lg"
              class="transition-base"
            >
              Dashboard
            </UButton>
            <UButton
              v-else
              to="/login"
              color="neutral"
              variant="outline"
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

      <section class="mt-12">
        <h2 class="font-display text-xl font-semibold text-highlighted mb-4">
          Browse rooms
        </h2>
        <div v-if="roomsPending" class="flex justify-center py-12">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary-500" />
        </div>
        <div v-else-if="!rooms?.length" class="rounded-xl border border-default bg-muted/50 p-8 text-center">
          <p class="text-muted">
            No rooms yet. Create an account to build the first one.
          </p>
          <UButton
            to="/register"
            class="mt-4"
            icon="i-lucide-user-plus"
            label="Create account"
          />
        </div>
        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="room in rooms"
            :key="room.id"
            class="card-base p-4 transition-base hover:shadow-elevated animate-count-in"
          >
            <NuxtLink :to="`/play/${room.id}`" class="block">
              <h3 class="font-semibold text-highlighted">
                {{ room.title }}
              </h3>
              <p v-if="room.description" class="mt-1 line-clamp-2 text-sm text-muted">
                {{ room.description }}
              </p>
              <p class="mt-2 text-xs text-dimmed">
                {{ room.puzzleCount }} {{ room.puzzleCount === 1 ? 'puzzle' : 'puzzles' }}
              </p>
            </NuxtLink>
            <UButton
              :to="`/play/${room.id}`"
              class="mt-3 w-full"
              size="sm"
              icon="i-lucide-play"
              label="Play"
            />
          </li>
        </ul>
      </section>
    </UPageBody>
  </UPage>
</template>
