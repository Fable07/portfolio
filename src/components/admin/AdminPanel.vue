<!-- AdminPanel.vue — Private portfolio manager -->
<template>
  <!-- ══════════════════════ LOGIN GATE ══════════════════════ -->
  <div v-if="!authenticated" class="admin-login">
    <div class="login-card">
      <div class="login-logo">🔐</div>
      <h2 class="login-title">Admin Access</h2>
      <p class="login-sub">Portfolio Manager</p>

      <div class="field">
        <label class="field__label" for="admin-pass">Password</label>
        <div class="field__input-wrap">
          <input
            id="admin-pass"
            v-model="passwordInput"
            :type="showPassword ? 'text' : 'password'"
            class="field__input"
            placeholder="Enter admin password"
            @keyup.enter="login"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="field__eye"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <p v-if="loginError" class="login-error">{{ loginError }}</p>
      <button class="btn-primary" @click="login" :disabled="!passwordInput">Sign In</button>
      <p class="login-hint">Default password: <code>admin123</code></p>
    </div>
  </div>

  <!-- ══════════════════════ ADMIN DASHBOARD ══════════════════════ -->
  <div v-else class="admin-dashboard">
    <!-- Header -->
    <header class="admin-header">
      <div class="admin-header__left">
        <span class="admin-badge">🛡️ Admin</span>
        <h1 class="admin-title">Portfolio Manager</h1>
      </div>
      <button class="btn-ghost" @click="logout">Sign Out</button>
    </header>

    <!-- Tabs -->
    <div class="admin-tabs">
      <button
        class="admin-tab"
        :class="{ 'admin-tab--active': activeTab === 'certifications' }"
        @click="switchTab('certifications')"
      >
        🏅 Certifications
      </button>
      <button
        class="admin-tab"
        :class="{ 'admin-tab--active': activeTab === 'projects' }"
        @click="switchTab('projects')"
      >
        🚀 Projects
      </button>
      <button
        class="admin-tab"
        :class="{ 'admin-tab--active': activeTab === 'resume' }"
        @click="switchTab('resume')"
      >
        📄 Resume
      </button>
      <button
        class="admin-tab"
        :class="{ 'admin-tab--active': activeTab === 'timeline' }"
        @click="switchTab('timeline')"
      >
        🕐 Timeline
      </button>
      <button
        class="admin-tab"
        :class="{ 'admin-tab--active': activeTab === 'hobbies' }"
        @click="switchTab('hobbies')"
      >
        🎯 Hobbies
      </button>
    </div>

    <!-- Save status -->
    <transition name="fade">
      <div v-if="saveStatus" class="save-toast" :class="saveStatus.type">
        {{ saveStatus.message }}
      </div>
    </transition>

    <!-- ══════════ CERTIFICATIONS TAB ══════════ -->
    <div v-if="activeTab === 'certifications'">
      <div class="admin-toolbar">
        <button class="btn-primary btn--icon" @click="openCertModal()">
          <span>＋</span> Add Certification
        </button>
        <span class="cert-count"
          >{{ certifications.length }} certification{{
            certifications.length !== 1 ? 's' : ''
          }}</span
        >
      </div>

      <div v-if="certLoading" class="admin-empty"><p>Loading...</p></div>

      <div v-else-if="certifications.length === 0" class="admin-empty">
        <div class="admin-empty__icon">📋</div>
        <p>No certifications yet. Add your first one!</p>
      </div>

      <div v-else class="cert-table-wrap">
        <table class="cert-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Issuer</th>
              <th>Date</th>
              <th>Credential URL</th>
              <th>Badge URL</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cert in certifications" :key="cert.id" class="cert-row">
              <td class="td-title">{{ cert.title }}</td>
              <td class="td-muted">{{ cert.issuer || '—' }}</td>
              <td class="td-muted">{{ cert.date || '—' }}</td>
              <td class="td-url">
                <a
                  v-if="cert.credential_url"
                  :href="cert.credential_url"
                  target="_blank"
                  class="url-link"
                  >↗ Link</a
                >
                <span v-else class="td-muted">—</span>
              </td>
              <td class="td-url">
                <span v-if="cert.badge_url" class="url-pill">✔ Set</span>
                <span v-else class="td-muted">—</span>
              </td>
              <td class="td-actions">
                <button class="btn-edit" @click="openCertModal(cert)" title="Edit">✏️</button>
                <button class="btn-delete" @click="confirmDeleteCert(cert)" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════ PROJECTS TAB ══════════ -->
    <div v-if="activeTab === 'projects'">
      <div class="admin-toolbar">
        <button class="btn-primary btn--icon" @click="openProjectModal()">
          <span>＋</span> Add Project
        </button>
        <span class="cert-count"
          >{{ projects.length }} project{{ projects.length !== 1 ? 's' : '' }}</span
        >
      </div>

      <div v-if="projLoading" class="admin-empty"><p>Loading...</p></div>

      <div v-else-if="projects.length === 0" class="admin-empty">
        <div class="admin-empty__icon">🚀</div>
        <p>No projects yet. Add your first one!</p>
      </div>

      <div v-else class="cert-table-wrap">
        <table class="cert-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Tech Stack</th>
              <th>Project URL</th>
              <th>GitHub URL</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in projects" :key="project.id" class="cert-row">
              <td class="td-title">{{ project.title }}</td>
              <td class="td-muted td-desc">{{ project.description || '—' }}</td>
              <td class="td-muted">{{ project.tech_stack || '—' }}</td>
              <td class="td-url">
                <a
                  v-if="project.project_url"
                  :href="project.project_url"
                  target="_blank"
                  class="url-link"
                  >↗ Link</a
                >
                <span v-else class="td-muted">—</span>
              </td>
              <td class="td-url">
                <a
                  v-if="project.github_url"
                  :href="project.github_url"
                  target="_blank"
                  class="url-link"
                  >↗ GitHub</a
                >
                <span v-else class="td-muted">—</span>
              </td>
              <td class="td-actions">
                <button class="btn-edit" @click="openProjectModal(project)" title="Edit">✏️</button>
                <button class="btn-delete" @click="confirmDeleteProject(project)" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════ RESUME TAB ══════════ -->
    <div v-if="activeTab === 'resume'">
      <div class="admin-toolbar">
        <span class="cert-count">Update your resume PDF URL</span>
      </div>

      <div v-if="resumeLoading" class="admin-empty"><p>Loading...</p></div>

      <div v-else class="resume-panel">
        <div class="field">
          <label class="field__label">Resume PDF URL <span class="req">*</span></label>
          <input
            v-model="resumeUrl"
            class="field__input"
            placeholder="e.g. /resume.pdf or https://..."
          />
          <p class="resume-hint">
            Enter a relative path like <code>/resume.pdf</code> or a full URL to your hosted PDF.
          </p>
        </div>

        <div v-if="resumeUrl" class="resume-preview">
          <p class="resume-preview__label">Preview:</p>
          <iframe :src="resumeUrl" class="resume-preview__frame" frameborder="0"></iframe>
          <a :href="resumeUrl" target="_blank" class="url-link">Open in new tab ↗</a>
        </div>

        <div class="resume-actions">
          <button class="btn-primary" @click="saveResume" :disabled="resumeSaving">
            {{ resumeSaving ? 'Saving...' : '💾 Save Resume URL' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════ TIMELINE TAB ══════════ -->
    <div v-if="activeTab === 'timeline'">
      <div class="admin-toolbar">
        <button class="btn-primary btn--icon" @click="openTimelineModal()">
          <span>＋</span> Add Entry
        </button>
        <span class="cert-count">
          {{ timeline.length }} entr{{ timeline.length !== 1 ? 'ies' : 'y' }}
        </span>
      </div>

      <!-- Loading state -->
      <div v-if="timelineLoading" class="admin-empty"><p>Loading...</p></div>

      <!-- Empty state -->
      <div v-else-if="timeline.length === 0" class="admin-empty">
        <div class="admin-empty__icon">🕐</div>
        <p>No timeline entries yet. Add your education or work experience!</p>
      </div>

      <!-- Timeline table -->
      <div v-else class="cert-table-wrap">
        <table class="cert-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Institution</th>
              <th>Period</th>
              <th>Location</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in timeline" :key="entry.id" class="cert-row">
              <td>
                <span :class="entry.type === 'education' ? 'badge-edu' : 'badge-work'">
                  {{ entry.type === 'education' ? '🎓 Education' : '💼 Work' }}
                </span>
              </td>
              <td class="td-title">{{ entry.title }}</td>
              <td class="td-muted">{{ entry.institution }}</td>
              <td class="td-muted">{{ entry.start_date }} — {{ entry.end_date || 'Present' }}</td>
              <td class="td-muted">{{ entry.location || '—' }}</td>
              <td class="td-actions">
                <button class="btn-edit" @click="openTimelineModal(entry)" title="Edit">✏️</button>
                <button class="btn-delete" @click="confirmDeleteTimeline(entry)" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════ HOBBIES TAB ══════════ -->
    <div v-if="activeTab === 'hobbies'">
      <div class="admin-toolbar">
        <button class="btn-primary btn--icon" @click="openHobbyModal()">
          <span>＋</span> Add Hobby
        </button>
        <span class="cert-count">
          {{ hobbies.length }} hobb{{ hobbies.length !== 1 ? 'ies' : 'y' }}
        </span>
      </div>

      <!-- Loading state -->
      <div v-if="hobbyLoading" class="admin-empty"><p>Loading...</p></div>

      <!-- Empty state -->
      <div v-else-if="hobbies.length === 0" class="admin-empty">
        <div class="admin-empty__icon">🎯</div>
        <p>No hobbies yet. Add your first one!</p>
      </div>

      <!-- Hobbies table -->
      <div v-else class="cert-table-wrap">
        <table class="cert-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Description</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hobby in hobbies" :key="hobby.id" class="cert-row">
              <td class="td-muted">{{ hobby.icon || '—' }}</td>
              <td class="td-title">{{ hobby.name }}</td>
              <td class="td-muted td-desc">{{ hobby.description || '—' }}</td>
              <td class="td-actions">
                <button class="btn-edit" @click="openHobbyModal(hobby)" title="Edit">✏️</button>
                <button class="btn-delete" @click="confirmDeleteHobby(hobby)" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════ CERT MODAL ══════════ -->
    <transition name="modal">
      <div v-if="certModal.open" class="modal-overlay" @click.self="certModal.open = false">
        <div class="modal-card" role="dialog">
          <h3 class="modal-title">
            {{ certModal.isEdit ? 'Edit Certification' : 'Add Certification' }}
          </h3>
          <div class="modal-fields">
            <div class="field">
              <label class="field__label">Title <span class="req">*</span></label>
              <input
                v-model="certModal.form.title"
                class="field__input"
                placeholder="e.g. AWS Solutions Architect"
              />
            </div>
            <div class="field">
              <label class="field__label">Issuer</label>
              <input
                v-model="certModal.form.issuer"
                class="field__input"
                placeholder="e.g. Amazon Web Services"
              />
            </div>
            <div class="field">
              <label class="field__label">Date</label>
              <input
                v-model="certModal.form.date"
                class="field__input"
                placeholder="e.g. 2024 or Jan 2025"
              />
            </div>
            <div class="field">
              <label class="field__label">Credential URL</label>
              <input
                v-model="certModal.form.credential_url"
                class="field__input"
                placeholder="https://..."
              />
            </div>
            <div class="field">
              <label class="field__label">Badge / Logo URL</label>
              <input
                v-model="certModal.form.badge_url"
                class="field__input"
                placeholder="https://..."
              />
            </div>
          </div>
          <p v-if="certModal.error" class="login-error">{{ certModal.error }}</p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="certModal.open = false">Cancel</button>
            <button class="btn-primary" @click="saveCert" :disabled="certModal.saving">
              {{
                certModal.saving
                  ? 'Saving...'
                  : certModal.isEdit
                    ? 'Save Changes'
                    : 'Add Certification'
              }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════ PROJECT MODAL ══════════ -->
    <transition name="modal">
      <div v-if="projectModal.open" class="modal-overlay" @click.self="projectModal.open = false">
        <div class="modal-card" role="dialog">
          <h3 class="modal-title">{{ projectModal.isEdit ? 'Edit Project' : 'Add Project' }}</h3>
          <div class="modal-fields">
            <div class="field">
              <label class="field__label">Title <span class="req">*</span></label>
              <input
                v-model="projectModal.form.title"
                class="field__input"
                placeholder="e.g. Portfolio Website"
              />
            </div>
            <div class="field">
              <label class="field__label">Description</label>
              <textarea
                v-model="projectModal.form.description"
                class="field__input field__textarea"
                placeholder="Brief description..."
              ></textarea>
            </div>
            <div class="field">
              <label class="field__label">Tech Stack</label>
              <input
                v-model="projectModal.form.tech_stack"
                class="field__input"
                placeholder="e.g. Vue, Laravel, PostgreSQL"
              />
            </div>
            <div class="field">
              <label class="field__label">Project URL</label>
              <input
                v-model="projectModal.form.project_url"
                class="field__input"
                placeholder="https://..."
              />
            </div>
            <div class="field">
              <label class="field__label">GitHub URL</label>
              <input
                v-model="projectModal.form.github_url"
                class="field__input"
                placeholder="https://github.com/..."
              />
            </div>
            <div class="field">
              <label class="field__label">Thumbnail URL</label>
              <input
                v-model="projectModal.form.thumbnail_url"
                class="field__input"
                placeholder="https://..."
              />
            </div>
          </div>
          <p v-if="projectModal.error" class="login-error">{{ projectModal.error }}</p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="projectModal.open = false">Cancel</button>
            <button class="btn-primary" @click="saveProject" :disabled="projectModal.saving">
              {{
                projectModal.saving
                  ? 'Saving...'
                  : projectModal.isEdit
                    ? 'Save Changes'
                    : 'Add Project'
              }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════ TIMELINE MODAL ══════════ -->
    <transition name="modal">
      <div v-if="timelineModal.open" class="modal-overlay" @click.self="timelineModal.open = false">
        <div class="modal-card" role="dialog">
          <h3 class="modal-title">
            {{ timelineModal.isEdit ? 'Edit Entry' : 'Add Timeline Entry' }}
          </h3>
          <div class="modal-fields">
            <!-- Type selector -->
            <div class="field">
              <label class="field__label">Type <span class="req">*</span></label>
              <select v-model="timelineModal.form.type" class="field__input">
                <option value="education">🎓 Education</option>
                <option value="work">💼 Work Experience</option>
              </select>
            </div>
            <!-- Title -->
            <div class="field">
              <label class="field__label">Title <span class="req">*</span></label>
              <input
                v-model="timelineModal.form.title"
                class="field__input"
                placeholder="e.g. Bachelor of Science in IT"
              />
            </div>
            <!-- Institution -->
            <div class="field">
              <label class="field__label">Institution <span class="req">*</span></label>
              <input
                v-model="timelineModal.form.institution"
                class="field__input"
                placeholder="e.g. Gordon College"
              />
            </div>
            <!-- Location -->
            <div class="field">
              <label class="field__label">Location</label>
              <input
                v-model="timelineModal.form.location"
                class="field__input"
                placeholder="e.g. Olongapo City"
              />
            </div>
            <!-- Start & End dates in a row -->
            <div class="modal-row">
              <div class="field">
                <label class="field__label">Start Date <span class="req">*</span></label>
                <input
                  v-model="timelineModal.form.start_date"
                  class="field__input"
                  placeholder="e.g. 2020 or Jun 2020"
                />
              </div>
              <div class="field">
                <label class="field__label">End Date</label>
                <input
                  v-model="timelineModal.form.end_date"
                  class="field__input"
                  placeholder="e.g. 2024 or Present"
                />
              </div>
            </div>
            <!-- Description -->
            <div class="field">
              <label class="field__label">Description</label>
              <textarea
                v-model="timelineModal.form.description"
                class="field__input field__textarea"
                placeholder="Brief description of your role or course..."
              ></textarea>
            </div>
          </div>
          <p v-if="timelineModal.error" class="login-error">{{ timelineModal.error }}</p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="timelineModal.open = false">Cancel</button>
            <button class="btn-primary" @click="saveTimeline" :disabled="timelineModal.saving">
              {{
                timelineModal.saving
                  ? 'Saving...'
                  : timelineModal.isEdit
                    ? 'Save Changes'
                    : 'Add Entry'
              }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════ HOBBY MODAL ══════════ -->
    <transition name="modal">
      <div v-if="hobbyModal.open" class="modal-overlay" @click.self="hobbyModal.open = false">
        <div class="modal-card" role="dialog">
          <h3 class="modal-title">{{ hobbyModal.isEdit ? 'Edit Hobby' : 'Add Hobby' }}</h3>
          <div class="modal-fields">
            <!-- Hobby name -->
            <div class="field">
              <label class="field__label">Name <span class="req">*</span></label>
              <input
                v-model="hobbyModal.form.name"
                class="field__input"
                placeholder="e.g. Photography"
              />
            </div>
            <!-- Emoji icon -->
            <div class="field">
              <label class="field__label">Icon (Emoji)</label>
              <input v-model="hobbyModal.form.icon" class="field__input" placeholder="e.g. 📷" />
            </div>
            <!-- Short description -->
            <div class="field">
              <label class="field__label">Description</label>
              <textarea
                v-model="hobbyModal.form.description"
                class="field__input field__textarea"
                placeholder="Brief description of this hobby..."
              ></textarea>
            </div>
          </div>
          <p v-if="hobbyModal.error" class="login-error">{{ hobbyModal.error }}</p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="hobbyModal.open = false">Cancel</button>
            <button class="btn-primary" @click="saveHobby" :disabled="hobbyModal.saving">
              {{
                hobbyModal.saving ? 'Saving...' : hobbyModal.isEdit ? 'Save Changes' : 'Add Hobby'
              }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════ DELETE CONFIRM ══════════ -->
    <transition name="modal">
      <div v-if="deleteConfirm.open" class="modal-overlay" @click.self="deleteConfirm.open = false">
        <div class="modal-card modal-card--sm">
          <h3 class="modal-title">
            Delete
            {{
              deleteConfirm.type === 'cert'
                ? 'Certification'
                : deleteConfirm.type === 'project'
                  ? 'Project'
                  : deleteConfirm.type === 'timeline'
                    ? 'Timeline Entry'
                    : 'Hobby'
            }}?
          </h3>
          <p class="modal-sub">
            "<strong>{{ deleteConfirm.title }}</strong
            >" will be permanently removed.
          </p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="deleteConfirm.open = false">Cancel</button>
            <button class="btn-danger" @click="deleteItem" :disabled="deleteConfirm.deleting">
              {{ deleteConfirm.deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const API = 'http://127.0.0.1:8000/api'
const ADMIN_PASSWORD = 'admin123'
const AUTH_KEY = 'admin:auth'

/* ── Auth ── */
const authenticated = ref(false)
const passwordInput = ref('')
const showPassword = ref(false)
const loginError = ref('')

function login() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    authenticated.value = true
    loginError.value = ''
    sessionStorage.setItem(AUTH_KEY, '1')
    loadCerts()
    loadProjects()
    loadResume()
    loadTimeline()
    loadHobbies() // load hobbies on login
  } else {
    loginError.value = 'Incorrect password. Try again.'
  }
}

function logout() {
  authenticated.value = false
  passwordInput.value = ''
  sessionStorage.removeItem(AUTH_KEY)
}

/* ── Tabs ── */
const activeTab = ref('certifications')
function switchTab(tab) {
  activeTab.value = tab
}

/* ── Toast ── */
const saveStatus = ref(null)
let saveTimer = null
function showSave(message, type) {
  clearTimeout(saveTimer)
  saveStatus.value = { message, type }
  saveTimer = setTimeout(() => {
    saveStatus.value = null
  }, 3000)
}

/* ════════════════════════ CERTIFICATIONS ════════════════════════ */
const certifications = ref([])
const certLoading = ref(false)

async function loadCerts() {
  certLoading.value = true
  try {
    const res = await fetch(`${API}/certifications`)
    certifications.value = await res.json()
  } catch {
    certifications.value = []
  } finally {
    certLoading.value = false
  }
}

const certModal = reactive({
  open: false,
  isEdit: false,
  saving: false,
  error: '',
  form: { id: null, title: '', issuer: '', date: '', credential_url: '', badge_url: '' },
})

function openCertModal(cert = null) {
  certModal.open = true
  certModal.isEdit = !!cert
  certModal.error = ''
  certModal.saving = false
  Object.assign(
    certModal.form,
    cert
      ? {
          id: cert.id,
          title: cert.title,
          issuer: cert.issuer || '',
          date: cert.date || '',
          credential_url: cert.credential_url || '',
          badge_url: cert.badge_url || '',
        }
      : { id: null, title: '', issuer: '', date: '', credential_url: '', badge_url: '' },
  )
}

async function saveCert() {
  if (!certModal.form.title.trim()) {
    certModal.error = 'Title is required.'
    return
  }
  certModal.saving = true
  try {
    const url = certModal.isEdit
      ? `${API}/certifications/${certModal.form.id}`
      : `${API}/certifications`
    const method = certModal.isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certModal.form),
    })
    if (!res.ok) throw new Error()
    await loadCerts()
    certModal.open = false
    showSave('✔ Certification saved', 'success')
  } catch {
    certModal.error = 'Failed to save. Try again.'
  } finally {
    certModal.saving = false
  }
}

/* ════════════════════════ PROJECTS ════════════════════════ */
const projects = ref([])
const projLoading = ref(false)

async function loadProjects() {
  projLoading.value = true
  try {
    const res = await fetch(`${API}/projects`)
    projects.value = await res.json()
  } catch {
    projects.value = []
  } finally {
    projLoading.value = false
  }
}

const projectModal = reactive({
  open: false,
  isEdit: false,
  saving: false,
  error: '',
  form: {
    id: null,
    title: '',
    description: '',
    tech_stack: '',
    project_url: '',
    github_url: '',
    thumbnail_url: '',
  },
})

function openProjectModal(project = null) {
  projectModal.open = true
  projectModal.isEdit = !!project
  projectModal.error = ''
  projectModal.saving = false
  Object.assign(
    projectModal.form,
    project
      ? {
          id: project.id,
          title: project.title,
          description: project.description || '',
          tech_stack: project.tech_stack || '',
          project_url: project.project_url || '',
          github_url: project.github_url || '',
          thumbnail_url: project.thumbnail_url || '',
        }
      : {
          id: null,
          title: '',
          description: '',
          tech_stack: '',
          project_url: '',
          github_url: '',
          thumbnail_url: '',
        },
  )
}

async function saveProject() {
  if (!projectModal.form.title.trim()) {
    projectModal.error = 'Title is required.'
    return
  }
  projectModal.saving = true
  try {
    const url = projectModal.isEdit ? `${API}/projects/${projectModal.form.id}` : `${API}/projects`
    const method = projectModal.isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectModal.form),
    })
    if (!res.ok) throw new Error()
    await loadProjects()
    projectModal.open = false
    showSave('✔ Project saved', 'success')
  } catch {
    projectModal.error = 'Failed to save. Try again.'
  } finally {
    projectModal.saving = false
  }
}

/* ════════════════════════ DELETE ════════════════════════ */
const deleteConfirm = reactive({ open: false, type: '', id: null, title: '', deleting: false })

function confirmDeleteCert(cert) {
  Object.assign(deleteConfirm, {
    open: true,
    type: 'cert',
    id: cert.id,
    title: cert.title,
    deleting: false,
  })
}

function confirmDeleteProject(project) {
  Object.assign(deleteConfirm, {
    open: true,
    type: 'project',
    id: project.id,
    title: project.title,
    deleting: false,
  })
}

async function deleteItem() {
  deleteConfirm.deleting = true
  try {
    // Determine endpoint based on type
    const endpoint =
      deleteConfirm.type === 'cert'
        ? 'certifications'
        : deleteConfirm.type === 'project'
          ? 'projects'
          : deleteConfirm.type === 'timeline'
            ? 'timeline'
            : 'hobbies'

    await fetch(`${API}/${endpoint}/${deleteConfirm.id}`, { method: 'DELETE' })

    // Reload the correct list after delete
    if (deleteConfirm.type === 'cert') await loadCerts()
    else if (deleteConfirm.type === 'project') await loadProjects()
    else if (deleteConfirm.type === 'timeline') await loadTimeline()
    else await loadHobbies()

    deleteConfirm.open = false
    showSave('✔ Deleted successfully', 'success')
  } catch {
    showSave('✘ Delete failed. Try again.', 'error')
  } finally {
    deleteConfirm.deleting = false
  }
}

/* ════════════════════════ TIMELINE ════════════════════════ */
const timeline = ref([])
const timelineLoading = ref(false)

// Fetch all timeline entries from API
async function loadTimeline() {
  timelineLoading.value = true
  try {
    const res = await fetch(`${API}/timeline`)
    timeline.value = await res.json()
  } catch {
    timeline.value = []
  } finally {
    timelineLoading.value = false
  }
}

// Timeline modal state
const timelineModal = reactive({
  open: false,
  isEdit: false,
  saving: false,
  error: '',
  form: {
    id: null,
    type: 'education',
    title: '',
    institution: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
  },
})

// Open modal for add or edit
function openTimelineModal(entry = null) {
  timelineModal.open = true
  timelineModal.isEdit = !!entry
  timelineModal.error = ''
  timelineModal.saving = false
  Object.assign(
    timelineModal.form,
    entry
      ? {
          id: entry.id,
          type: entry.type,
          title: entry.title,
          institution: entry.institution,
          location: entry.location || '',
          start_date: entry.start_date,
          end_date: entry.end_date || '',
          description: entry.description || '',
        }
      : {
          id: null,
          type: 'education',
          title: '',
          institution: '',
          location: '',
          start_date: '',
          end_date: '',
          description: '',
        },
  )
}

// Save timeline entry (create or update)
async function saveTimeline() {
  if (!timelineModal.form.title.trim()) {
    timelineModal.error = 'Title is required.'
    return
  }
  if (!timelineModal.form.institution.trim()) {
    timelineModal.error = 'Institution is required.'
    return
  }
  if (!timelineModal.form.start_date.trim()) {
    timelineModal.error = 'Start date is required.'
    return
  }
  timelineModal.saving = true
  try {
    const url = timelineModal.isEdit
      ? `${API}/timeline/${timelineModal.form.id}`
      : `${API}/timeline`
    const method = timelineModal.isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timelineModal.form),
    })
    if (!res.ok) throw new Error()
    await loadTimeline()
    timelineModal.open = false
    showSave('✔ Timeline entry saved', 'success')
  } catch {
    timelineModal.error = 'Failed to save. Try again.'
  } finally {
    timelineModal.saving = false
  }
}

// Confirm delete timeline entry
function confirmDeleteTimeline(entry) {
  Object.assign(deleteConfirm, {
    open: true,
    type: 'timeline',
    id: entry.id,
    title: entry.title,
    deleting: false,
  })
}

/* ════════════════════════ HOBBIES ════════════════════════ */
const hobbies = ref([])
const hobbyLoading = ref(false)

// Fetch all hobbies from API
async function loadHobbies() {
  hobbyLoading.value = true
  try {
    const res = await fetch(`${API}/hobbies`)
    hobbies.value = await res.json()
  } catch {
    hobbies.value = []
  } finally {
    hobbyLoading.value = false
  }
}

// Hobby modal state
const hobbyModal = reactive({
  open: false,
  isEdit: false,
  saving: false,
  error: '',
  form: { id: null, name: '', icon: '', description: '' },
})

// Open modal for add or edit
function openHobbyModal(hobby = null) {
  hobbyModal.open = true
  hobbyModal.isEdit = !!hobby
  hobbyModal.error = ''
  hobbyModal.saving = false
  Object.assign(
    hobbyModal.form,
    hobby
      ? {
          id: hobby.id,
          name: hobby.name,
          icon: hobby.icon || '',
          description: hobby.description || '',
        }
      : { id: null, name: '', icon: '', description: '' },
  )
}

// Save hobby (create or update)
async function saveHobby() {
  if (!hobbyModal.form.name.trim()) {
    hobbyModal.error = 'Name is required.'
    return
  }
  hobbyModal.saving = true
  try {
    const url = hobbyModal.isEdit ? `${API}/hobbies/${hobbyModal.form.id}` : `${API}/hobbies`
    const method = hobbyModal.isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hobbyModal.form),
    })
    if (!res.ok) throw new Error()
    await loadHobbies()
    hobbyModal.open = false
    showSave('✔ Hobby saved', 'success')
  } catch {
    hobbyModal.error = 'Failed to save. Try again.'
  } finally {
    hobbyModal.saving = false
  }
}

// Confirm delete hobby
function confirmDeleteHobby(hobby) {
  Object.assign(deleteConfirm, {
    open: true,
    type: 'hobby',
    id: hobby.id,
    title: hobby.name,
    deleting: false,
  })
}

/* ════════════════════════ RESUME ════════════════════════ */
const resumeUrl = ref('')
const resumeLoading = ref(false)
const resumeSaving = ref(false)

async function loadResume() {
  resumeLoading.value = true
  try {
    const res = await fetch(`${API}/resume`)
    const data = await res.json()
    resumeUrl.value = data.pdf_url || ''
  } catch {
    resumeUrl.value = ''
  } finally {
    resumeLoading.value = false
  }
}

async function saveResume() {
  if (!resumeUrl.value.trim()) return
  resumeSaving.value = true
  try {
    const res = await fetch(`${API}/resume`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdf_url: resumeUrl.value }),
    })
    if (!res.ok) throw new Error()
    showSave('✔ Resume URL saved', 'success')
  } catch {
    showSave('✘ Failed to save. Try again.', 'error')
  } finally {
    resumeSaving.value = false
  }
}

/* ── Restore session across page reloads ── */
onMounted(() => {
  if (sessionStorage.getItem(AUTH_KEY) === '1') {
    authenticated.value = true
    loadCerts()
    loadProjects()
    loadResume()
    loadTimeline()
    loadHobbies()
  }
})
</script>

<style scoped>
:root {
  --bg: #0b0f17;
  --card: #0f1724;
  --muted: #9aa4b2;
  --accent: #7cdbb6;
}

.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--bg);
}
.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--card);
  border: 1px solid rgba(124, 219, 182, 0.12);
  border-radius: 18px;
  padding: 2.5rem 2rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.login-logo {
  font-size: 2.5rem;
  text-align: center;
}
.login-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--accent);
  text-align: center;
  letter-spacing: 0.5px;
}
.login-sub {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
}
.login-error {
  color: #f87171;
  font-size: 0.85rem;
  margin: 0;
  background: rgba(248, 113, 113, 0.08);
  border-radius: 8px;
  padding: 8px 12px;
}
.login-hint {
  color: var(--muted);
  font-size: 0.75rem;
  text-align: center;
  margin: 0;
  opacity: 0.7;
}
.login-hint code {
  background: rgba(124, 219, 182, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent);
  font-size: 0.8rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field__label {
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.req {
  color: #f87171;
}
.field__input-wrap {
  position: relative;
}
.field__input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2f5ef;
  padding: 10px 14px;
  font-size: 0.9rem;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}
.field__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(124, 219, 182, 0.1);
}
.field__textarea {
  min-height: 80px;
  resize: vertical;
}
.field__eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(90deg, var(--accent), #49c19b);
  color: #01221a;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(124, 219, 182, 0.3);
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-ghost {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--muted);
  font-size: 0.88rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ghost:hover {
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.btn-danger {
  padding: 10px 16px;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  color: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.3);
}
.btn-danger:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
.btn-edit,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.2s;
}
.btn-edit:hover {
  background: rgba(124, 219, 182, 0.1);
}
.btn-delete:hover {
  background: rgba(239, 68, 68, 0.12);
}

.admin-dashboard {
  min-height: 100vh;
  background: var(--bg);
  padding: 1.5rem;
  font-family: inherit;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.admin-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-badge {
  background: rgba(124, 219, 182, 0.1);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(124, 219, 182, 0.2);
}
.admin-title {
  margin: 0;
  font-size: 1.2rem;
  color: #e2f5ef;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.admin-tab {
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
  border-radius: 8px 8px 0 0;
}
.admin-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
}
.admin-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: rgba(124, 219, 182, 0.05);
}

.admin-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.cert-count {
  color: var(--muted);
  font-size: 0.85rem;
}

.save-toast {
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.save-toast.success {
  background: rgba(124, 219, 182, 0.1);
  color: var(--accent);
  border: 1px solid rgba(124, 219, 182, 0.2);
}
.save-toast.error {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.admin-empty {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--muted);
}
.admin-empty__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.cert-table-wrap {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.cert-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.cert-table thead {
  background: rgba(255, 255, 255, 0.03);
}
.cert-table th {
  text-align: left;
  padding: 10px 14px;
  color: var(--muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}
.th-actions {
  width: 40px;
}
.cert-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}
.cert-row:hover {
  background: rgba(124, 219, 182, 0.03);
}
.cert-table td {
  padding: 10px 14px;
  vertical-align: middle;
}
.td-title {
  color: #e2f5ef;
  font-weight: 600;
}
.td-muted {
  color: var(--muted);
}
.td-desc {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.td-url {
  color: var(--muted);
}
.td-actions {
  white-space: nowrap;
}
.url-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.82rem;
}
.url-link:hover {
  text-decoration: underline;
}
.url-pill {
  font-size: 0.78rem;
  background: rgba(124, 219, 182, 0.08);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 20px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}
.modal-card {
  background: var(--card);
  border: 1px solid rgba(124, 219, 182, 0.12);
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.8);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-card--sm {
  max-width: 380px;
}
.modal-title {
  margin: 0 0 1.25rem 0;
  font-size: 1.1rem;
  color: var(--accent);
}
.modal-sub {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
}
.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.25rem;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.modal-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active {
  transition: all 0.18s ease;
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ════════════════════════ RESUME ════════════════════════ */
.resume-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 700px;
}

.resume-hint {
  color: var(--muted);
  font-size: 0.78rem;
  margin: 4px 0 0 0;
}

.resume-hint code {
  background: rgba(124, 219, 182, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent);
  font-size: 0.78rem;
}

.resume-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resume-preview__label {
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.resume-preview__frame {
  width: 100%;
  height: 500px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.resume-actions {
  display: flex;
  gap: 10px;
}

/* Timeline type badges */
.badge-edu {
  display: inline-block;
  padding: 3px 8px;
  background: rgba(99, 179, 237, 0.12);
  color: #63b3ed;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-work {
  display: inline-block;
  padding: 3px 8px;
  background: rgba(124, 219, 182, 0.12);
  color: var(--accent);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Two-column row inside modal */
.modal-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .modal-row {
    grid-template-columns: 1fr;
  }
}
</style>
