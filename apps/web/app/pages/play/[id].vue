<script setup lang="ts">
const route = useRoute()
const roomId = route.params.id as string

useSeo({
  title: 'Play — EnigmaBox',
  description: 'Play this escape room.',
})
useWebPageSchema({
  name: 'Play — EnigmaBox',
  description: 'Play this escape room.',
})

const { start: startRoom, verify: verifyAnswer } = useRoomPlay(roomId)
const { data: leaderboard, refresh: refreshLeaderboard, formatDuration } = useRoomLeaderboard(roomId)

const step = ref<'start' | 'playing' | 'completed'>('start')
const playerName = ref('')
const sessionId = ref<string | null>(null)
const startTime = ref<string | null>(null)
const completedEndTime = ref<string | null>(null)
const room = ref<{ id: string; title: string; description?: string | null } | null>(null)
const puzzle = ref<{
  id: string
  sequenceOrder: number
  puzzleType: string
  content: string
  hints: string[] | null
} | null>(null)
const answer = ref('')
const loading = ref(false)
const error = ref('')
const correct = ref(false)
const completed = ref(false)
const copyLinkDone = ref(false)

const durationMs = computed(() => {
  if (!startTime.value || !completedEndTime.value) return null
  return new Date(completedEndTime.value).getTime() - new Date(startTime.value).getTime()
})

const myRank = computed(() => {
  const list = leaderboard.value ?? []
  const name = playerName.value.trim()
  const entry = list.find((e) => e.playerName === name)
  return entry?.rank ?? null
})

const topLeaderboard = computed(() => (leaderboard.value ?? []).slice(0, 10))

function isCurrentPlayer(entry: { playerName: string }): boolean {
  return entry.playerName === playerName.value.trim()
}

async function startGame() {
  error.value = ''
  if (!playerName.value.trim()) {
    error.value = 'Enter your name'
    return
  }
  loading.value = true
  try {
    const res = await startRoom({ playerName: playerName.value.trim() })
    sessionId.value = res.sessionId
    startTime.value = res.startTime
    room.value = res.room
    puzzle.value = res.puzzle
    step.value = 'playing'
    answer.value = ''
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to start'
  } finally {
    loading.value = false
  }
}

async function submitAnswer() {
  if (!sessionId.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await verifyAnswer({ answer: answer.value, sessionId: sessionId.value })
    correct.value = res.correct
    if (res.completed) {
      completedEndTime.value = res.endTime ?? new Date().toISOString()
      step.value = 'completed'
      completed.value = true
      puzzle.value = null
      await refreshLeaderboard()
    } else if (res.nextPuzzle) {
      puzzle.value = res.nextPuzzle
      answer.value = ''
      correct.value = false
    }
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Verification failed'
  } finally {
    loading.value = false
  }
}

function copyPlayLink() {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/play/${roomId}` : ''
  if (url && typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      copyLinkDone.value = true
      setTimeout(() => { copyLinkDone.value = false }, 2000)
    })
  }
}
</script>

<template>
  <UPage>
    <UPageBody>
      <!-- Start: enter name -->
      <UCard v-if="step === 'start'" class="mx-auto max-w-md">
        <template #header>
          <h1 class="text-xl font-semibold">
            Enter the room
          </h1>
        </template>
        <UForm :state="{ playerName }" class="form-section space-y-4" @submit="startGame">
          <UAlert
            v-if="error"
            color="error"
            :title="error"
          />
          <UFormField name="playerName" label="Your name">
            <UInput
              v-model="playerName"
              placeholder="Player name"
              autocomplete="name"
            />
          </UFormField>
          <UButton
            type="submit"
            :loading="loading"
            label="Start"
          />
        </UForm>
      </UCard>

      <!-- Playing: show puzzle and answer form -->
      <div v-else-if="step === 'playing' && room && puzzle" class="mx-auto max-w-2xl space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ room.title }}
            </h2>
            <p v-if="room.description" class="mt-1 text-sm text-muted">
              {{ room.description }}
            </p>
          </template>
          <div class="prose dark:prose-invert">
            <p class="whitespace-pre-wrap text-highlighted">
              {{ puzzle.content }}
            </p>
          </div>
          <UForm :state="{ answer }" class="mt-6 form-section space-y-4" @submit="submitAnswer">
            <UAlert
              v-if="error"
              color="error"
              :title="error"
            />
            <UAlert
              v-else-if="correct"
              color="success"
              title="Correct! Next puzzle..."
            />
            <UFormField name="answer" label="Your answer">
              <UInput
                v-model="answer"
                placeholder="Answer"
                :disabled="loading"
              />
            </UFormField>
            <UButton
              type="submit"
              :loading="loading"
              label="Submit"
            />
          </UForm>
        </UCard>
      </div>

      <!-- Completed -->
      <div v-else-if="step === 'completed'" class="mx-auto max-w-2xl space-y-6">
        <UCard class="text-center">
          <template #header>
            <h1 class="font-display text-xl font-semibold">
              Room complete
            </h1>
          </template>
          <p class="text-muted">
            You solved all puzzles. Well done!
          </p>
          <p v-if="durationMs != null" class="mt-2 text-lg font-semibold text-highlighted">
            Your time: {{ formatDuration(durationMs) }}
          </p>
          <p v-if="myRank != null" class="mt-1 text-primary-600 dark:text-primary-400">
            You're #{{ myRank }} on the leaderboard
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <UButton
              to="/play"
              icon="i-lucide-play"
              label="Play another room"
            />
            <UButton
              to="/"
              color="neutral"
              variant="outline"
              icon="i-lucide-home"
              label="Back to home"
            />
            <UButton
              color="neutral"
              variant="ghost"
              :icon="copyLinkDone ? 'i-lucide-check' : 'i-lucide-link'"
              :label="copyLinkDone ? 'Copied!' : 'Copy room link'"
              @click="copyPlayLink"
            />
          </div>
        </UCard>

        <UCard v-if="leaderboard?.length" class="overflow-hidden">
          <template #header>
            <h2 class="font-display text-lg font-semibold">
              Top times
            </h2>
          </template>
          <ul class="divide-y divide-default">
            <li
              v-for="entry in topLeaderboard"
              :key="entry.rank"
              class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              :class="{ 'bg-primary/10 font-medium': isCurrentPlayer(entry) }"
            >
              <span class="text-dimmed">#{{ entry.rank }}</span>
              <span class="text-highlighted">{{ entry.playerName }}</span>
              <span class="font-mono text-sm">{{ formatDuration(entry.durationMs) }}</span>
            </li>
          </ul>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>