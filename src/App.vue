<template>
  <div id="app">
    <div class="nav-container">
      <nav>
        <a href="#" @click.prevent="showSection('profile')">Profile</a>
        <a href="#" @click.prevent="showSection('resume')">Resume</a>
        <a href="#" @click.prevent="showSection('education')">Education</a>
        <a href="#" @click.prevent="showSection('admin')">Admin</a>
      </nav>

      <!-- Profile Section -->
      <div v-if="activeSection === 'profile'" class="section">
        <h2>Profile</h2>
        <img :src="profileImage" alt="img" class="profile-image" />
      <h1>Jefferson Caragay</h1>
      <h2>Back-end Developer</h2>
        <ul>
          <li>
            <strong>About me</strong>
            <ul>
              <li>a passionate backend developer with a deep love for building scalable, reliable, and secure systems that power web applications.
                 My expertise lies in developing efficient APIs, managing databases, and ensuring smooth server-side operations that keep applications running seamlessly. 
                 My fascination with backend development comes from the challenge of problem-solving, optimizing performance, and making things work under the hood that users never see but always rely on.</li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            <strong>Software and Languages that I used</strong>
            <ul class="horizontal-list">
              <li>
                <img src="https://icon-library.com/images/visual-studio-icon-png/visual-studio-icon-png-25.jpg" alt="VS Code Icon" class="small-icon" />
                Visual Studio Code
              </li>
              <li>
                <img src="https://brandlogos.net/wp-content/uploads/2021/11/java-logo.png" alt="java Icon" class="small-icon" />
                Java
              </li>
              <li>
                <img src="https://th.bing.com/th/id/OIP.O5FljqxsC4sCHsAUz4cevgHaHa?rs=1&pid=ImgDetMain" alt="pycharm Icon" class="small-icon" />
                Pycharm
              </li>
              <li>
                <img src="https://images.hdqwalls.com/download/python-logo-4k-i6-2560x1440.jpg" alt="python Icon" class="small-icon" />
                Python
              </li>
              <li>
                <img src="https://pngimg.com/uploads/mysql/mysql_PNG23.png" alt="sql Icon" class="small-icon" />
                SQL
              </li>
              <li>
                <img src="https://www.wizcase.com/wp-content/uploads/2021/05/Eclipse-IDE-Logo.jpg" alt="Eclipse Icon" class="small-icon" />
                Eclipse
              </li>
              <li>
                <img src="https://download.logo.wine/logo/Kotlin_(programming_language)/Kotlin_(programming_language)-Logo.wine.png" alt="kotlin Icon" class="small-icon" />
                Kotlin
              </li>
              <li>
                <img src="https://hurbad.com/wp-content/uploads/2021/12/Cisco-Packet-Tracer.png" alt="cisco packet Icon" class="small-icon" />
                Cisco Packet Tracer
              </li>
              <li>
                <img src="https://th.bing.com/th/id/OIP.AwZGcEjenWFglP9XSgo5owHaIV?rs=1&pid=ImgDetMain" alt="Android Studio Icon" class="small-icon" />
                Android Studio
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Resume Section -->
      <div v-if="activeSection === 'resume'" class="section">
        <h2>Resume</h2>
        <ul>
          <li>
            <strong>Resume</strong>
            <iframe
              src="/resume.pdf"
              width="900px"
              height="700px"
              frameborder="0"
            ></iframe>
          </li>
        </ul>
      </div>

      <!-- Education Section -->
      <div v-if="activeSection === 'education'" class="section">
        <h2>Education</h2>
        <ul>
          <li><strong>Bachelor of Science in Information Technology</strong> - New Era University</li>
        </ul>
        <h2>Certifications</h2>
        <ul>
      <li v-for="cert in certifications" :key="cert.id">
        <strong>
          {{ cert.title }}</strong> - {{ cert.institution }} ({{ cert.date }})
        <img :src="cert.image" alt="img" />
      </li>
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
      activeSection: 'profile',
      profileImage: 'data:image/jpeg;base64,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'
      ,
      certifications: [
        {
          id: 1,
          title: 'Certificate in Cybersecurity Training Program (Capture-The-Flag)',
          institution: 'NEU',
          date: 'April 5, 2024',
          image: 'https://lh3.googleusercontent.com/MmRf-X941OqF0Suqp_KSAoy8iT1zL5a9YPwXvoLYqYIzth2dTu3-SmzT83TpCKhtnxN2EF3LqccVN7uo0yIX8Xg'
        },
        {
          id: 2,
          title: 'Big Data 101',
          institution: 'Cognitive Class',
          date: 'May 2023',
          image: 'https://lh3.googleusercontent.com/2Uiq3WfQWzcahSWBNJulC5sMm9_VT8sNlHzBCRe4esOKzo9vreLuMktS5MOQZ0ENLUXnNCmQlfNt2XMzmYgxiMI'
        },
        {
          id: 3,
          title: 'NoSQL and DBaaS 101',
          institution: 'Cognitive Class',
          date: 'May 2023',
          image: 'https://lh3.googleusercontent.com/2Uiq3WfQWzcahSWBNJulC5sMm9_VT8sNlHzBCRe4esOKzo9vreLuMktS5MOQZ0ENLUXnNCmQlfNt2XMzmYgxiMI'
        },
        {
          id: 4,
          title: 'Analytics 101 for Businesses',
          institution: 'Ask Lex PH Academy',
          date: 'February 2024',
          image: 'https://lh4.googleusercontent.com/COQSkSnqOzWuE10fb4JEctYvMyECE408CZ-7lLOZI5QmlZV_HfWtxD3UpIfmWoM9528cCtxtqh1KrMLkY3d0T0U'
        }
      ]
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

img {
  display: block;
  margin: 10px auto;
  max-width: 800px;
  height: 400px;
}

.resume {
  width: 100%; 
  height: 600px;
  vertical-align: middle;
  margin-right: 8px;

}

.horizontal-list {
    display: flex;            
    gap: 20px;                
    list-style-type: none;    
    padding: 0;               
    margin: 0;
  }

.small-icon {
    width: 50px; 
    height: 50px;
    vertical-align: middle; 
    margin-right: 8px;
  }

.profile-image {
  width: 250px;          
  height: 250px;         
  border-radius: 50%;
  object-fit: fill;     
}

body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 40px;
}

.nav-container {
    max-width: max-content;
    margin: 80px;
    padding: 30px;
    border: 5px solid #333;
    border-radius: 8px;
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