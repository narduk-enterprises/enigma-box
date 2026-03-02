<script setup lang="ts">
useSeo({
  title: 'How to create a room — EnigmaBox',
  description: 'Create your own EnigmaBox escape room: add a room, add puzzles with answers, and share the play link.',
})
useWebPageSchema({
  name: 'How to create a room — EnigmaBox',
  description: 'Create your own EnigmaBox escape room: add a room, add puzzles with answers, and share the play link.',
})

const { isAuthenticated } = useAuth()
</script>

<template>
  <UPage>
    <UPageHeader
      title="How to create a room"
      description="A short guide to building escape rooms on EnigmaBox."
    >
      <template #links>
        <UButton
          v-if="isAuthenticated"
          to="/dashboard"
          icon="i-lucide-layout-dashboard"
          label="Dashboard"
        />
        <UButton
          v-else
          to="/register"
          icon="i-lucide-user-plus"
          label="Create account"
        />
        <UButton
          to="/"
          color="neutral"
          variant="ghost"
          icon="i-lucide-home"
          label="Home"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="prose dark:prose-invert max-w-2xl">
        <section class="card-base p-6 space-y-4">
          <h2 class="font-display text-lg font-semibold text-highlighted">
            You need an account
          </h2>
          <p class="text-muted">
            Only logged-in users can create rooms. If you don’t have an account, create one from the home page or the register link above.
          </p>
        </section>

        <section class="card-base p-6 space-y-4 mt-6">
          <h2 class="font-display text-lg font-semibold text-highlighted">
            Steps to create
          </h2>
          <ol class="list-decimal list-inside space-y-2 text-muted">
            <li><strong class="text-default">Log in</strong> — Use the Dashboard link or log in from the home page.</li>
            <li><strong class="text-default">New room</strong> — On your dashboard, click “New room”. Give it a title and optional description.</li>
            <li><strong class="text-default">Add puzzles</strong> — Open the room and click “Add puzzle”. For each puzzle you set: order, type (text/code/image), the content players see, and the correct answer. You can add optional hints. Answers are case-insensitive and trimmed when players submit.</li>
            <li><strong class="text-default">Share the play link</strong> — Use the “Play” button to open the room as a player. Copy the URL (e.g. <code class="rounded bg-muted px-1">/play/your-room-id</code>) and share it. Anyone with the link can play; no account required for players.</li>
          </ol>
        </section>

        <section class="card-base p-6 space-y-4 mt-6">
          <h2 class="font-display text-lg font-semibold text-highlighted">
            Tips
          </h2>
          <p class="text-muted">
            Start with a few short puzzles to test the flow. You can edit the room and add or reorder puzzles anytime. Empty rooms (with no puzzles) don’t appear in the public room list until they have at least one puzzle.
          </p>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>
