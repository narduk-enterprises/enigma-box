<script setup lang="ts">
const route = useRoute()
const roomId = route.params.id as string

useSeo({
  title: 'Edit room — EnigmaBox',
  description: 'Edit room and puzzles.',
})
useWebPageSchema({
  name: 'Edit room — EnigmaBox',
  description: 'Edit room and puzzles.',
})

definePageMeta({ middleware: 'auth' })

const { data: room, pending, refresh } = useAdminRoom(roomId)
const { addPuzzle: doAddPuzzle } = useAddPuzzle(roomId)

const showAddPuzzle = ref(false)
const newPuzzle = reactive({
  sequenceOrder: 0,
  puzzleType: 'text' as 'text' | 'code' | 'image',
  content: '',
  answer: '',
  hints: [] as string[],
})
const addPuzzleLoading = ref(false)
const addPuzzleError = ref('')

async function addPuzzle() {
  addPuzzleError.value = ''
  if (!newPuzzle.content.trim() || !newPuzzle.answer.trim()) {
    addPuzzleError.value = 'Content and answer are required'
    return
  }
  addPuzzleLoading.value = true
  try {
    await doAddPuzzle({
      sequenceOrder: newPuzzle.sequenceOrder,
      puzzleType: newPuzzle.puzzleType,
      content: newPuzzle.content,
      answer: newPuzzle.answer,
      hints: newPuzzle.hints.length ? newPuzzle.hints : undefined,
    })
    newPuzzle.sequenceOrder = room.value?.puzzles?.length ?? 0
    newPuzzle.content = ''
    newPuzzle.answer = ''
    newPuzzle.hints = []
    showAddPuzzle.value = false
    await refresh()
  } catch (e: unknown) {
    addPuzzleError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to add puzzle'
  } finally {
    addPuzzleLoading.value = false
  }
}

onMounted(() => {
  if (room.value?.puzzles?.length != null) {
    newPuzzle.sequenceOrder = room.value.puzzles.length
  }
})

watch(room, (r) => {
  if (r?.puzzles?.length != null) {
    newPuzzle.sequenceOrder = r.puzzles.length
  }
}, { immediate: true })
</script>

<template>
  <UPage>
    <UPageHeader
      :title="room?.title ?? 'Room'"
      :description="room?.description ?? undefined"
    >
      <template #links>
        <UButton
          to="/dashboard"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          label="Back"
        />
        <UButton
          :to="`/play/${roomId}`"
          color="neutral"
          variant="ghost"
          icon="i-lucide-play"
          label="Play"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary-500" />
      </div>

      <template v-else-if="room">
        <UCard class="mb-6">
          <template #header>
            <div class="flex items-center justify-between">
              <span>Puzzles</span>
              <UButton
                icon="i-lucide-plus"
                label="Add puzzle"
                @click="showAddPuzzle = true"
              />
            </div>
          </template>
          <ul v-if="room.puzzles.length" class="space-y-3">
            <li
              v-for="(p, i) in room.puzzles"
              :key="p.id"
              class="flex items-center gap-3 rounded-lg border border-default p-3"
            >
              <span class="text-sm font-medium text-dimmed">
                {{ i + 1 }}.
              </span>
              <span class="text-sm text-highlighted">{{ p.puzzleType }}</span>
              <p class="min-w-0 flex-1 truncate text-sm text-muted">
                {{ p.content }}
              </p>
            </li>
          </ul>
          <p v-else class="text-sm text-dimmed">
            No puzzles yet. Add one to get started.
          </p>
        </UCard>

        <UModal v-model:open="showAddPuzzle" title="Add puzzle">
          <template #content>
            <UForm :state="newPuzzle" class="form-section space-y-4 p-4" @submit="addPuzzle">
              <UAlert
                v-if="addPuzzleError"
                color="error"
                :title="addPuzzleError"
              />
              <UFormField label="Order">
                <UInput
                  v-model.number="newPuzzle.sequenceOrder"
                  type="number"
                  min="0"
                />
              </UFormField>
              <UFormField label="Type">
                <USelect
                  v-model="newPuzzle.puzzleType"
                  :items="[
                    { label: 'Text', value: 'text' },
                    { label: 'Code', value: 'code' },
                    { label: 'Image', value: 'image' },
                  ]"
                  value-key="value"
                  label-key="label"
                />
              </UFormField>
              <UFormField label="Content (riddle / question)">
                <UTextarea
                  v-model="newPuzzle.content"
                  placeholder="Puzzle content"
                  :rows="4"
                />
              </UFormField>
              <UFormField label="Correct answer (stored securely)">
                <UInput
                  v-model="newPuzzle.answer"
                  type="text"
                  placeholder="Answer"
                />
              </UFormField>
              <div class="form-actions">
                <UButton
                  type="submit"
                  :loading="addPuzzleLoading"
                  label="Add"
                />
                <UButton
                  color="neutral"
                  variant="ghost"
                  label="Cancel"
                  @click="showAddPuzzle = false"
                />
              </div>
            </UForm>
          </template>
        </UModal>
      </template>

      <UAlert
        v-else
        color="error"
        title="Room not found"
      />
    </UPageBody>
  </UPage>
</template>