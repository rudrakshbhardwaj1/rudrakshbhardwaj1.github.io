// ===== CONFIG - UPDATE THESE =====
const GITHUB_USERNAME = "rudrakshbhardwaj1";
const LEETCODE_USERNAME = "rudrakshbhardwaj1";
const REPO_COUNT = 7;

// ===== Loader =====
window.addEventListener('load', () => {
  document.getElementById('loader').classList.add('hide');
});

// ===== Navbar scroll effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  toggleBackToTop();
  highlightNav();
});

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// ===== Active nav link on scroll =====
function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 150;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

// ===== Theme toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
  themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  themeToggle.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ===== Typed text effect =====
const typedTextEl = document.getElementById('typed');
const phrases = ["Frontend Developer", "DSA Enthusiast", "MERN Stack Developer", "Problem Solver"];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
  const currentPhrase = phrases[phraseIndex];
  if (isDeleting) {
    typedTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentPhrase.length) {
    speed = 1500;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    speed = 500;
  }
  setTimeout(typeEffect, speed);
}
typeEffect();

// ===== Back to top button =====
const backToTop = document.getElementById('backToTop');
function toggleBackToTop() {
  backToTop.classList.toggle('show', window.scrollY > 400);
}
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Scroll reveal animation =====
document.querySelectorAll('.section, .stat-box, .info-card, .skill-category, .project-card, .repo-card')
  .forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== Counter animation for stats =====
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = target + "+";
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(document.getElementById('stat-projects'), 5);
      animateCounter(document.getElementById('stat-experience'), 0);
      animateCounter(document.getElementById('stat-problems'), 100);
      animateCounter(document.getElementById('stat-repos'), 8);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
statsObserver.observe(document.querySelector('.about-stats'));

// ===== Fetch GitHub Repos =====
async function fetchGitHubRepos() {
  const container = document.getElementById('repoContainer');
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=${REPO_COUNT}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const repos = await res.json();

    container.innerHTML = '';

    if (repos.length === 0) {
      container.innerHTML = '<div class="error-repos">No repositories found.</div>';
      return;
    }

    repos.forEach(repo => {
      const card = document.createElement('div');
      card.classList.add('repo-card', 'fade-up');
      card.innerHTML = `
        <div class="repo-header">
          <h3><a href="${repo.html_url}" target="_blank"><i class="fa-solid fa-code-branch"></i> ${repo.name}</a></h3>
        </div>
        <p class="repo-desc">${repo.description || 'No description available.'}</p>
        <div class="repo-meta">
          <span><span class="lang-dot"></span> ${repo.language || 'N/A'}</span>
          <span><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
          <span><i class="fa-solid fa-code-fork"></i> ${repo.forks_count}</span>
        </div>
      `;
      container.appendChild(card);
      observer.observe(card);
    });
  } catch (error) {
    container.innerHTML = '<div class="error-repos">Unable to load repositories. Please check the username or try again later.</div>';
    console.error(error);
  }
}
fetchGitHubRepos();

// ===== Fetch LeetCode Stats (using public API) =====
// ===== Fetch LeetCode Stats (Updated with working API + fallback) =====
async function fetchLeetCodeStats() {
  const solvedEl = document.getElementById('lcSolved');
  const rankingEl = document.getElementById('lcRanking');
  const streakEl = document.getElementById('lcStreak');

  // Show loading state
  solvedEl.textContent = '...';
  rankingEl.textContent = '...';
  streakEl.textContent = '...';

  try {
    // Primary API: alfa-leetcode-api (actively maintained)
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`);
    
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    
    const data = await res.json();
    console.log('LeetCode Data:', data); // Debug log - check console

    if (!data || data.solvedProblem === undefined) {
      throw new Error('Invalid data structure');
    }

    // Update main stats
    solvedEl.textContent = data.solvedProblem || 0;
    
    // Fetch additional profile data (ranking)
    try {
      const profileRes = await fetch(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}`);
      const profileData = await profileRes.json();
      rankingEl.textContent = profileData.ranking ? `#${profileData.ranking.toLocaleString()}` : 'N/A';
    } catch (e) {
      rankingEl.textContent = 'N/A';
    }

    streakEl.textContent = data.acceptanceRate ? `${data.acceptanceRate}%` : 'N/A';

    // Update difficulty breakdown
    const easy = data.easySolved || 0;
    const medium = data.mediumSolved || 0;
    const hard = data.hardSolved || 0;
    const totalEasy = data.totalEasy || 800;
    const totalMedium = data.totalMedium || 1700;
    const totalHard = data.totalHard || 700;

    document.getElementById('easyCount').textContent = easy;
    document.getElementById('mediumCount').textContent = medium;
    document.getElementById('hardCount').textContent = hard;

    setTimeout(() => {
      document.getElementById('easyBar').style.width = `${(easy / totalEasy) * 100}%`;
      document.getElementById('mediumBar').style.width = `${(medium / totalMedium) * 100}%`;
      document.getElementById('hardBar').style.width = `${(hard / totalHard) * 100}%`;
    }, 300);

  } catch (error) {
    console.error('LeetCode API Error:', error);
    
    // Try fallback API
    await tryFallbackLeetCodeAPI();
  }
}

// ===== Fallback API attempt =====
async function tryFallbackLeetCodeAPI() {
  try {
    const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${rudrakshbhardwaj1}`);
    const data = await res.json();

    if (data.status === 'error') throw new Error('User not found');

    document.getElementById('lcSolved').textContent = data.totalSolved || 'N/A';
    document.getElementById('lcRanking').textContent = data.ranking ? `#${data.ranking.toLocaleString()}` : 'N/A';
    document.getElementById('lcStreak').textContent = data.acceptanceRate ? `${data.acceptanceRate}%` : 'N/A';

    document.getElementById('easyCount').textContent = data.easySolved || 0;
    document.getElementById('mediumCount').textContent = data.mediumSolved || 0;
    document.getElementById('hardCount').textContent = data.hardSolved || 0;

    setTimeout(() => {
      document.getElementById('easyBar').style.width = `${(data.easySolved / data.totalEasy) * 100}%`;
      document.getElementById('mediumBar').style.width = `${(data.mediumSolved / data.totalMedium) * 100}%`;
      document.getElementById('hardBar').style.width = `${(data.hardSolved / data.totalHard) * 100}%`;
    }, 300);

  } catch (error) {
    console.error('Fallback API also failed:', error);
    showLeetCodeError();
  }
}

// ===== Show error state gracefully =====
function showLeetCodeError() {
  document.getElementById('lcSolved').textContent = 'N/A';
  document.getElementById('lcRanking').textContent = 'N/A';
  document.getElementById('lcStreak').textContent = 'N/A';
  document.getElementById('easyCount').textContent = '0';
  document.getElementById('mediumCount').textContent = '0';
  document.getElementById('hardCount').textContent = '0';
  
  const leetcodeCard = document.querySelector('.leetcode-card');
  const errorMsg = document.createElement('p');
  errorMsg.style.cssText = 'color: var(--text-gray); margin-top: 15px; font-size: 0.9rem;';
  errorMsg.textContent = '⚠️ Live stats temporarily unavailable. Please visit my profile directly.';
  leetcodeCard.insertBefore(errorMsg, leetcodeCard.querySelector('.btn'));
}

fetchLeetCodeStats();

// ===== Contact form (demo - integrate with EmailJS/Formspree) =====
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you for your message! I will get back to you soon.\n\n(Connect this form to EmailJS or Formspree for real submissions)');
  contactForm.reset();
});

// ===== Matrix Rain Effect =====
function initMatrixRain() {
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = "01アイウエオカキクケコサシスセソ{}[]()<>;=+-*/&|!?".split('');
  const fontSize = 16;
  const columns = canvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const isDark = document.body.classList.contains('dark-mode');
    ctx.fillStyle = isDark ? '#00ff9d' : '#6c5ce7';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
initMatrixRain();

// ===== Mouse Move Parallax Effect on Glow Orbs =====
document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.glow-orb');
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 15;
    const xOffset = (x - 0.5) * speed;
    const yOffset = (y - 0.5) * speed;
    orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  });
});

// ===== Dynamic Floating Symbols Generator =====
function createFloatingSymbols() {
  const symbols = ['<', '>', '{', '}', '/', ';', '(', ')', '=>', '&&', '||', '++'];
  const container = document.getElementById('floatingSymbols');
  
  for (let i = 0; i < 15; i++) {
    const span = document.createElement('span');
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.cssText = `
      position: fixed;
      top: ${Math.random() * 100}vh;
      left: ${Math.random() * 100}vw;
      font-family: 'Courier New', monospace;
      font-size: ${Math.random() * 20 + 15}px;
      color: var(--primary);
      opacity: ${Math.random() * 0.08 + 0.02};
      pointer-events: none;
      z-index: -1;
      animation: symbolFloat ${Math.random() * 10 + 10}s linear infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    container.appendChild(span);
  }
}
createFloatingSymbols();

// Add keyframe dynamically for symbol floating
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes symbolFloat {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-100vh) rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

// ===== Typing sound effect on hover (optional - subtle click feel) =====
document.querySelectorAll('.btn, .nav-links a').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.transition = 'all 0.2s ease';
  });
});
// Disable matrix rain on mobile for performance
if (window.innerWidth > 768) {
  initMatrixRain();
}

