<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Profile from './components/Profile.vue'
import AboutMe from './components/AboutMe.vue'
import Certifications from './components/CertificationsPanel.vue'
import Resume from './components/Resume.vue'
import Projects from './components/Projects.vue'
import Hobbies from './components/Hobbies.vue'
import DarkModeToggle from './components/DarkModeToggle.vue'

const navOpen = ref(false)
const activeSection = ref('profile')
const route = useRoute()
const isAdmin = computed(() => route.path === '/admin')

// Scroll progress & back to top
const scrollProgress = ref(0)
const showBackToTop = ref(false)

// Visitor counter
const visitorCount = ref(0)

function getVisitorId() {
  let id = localStorage.getItem('portfolio:visitor_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('portfolio:visitor_id', id)
  }
  return id
}

async function loadVisitorCount() {
  try {
    const visitorId = getVisitorId()
    const res = await fetch('http://127.0.0.1:8000/api/visitors/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_id: visitorId }),
    })
    const data = await res.json()
    visitorCount.value = data.count
  } catch {
    visitorCount.value = 0
  }
}

function onScroll() {
  const el = document.documentElement
  const scrolled = el.scrollTop || document.body.scrollTop
  const total = el.scrollHeight - el.clientHeight
  scrollProgress.value = total > 0 ? (scrolled / total) * 100 : 0
  showBackToTop.value = scrolled > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  loadVisitorCount()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
function toggleNav() {
  navOpen.value = !navOpen.value
}
function closeNav() {
  navOpen.value = false
}
function showSection(name) {
  activeSection.value = name
  closeNav()
  try {
    globalThis.location.hash = name
  } catch {
    // ignore
  }
}
</script>

<template>
  <RouterView v-if="isAdmin" />
  <div v-else id="app">
    <!-- Scroll progress bar -->
    <div class="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>

    <!-- Back to top button -->
    <transition name="fade-up">
      <button
        v-if="showBackToTop"
        class="back-to-top"
        @click="scrollToTop"
        aria-label="Back to top"
      >
        ↑
      </button>
    </transition>
    <a class="skip-link" href="#main">Skip to content</a>

    <!-- ── Page wrapper ── -->
    <div class="page-wrapper">
      <!-- ── Left Sidebar ── -->
      <aside class="sidebar">
        <div class="sidebar__brand">My Portfolio</div>

        <nav class="sidebar__nav">
          <ul class="sidebar__links">
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'profile' }"
                @click="showSection('profile')"
              >
                Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'about' }"
                @click="showSection('about')"
              >
                About
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'certifications' }"
                @click="showSection('certifications')"
              >
                Certifications
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'resume' }"
                @click="showSection('resume')"
              >
                Resume
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'projects' }"
                @click="showSection('projects')"
              >
                Projects
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'hobbies' }"
                @click="showSection('hobbies')"
              >
                Hobbies
              </button>
            </li>
          </ul>
        </nav>

        <div class="sidebar__footer">
          <DarkModeToggle />
          <div class="visitor-badge" v-if="visitorCount > 0" title="Profile views">
            👁️ {{ visitorCount.toLocaleString() }}
          </div>
        </div>
      </aside>

      <!-- ── Mobile top bar ── -->
      <header class="mobile-header">
        <h1 class="brand">My Portfolio</h1>
        <div class="mobile-header__right">
          <DarkModeToggle />
          <button class="nav-toggle" @click="toggleNav" :aria-expanded="navOpen">
            <span class="sr">Toggle navigation</span>
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 1H20M0 6H20M0 11H20"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <nav class="nav" :class="{ open: navOpen }">
          <ul class="nav-links">
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'profile' }"
                @click="showSection('profile')"
              >
                Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'about' }"
                @click="showSection('about')"
              >
                About
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'certifications' }"
                @click="showSection('certifications')"
              >
                Certifications
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'resume' }"
                @click="showSection('resume')"
              >
                Resume
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'projects' }"
                @click="showSection('projects')"
              >
                Projects
              </button>
            </li>
            <li>
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeSection === 'hobbies' }"
                @click="showSection('hobbies')"
              >
                Hobbies
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <!-- ── Main content ── -->
      <div class="layout">
        <main id="main">
          <div class="profile">
            <Transition name="section-fade" mode="out-in">
              <section
                id="profile"
                aria-hidden="false"
                v-if="activeSection === 'profile'"
                key="profile"
              >
                <Profile />
              </section>
            </Transition>
          </div>

          <div class="container">
            <Transition name="section-fade" mode="out-in">
              <section id="about" aria-hidden="true" v-if="activeSection === 'about'" key="about">
                <AboutMe />
              </section>
            </Transition>

            <Transition name="section-fade" mode="out-in">
              <section
                id="resume"
                aria-hidden="true"
                v-if="activeSection === 'resume'"
                key="resume"
              >
                <Resume />
              </section>
            </Transition>
          </div>
        </main>

        <main id="main2">
          <div class="container2">
            <Transition name="section-fade" mode="out-in">
              <section
                id="certifications"
                aria-hidden="true"
                v-if="activeSection === 'certifications'"
                key="certifications"
              >
                <Certifications />
              </section>
            </Transition>

            <Transition name="section-fade" mode="out-in">
              <section
                id="projects"
                aria-hidden="true"
                v-if="activeSection === 'projects'"
                key="projects"
              >
                <Projects />
              </section>
            </Transition>

            <Transition name="section-fade" mode="out-in">
              <section
                id="hobbies"
                aria-hidden="true"
                v-if="activeSection === 'hobbies'"
                key="hobbies"
              >
                <Hobbies />
              </section>
            </Transition>
          </div>
        </main>

        <footer class="site-footer container">
          <p>© 2026</p>
        </footer>
      </div>
      <!-- end .layout -->
    </div>
    <!-- end .page-wrapper -->
  </div>
</template>

<style scoped>
/* ── Page wrapper: sidebar + content side by side ── */
.page-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  width: 100%;
}

/* ── Layout (main content) ── */
.layout {
  flex: 1;
  min-width: 0;
}

/* ── Left Sidebar ── */
.sidebar {
  width: 180px;
  flex-shrink: 0;
  background: var(--card);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  box-shadow: 0 6px 30px rgba(2, 6, 12, 0.5);
  position: sticky;
  top: 1.5rem;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
}

.sidebar__brand {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar__nav {
  flex: 1;
}

.sidebar__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__links .nav-link {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.88rem;
}

.sidebar__footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── Mobile header (hidden on desktop) ── */
.mobile-header {
  display: none;
}

/* ── Visitor badge ── */
.visitor-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(124, 219, 182, 0.07);
  border: 1px solid rgba(124, 219, 182, 0.15);
  border-radius: 20px;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

/* ── Mobile: hide sidebar, show top bar ── */
@media (max-width: 880px) {
  .page-wrapper {
    display: block;
  }

  .sidebar {
    display: none;
  }

  .layout {
    margin-right: 0;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--bg);
    padding: 12px 1.5rem;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }

  .mobile-header__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-header .nav {
    position: absolute;
    right: 18px;
    top: 60px;
    background: linear-gradient(180deg, var(--card), rgba(10, 14, 20, 0.95));
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
    transform: translateY(-8px);
    opacity: 0;
    pointer-events: none;
    transition: all 0.18s ease;
    width: 180px;
  }

  .mobile-header .nav.open {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .mobile-header .nav-links {
    flex-direction: column;
    gap: 4px;
  }
}

/* Section fade transition */
.section-fade-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.section-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.section-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.section-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Scroll progress bar */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), #49c19b);
  z-index: 9999;
  transition: width 0.1s linear;
  border-radius: 0 2px 2px 0;
}

/* Back to top button */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), #49c19b);
  color: #01221a;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 6px 20px rgba(124, 219, 182, 0.35);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(124, 219, 182, 0.45);
}

/* Transition */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
