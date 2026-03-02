<script setup lang="ts">
useSeo({
  title: 'Dashboard — EnigmaBox',
  description: 'Create and manage your escape rooms.',
})
useWebPageSchema({
  name: 'Dashboard — EnigmaBox',
  description: 'Create and manage your escape rooms.',
})

definePageMeta({ middleware: 'auth' })

const { data: rooms, pending, refresh } = useAdminRooms()
const { createRoom: doCreateRoom } = useCreateRoom()

const showCreate = ref(false)
const newRoom = reactive({ title: '', description: '' })
const createLoading = ref(false)
const createError = ref('')

async function createRoom() {
  createError.value = ''
  if (!newRoom.title.trim()) {
    createError.value = 'Title is required'
    return
  }
  createLoading.value = true
  try {
    await doCreateRoom({ title: newRoom.title.trim(), description: newRoom.description.trim() || undefined })
    newRoom.title = ''
    newRoom.description = ''
    showCreate.value = false
    await refresh()
  } catch (e: unknown) {
    createError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to create room'
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <UPage>
    <UPageHeader
      title="Your rooms"
      description="Create and manage escape rooms."
    >
      <template #links>
        <UButton
          icon="i-lucide-plus"
          label="New room"
          @click="showCreate = true"
        />
        <UButton
          to="/"
          color="neutral"
          variant="ghost"
          icon="i-lucide-home"
          label="Home"
        />
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-log-out"
          label="Log out"
          @click="useAuth().logout()"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <UModal v-model:open="showCreate" title="New room">
        <template #content>
          <UForm :state="newRoom" class="form-section space-y-4 p-4" @submit="createRoom">
            <UAlert
              v-if="createError"
              color="error"
              :title="createError"
            />
            <UFormField label="Title">
              <UInput
                v-model="newRoom.title"
                placeholder="Room title"
                required
              />
            </UFormField>
            <UFormField label="Description (optional)">
              <UTextarea
                v-model="newRoom.description"
                placeholder="Describe your room"
                :rows="3"
              />
            </UFormField>
            <div class="form-actions">
              <UButton
                type="submit"
                :loading="createLoading"
                label="Create"
              />
              <UButton
                color="neutral"
                variant="ghost"
                label="Cancel"
                @click="showCreate = false"
              />
            </div>
          </UForm>
        </template>
      </UModal>

      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary-500" />
      </div>

      <div v-else-if="!rooms?.length" class="rounded-lg border border-default bg-muted p-8 text-center">
        <p class="text-muted">
          No rooms yet. Create one to get started.
        </p>
        <UButton
          class="mt-4"
          icon="i-lucide-plus"
          label="New room"
          @click="showCreate = true"
        />
      </div>

      <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(room, i) in rooms"
          :key="room.id"
          class="card-base p-4 transition-base animate-count-in hover:shadow-elevated"
          :style="{ animationDelay: `${i * 0.05}s` }"
        >
          <NuxtLink :to="`/dashboard/rooms/${room.id}`" class="block">
            <h3 class="font-semibold text-highlighted">
              {{ room.title }}
            </h3>
            <p v-if="room.description" class="mt-1 line-clamp-2 text-sm text-muted">
              {{ room.description }}
            </p>
            <p class="mt-2 text-xs text-dimmed">
              {{ new Date(room.createdAt).toLocaleDateString() }}
            </p>
          </NuxtLink>
          <div class="mt-3 flex gap-2">
            <UButton
              :to="`/dashboard/rooms/${room.id}`"
              size="sm"
              variant="soft"
              icon="i-lucide-pencil"
              label="Edit"
            />
            <UButton
              :to="`/play/${room.id}`"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-play"
              label="Play"
            />
          </div>
        </li>
      </ul>
    </UPageBody>
  </UPage>
</template>