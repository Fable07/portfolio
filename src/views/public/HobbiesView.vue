<!-- HobbiesView — /hobbies — emoji + name + short description cards -->
<template>
  <section id="hobbies" class="hobbies section">
    <div class="container2">
      <h2>Hobbies</h2>

      <LoadingDots v-if="store.isLoading" />

      <StateMessage
        v-else-if="store.status === 'error'"
        type="error"
        message="Couldn't load hobbies."
        retry
        @retry="store.load({ force: true })"
      />

      <StateMessage v-else-if="store.items.length === 0" message="No hobbies added yet." />

      <ul v-else class="hobby-grid m-0 list-none p-0">
        <li v-for="hobby in store.items" :key="hobby.id" class="hobby-card">
          <span class="hobby-card__icon" aria-hidden="true">{{ hobby.icon || '🎯' }}</span>
          <div class="hobby-card__body">
            <span class="hobby-card__name">{{ hobby.name }}</span>
            <span v-if="hobby.description" class="hobby-card__desc">{{ hobby.description }}</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHobbiesStore } from '@/stores/content'
import LoadingDots from '@/components/common/LoadingDots.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const store = useHobbiesStore()
onMounted(() => store.load())
</script>

<style scoped>
.hobby-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hobby-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(124, 219, 182, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(124, 219, 182, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hobby-card:hover {
  border-color: rgba(124, 219, 182, 0.3);
  background: linear-gradient(135deg, rgba(124, 219, 182, 0.1), rgba(255, 255, 255, 0.04));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.hobby-card__icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}
.hobby-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hobby-card__name {
  color: #e2f5ef;
  font-weight: 600;
  font-size: 0.9rem;
}
.hobby-card__desc {
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.4;
}
</style>
