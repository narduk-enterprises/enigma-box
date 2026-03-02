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

const step = ref<'start' | 'playing' | 'completed'>('start')
const playerName = ref('')
const sessionId = ref<string | null>(null)
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
      step.value = 'completed'
      completed.value = true
      puzzle.value = null
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
      <UCard v-else-if="step === 'completed'" class="mx-auto max-w-md text-center">
        <template #header>
          <h1 class="text-xl font-semibold">
            Room complete
          </h1>
        </template>
        <p class="text-muted">
          You solved all puzzles. Well done!
        </p>
        <UButton
          class="mt-4"
          to="/"
          label="Back to home"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>