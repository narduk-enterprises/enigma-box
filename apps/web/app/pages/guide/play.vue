<script setup lang="ts">
useSeo({
  title: 'How to play — EnigmaBox',
  description: 'Learn how to play an EnigmaBox escape room: enter your name, solve puzzles in order, and beat the clock.',
})
useWebPageSchema({
  name: 'How to play — EnigmaBox',
  description: 'Learn how to play an EnigmaBox escape room: enter your name, solve puzzles in order, and beat the clock.',
})
</script>

<template>
  <UPage>
    <UPageHeader
      title="How to play"
      description="A short guide to playing escape rooms on EnigmaBox."
    >
      <template #links>
        <UButton
          to="/play"
          icon="i-lucide-play"
          label="Browse rooms"
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
            What is an EnigmaBox room?
          </h2>
          <p class="text-muted">
            A room is a sequence of puzzles. You solve them one by one in order. Each puzzle shows a riddle, code, or clue; you type your answer and submit. When you get it right, the next puzzle appears. When you finish the last one, your time is recorded and you can see how you rank on the leaderboard.
          </p>
        </section>

        <section class="card-base p-6 space-y-4 mt-6">
          <h2 class="font-display text-lg font-semibold text-highlighted">
            Steps to play
          </h2>
          <ol class="list-decimal list-inside space-y-2 text-muted">
            <li><strong class="text-default">Choose a room</strong> — From the home page or the Play page, pick a room that looks fun.</li>
            <li><strong class="text-default">Enter your name</strong> — Type the name you want to show on the leaderboard (no account needed).</li>
            <li><strong class="text-default">Solve puzzles in order</strong> — Read each puzzle, type your answer, and submit. Answers are case-insensitive and trimmed.</li>
            <li><strong class="text-default">Finish and compare</strong> — When you complete the last puzzle, you’ll see your time and the top times. You can copy the room link to share with friends.</li>
          </ol>
        </section>

        <section class="card-base p-6 space-y-4 mt-6">
          <h2 class="font-display text-lg font-semibold text-highlighted">
            Tips
          </h2>
          <p class="text-muted">
            You can play the same room again to try to beat your time. Each run is a new session. If you get stuck, some puzzles offer optional hints.
          </p>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>
