<template>
  <section id="hobbies" class="hobbies section">
    <div class="container2">
      <h2>Hobbies</h2>

      <!-- Loading state -->
      <div v-if="loading" class="hobby-loading">
        <span class="hobby-loading__dot"></span>
        <span class="hobby-loading__dot"></span>
        <span class="hobby-loading__dot"></span>
      </div>

      <!-- Empty state -->
      <p v-else-if="hobbies.length === 0" class="hobby-empty">No hobbies added yet.</p>

      <!-- Hobbies list -->
      <div v-else class="hobby-grid">
        <div v-for="hobby in hobbies" :key="hobby.id" class="hobby-card">
          <!-- Icon -->
          <span v-if="hobby.icon" class="hobby-card__icon">{{ hobby.icon }}</span>
          <span v-else class="hobby-card__icon">🎯</span>

          <!-- Name & description -->
          <div class="hobby-card__body">
            <span class="hobby-card__name">{{ hobby.name }}</span>
            <span v-if="hobby.description" class="hobby-card__desc">{{ hobby.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { hobbiesApi } from '@/api'

const hobbies = ref([])
const loading = ref(true)

// Fetch hobbies from Laravel API on mount
onMounted(async () => {
  try {
    hobbies.value = await hobbiesApi.list()
  } catch {
    hobbies.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Loading dots */
.hobby-loading {
  display: flex;
  gap: 6px;
  padding: 1rem 0;
}

.hobby-loading__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: hobbyBounce 1.2s ease-in-out infinite both;
}

.hobby-loading__dot:nth-child(2) {
  animation-delay: 0.16s;
}
.hobby-loading__dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes hobbyBounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Empty state */
.hobby-empty {
  color: var(--muted);
  font-size: 0.9rem;
}

/* Grid layout */
.hobby-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Hobby card */
.hobby-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(124, 219, 182, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(124, 219, 182, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
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
