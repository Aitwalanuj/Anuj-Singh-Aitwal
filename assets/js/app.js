const state = { content: null };

function get(obj, path, fallback = '') {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function bindText(content) {
  document.querySelectorAll('[data-bind]').forEach((node) => {
    const value = get(content, node.dataset.bind, node.textContent);
    node.textContent = value;
  });
  document.querySelectorAll('[data-bind-href]').forEach((node) => {
    const value = get(content, node.dataset.bindHref, node.getAttribute('href'));
    node.setAttribute('href', value);
  });
}

function renderNav(content) {
  const nav = document.getElementById('mainNav');
  nav.innerHTML = (content.site.nav || [])
    .map((item) => `<a href="${esc(item.href)}">${esc(item.label)}</a>`)
    .join('');
}

function renderBadges(content) {
  document.getElementById('heroBadges').innerHTML = (content.hero.badges || [])
    .map((item) => `<span class="badge">${esc(item)}</span>`)
    .join('');
}

function renderStats(content) {
  document.getElementById('statsGrid').innerHTML = (content.stats || [])
    .map((item) => `<article class="stat-card"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></article>`)
    .join('');
}

function renderAbout(content) {
  document.getElementById('aboutParagraphs').innerHTML = (content.about.paragraphs || [])
    .map((item) => `<p>${esc(item)}</p>`)
    .join('');
}

function bulletList(items = []) {
  return items.length ? `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '';
}

function renderServices(content) {
  document.getElementById('servicesGrid').innerHTML = (content.services || [])
    .map((service) => `
      <article class="card">
        <h3>${esc(service.title)}</h3>
        <p>${esc(service.description)}</p>
        ${bulletList(service.bullets)}
      </article>`)
    .join('');
}

function renderProcess(content) {
  document.getElementById('processSteps').innerHTML = (content.process.steps || [])
    .map((step) => `
      <article class="step-card">
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.description)}</p>
      </article>`)
    .join('');
}

function renderModules(content) {
  document.getElementById('modulePills').innerHTML = (content.modules.items || [])
    .map((item) => `<span class="pill">${esc(item)}</span>`)
    .join('');
}

function renderIndustries(content) {
  document.getElementById('industriesGrid').innerHTML = (content.industries.items || [])
    .map((item) => `
      <article class="card">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
      </article>`)
    .join('');
}

function renderExperience(content) {
  document.getElementById('experienceList').innerHTML = (content.experience.items || [])
    .map((item) => `
      <article class="experience-item">
        <div>
          <h3>${esc(item.role)}</h3>
          <p class="experience-meta">${esc(item.company)}<br>${esc(item.period)}</p>
        </div>
        <div>
          <p class="experience-summary">${esc(item.summary)}</p>
          ${bulletList(item.highlights)}
        </div>
      </article>`)
    .join('');
}

function renderProjects(content) {
  document.getElementById('projectList').innerHTML = (content.projects.items || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join('');
}

function renderSkills(content) {
  document.getElementById('skillsGrid').innerHTML = (content.skills.groups || [])
    .map((group) => `
      <article class="skill-box">
        <h3>${esc(group.title)}</h3>
        <ul>${(group.items || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
      </article>`)
    .join('');
}

function renderEducation(content) {
  document.getElementById('educationList').innerHTML = (content.education.items || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join('');
}

function renderContactLinks(content) {
  const phone = get(content, 'contact.phone');
  const email = get(content, 'contact.email');
  const phoneLink = document.getElementById('phoneLink');
  const emailLink = document.getElementById('emailLink');
  if (phoneLink) phoneLink.href = `tel:${String(phone).replace(/\s/g, '')}`;
  if (emailLink) emailLink.href = `mailto:${email}`;
}

function renderSeo(content) {
  if (content.seo?.title) document.title = content.seo.title;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && content.seo?.description) metaDescription.setAttribute('content', content.seo.description);
}

function renderAll(content) {
  state.content = content;
  renderSeo(content);
  bindText(content);
  renderNav(content);
  renderBadges(content);
  renderStats(content);
  renderAbout(content);
  renderServices(content);
  renderProcess(content);
  renderModules(content);
  renderIndustries(content);
  renderExperience(content);
  renderProjects(content);
  renderSkills(content);
  renderEducation(content);
  renderContactLinks(content);
}

async function loadContent() {
  const response = await fetch('data/content.json', { cache: 'default' });
  if (!response.ok) throw new Error('Could not load website content.');
  const content = await response.json();
  renderAll(content);
}

function setupMenu() {
  const button = document.getElementById('menuButton');
  const nav = document.getElementById('mainNav');
  button?.addEventListener('click', () => nav.classList.toggle('open'));
  nav?.addEventListener('click', () => nav.classList.remove('open'));
}

function setupForm() {
  const form = document.getElementById('consultationForm');
  const status = document.getElementById('formStatus');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload.website) return;

    const endpoint = get(state.content, 'contact.formEndpoint', '').trim();
    const email = get(state.content, 'contact.email', '');
    const successMessage = get(state.content, 'contact.formSuccessMessage', 'Thank you. I will get back to you soon.');
    status.textContent = 'Sending...';

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Form endpoint rejected the request.');
        form.reset();
        status.textContent = successMessage;
        return;
      } catch (error) {
        status.textContent = 'Online form could not be sent. Opening email instead.';
      }
    }

    const subject = encodeURIComponent(`Odoo consultation request from ${payload.name || 'website visitor'}`);
    const body = encodeURIComponent([
      `Name: ${payload.name || ''}`,
      `Email: ${payload.email || ''}`,
      `Company: ${payload.company || ''}`,
      `Challenge: ${payload.challenge || ''}`,
      '',
      payload.message || ''
    ].join('\n'));
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    status.textContent = 'Your email app should open. Please send the prepared message.';
  });
}

setupMenu();
setupForm();
loadContent().catch((error) => {
  console.error(error);
  document.body.insertAdjacentHTML('afterbegin', '<div class="notice danger">Website content could not be loaded.</div>');
});
