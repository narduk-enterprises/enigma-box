<script setup lang="ts">
useSeo({
  title: 'Choose a room — EnigmaBox',
  description: 'Pick an escape room to play. Solve puzzles in order and beat the clock.',
})
useWebPageSchema({
  name: 'Choose a room — EnigmaBox',
  description: 'Pick an escape room to play. Solve puzzles in order and beat the clock.',
})

const { data: rooms, pending } = usePublicRooms()
</script>

<template>
  <UPage>
    <UPageHeader
      title="Choose a room to play"
      description="Pick an escape room below. Enter your name, solve the puzzles in order, and see how fast you can finish."
    >
      <template #links>
        <UButton
          to="/"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          label="Back to home"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <div v-if="pending" class="flex justify-center py-12">
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
          v-for="(room, i) in rooms"
          :key="room.id"
          class="card-base p-4 transition-base hover:shadow-elevated animate-count-in"
          :style="{ animationDelay: `${i * 0.05}s` }"
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
    </UPageBody>
  </UPage>
</template>
