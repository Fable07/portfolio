<template>
  <div id="app">
    <div class="nav-container">
      <h1>Jefferson Caragay</h1>
      <h2>Intern</h2>
      <nav>
        <a href="#" @click.prevent="showSection('experience')">Experience</a>
        <a href="#" @click.prevent="showSection('skills')">Skills</a>
        <a href="#" @click.prevent="showSection('education')">Education</a>
      </nav>

      <!-- Experience Section -->
      <div v-if="activeSection === 'experience'" class="section">
        <h2>Experience</h2>
        <ul>
          <li>
            <strong>Intern at Simplevia Technologies Inc.</strong> 
            <li>2024 - Present</li>
            <ul style="list-style-type:circle;">
              <li>Installed VueJS and Laravel.</li>
              <li>Created pages in Vue 3.</li>
              <li>Developed REST APIs in Laravel 9.</li>
              <li>Fetched data using APIs in Vue.js 3.</li>
              <li>Integrated Tailwind into VueJS.</li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Skills Section -->
      <div v-if="activeSection === 'skills'" class="section">
        <h2>Skills</h2>
        <ul style="list-style-type:circle;">
          <li>JavaScript, Python, Java, Kotlin (Proficient)</li>
          <li>Vue.js, Laravel, Tailwind (Knowledgeable)</li>
          <li>UI/UX Design (Experienced)</li>
          <li>SQL and NoSQL databases (Firebase, MySQL, IBM)</li>
        </ul>
      </div>

      <!-- Education Section -->
      <div v-if="activeSection === 'education'" class="section">
        <h2>Education</h2>
        <ul>
          <li><strong>Bachelor of Science in Information Technology</strong> - New Era University</li>
        </ul>
        <h2>Certifications</h2>
        <ul style="list-style-type:circle;">
          <li><strong>Certificate in Cybersecurity Training Program (Capture-The-Flag)</strong> - NEU (April 5, 2024)</li>
          <li><strong>Big Data 101</strong> - Cognitive Class (May 2023)</li>
          <li><strong>NoSQL and DBaaS 101</strong> - Cognitive Class (May 2023)</li>
          <li><strong>Analytics 101 for Businesses</strong> - Ask Lex PH Academy (February 2024)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activeSection: 'experience',
    };
  },
  methods: {
    showSection(section) {
      this.activeSection = section;
    },
  },
};
</script>

<style scoped>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
}

.nav-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 2px solid #333;
    border-radius: 10px;
    background-color: #0a0606;
    color: white; /* Change text color for better contrast */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
}

nav {
    text-align: center;
    margin-bottom: 20px;
}

nav a {
    margin: 0 15px;
    text-decoration: none;
    color: #00bfff; /* Link color */
}

nav a:hover {
    text-decoration: underline;
}

.section {
    display: block; /* Show sections based on active state */
}

ul {
  text-align: left;
    list-style-type: none;
    padding: 25;
    margin: 20px 0;
}

ul li {
    margin: 5px 0;
}
</style>