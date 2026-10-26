import { siteContent } from "./content.js";

const setText = (selector, value) => document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));
const publisherUrl = (value, doi) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "#";
  } catch {
    return doi ? `https://doi.org/${encodeURIComponent(doi)}` : "#";
  }
};
const renderInto = (selector, markup) => {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = markup;
};
const leaderCardMarkup = (person) => `
  <article class="leader-card">
    <img src="${escapeHtml(person.image)}" alt="${escapeHtml(person.alt)}" width="640" height="960" loading="lazy" />
    <div class="leader-card-copy">
      <p class="eyebrow">${escapeHtml(person.role)}</p>
      <h3><a href="${escapeHtml(person.profile)}">${escapeHtml(person.name)}</a></h3>
      <p class="leader-affiliation">${escapeHtml(person.affiliation)}</p>
      <a class="leader-profile-link" href="${escapeHtml(person.profile)}">View profile <span aria-hidden="true">→</span></a>
    </div>
  </article>`;

function renderContent() {
  setText("[data-site-name]", siteContent.siteName);
  setText("[data-hero-title]", siteContent.hero.title);
  setText("[data-hero-summary]", siteContent.hero.summary);
  setText("[data-home-statement]", siteContent.homeStatement);
  setText("[data-join-copy]", siteContent.joinCopy);
  renderInto("[data-job-openings]", siteContent.jobOpenings.map((opening, index) => `
    <article class="opening-card">
      <span class="opening-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <div class="opening-card-copy"><h3>${escapeHtml(opening.title)}</h3><p>${escapeHtml(opening.description)}</p></div>
      <a class="opening-link" href="contact.html" aria-label="Enquire about ${escapeHtml(opening.title)}">Enquire about this opportunity <span aria-hidden="true">↗</span></a>
    </article>`).join(""));
  setText("[data-institution]", siteContent.contact.institution);
  setText("[data-address]", siteContent.contact.address);
  setText("[data-contact-person]", siteContent.contact.person);
  setText("[data-year]", new Date().getFullYear());

  const email = document.querySelector("[data-email]");
  if (email) {
    email.href = `mailto:${siteContent.contact.email}`;
    email.textContent = siteContent.contact.email;
  }

  renderInto("[data-research-themes]", siteContent.researchThemes.map((theme) => `
    <article class="theme-card">
      <div class="theme-card-media" aria-hidden="true"><img src="${escapeHtml(theme.image)}" alt="" loading="lazy" decoding="async" /><span class="theme-card-number">${escapeHtml(theme.number)}</span></div>
      <div class="theme-card-body"><h3>${escapeHtml(theme.title)}</h3><p>${escapeHtml(theme.description)}</p></div>
    </article>`).join(""));
  renderInto("[data-leadership-groups]", siteContent.leadershipGroups.map((group) => {
    const groupId = group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<section class="leadership-section" aria-labelledby="${escapeHtml(groupId)}"><div class="section-heading people-heading"><p class="eyebrow">Leadership</p><h2 id="${escapeHtml(groupId)}">${escapeHtml(group.title)}</h2></div><div class="leadership-grid">${group.members.map(leaderCardMarkup).join("")}</div></section>`;
  }).join(""));
  const peopleGroups = siteContent.peopleGroups
    .map((group) => ({ ...group, members: group.members.filter((person) => !person.placeholder) }))
    .filter((group) => group.members.length > 0);
  renderInto("[data-people-groups]", peopleGroups.map((group) => `
    <section class="people-group" aria-labelledby="${escapeHtml(group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}"><div class="group-heading"><h2 id="${escapeHtml(group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">${escapeHtml(group.title)}</h2></div><div class="member-grid">${group.members.map((person) => `
      <article class="member-card"><img class="member-photo" src="${escapeHtml(person.image)}" alt="${escapeHtml(person.alt)}" width="640" height="800" loading="lazy" /><div class="member-card-copy"><h3>${person.profile ? `<a href="${escapeHtml(person.profile)}">${escapeHtml(person.name)}</a>` : escapeHtml(person.name)}</h3><p>${escapeHtml(person.role)}</p>${person.profile ? `<a class="member-profile-link" href="${escapeHtml(person.profile)}">View profile <span aria-hidden="true">→</span></a>` : ""}</div></article>`).join("")}</div></section>`).join(""));

  const profileKey = document.body.dataset.profile;
  const profile = profileKey ? siteContent.profiles[profileKey] : null;
  if (profile) {
    renderInto("[data-profile-content]", `
      <nav class="profile-breadcrumb section-shell" aria-label="Breadcrumb"><a href="people.html">People</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(profile.name)}</span></nav>
      <section class="profile-hero${profile.kind === "student" ? " profile-hero--student" : ""} section-shell" aria-labelledby="profile-name">
        <div class="profile-portrait"><img src="${escapeHtml(profile.image)}" alt="${escapeHtml(profile.alt)}" width="640" height="960" /></div>
        <div class="profile-hero-copy"><p class="eyebrow">${escapeHtml(profile.role)}</p><h1 id="profile-name">${escapeHtml(profile.name)}</h1><p class="profile-affiliation">${escapeHtml(profile.affiliation)}</p><p class="profile-email-label">${escapeHtml(profile.emailLabel || "Email")}</p><a class="profile-email" href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)} <span aria-hidden="true">↗</span></a></div>
      </section>
      <div class="profile-content section-shell">${profile.sections.map((section, index) => `
        <section class="profile-section profile-section--${escapeHtml(section.type)}" aria-labelledby="profile-section-${index + 1}"><div class="profile-section-heading"><span>${String(index + 1).padStart(2, "0")}</span><h2 id="profile-section-${index + 1}">${escapeHtml(section.heading)}</h2></div><div class="profile-section-body">${section.type === "list" ? `<ul>${section.entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>` : section.type === "ordered-list" ? `<ol>${section.entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ol>` : section.entries.map((entry) => `<p>${escapeHtml(entry)}</p>`).join("")}</div></section>`).join("")}</div>`);
  }
  const publications = [...siteContent.publications].sort(
  (first, second) => Number(second.year || 0) - Number(first.year || 0)
  );
  renderInto("[data-publications]", publications.map((publication, index) => {
  const detail = [
    publication.authors,
    publication.journal,
    publication.year,
    publication.doi ? `DOI: ${publication.doi}` : "",
  ].filter(Boolean).join(" · ");

  return `
    <article class="publication" data-year-item="publications" data-item-year="${escapeHtml(publication.year || "")}">
      <div class="publication-entry">
        <span class="publication-number">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <p class="publication-type">${escapeHtml(publication.type)}</p>
          <h3><a class="publication-title-link" href="${escapeHtml(publisherUrl(publication.url, publication.doi))}" target="_blank" rel="noopener noreferrer" aria-label="Open publication: ${escapeHtml(publication.title)}">${escapeHtml(publication.title)}</a></h3>
          <p>${escapeHtml(detail)}</p>
        </div>
      </div>
    </article>`;
}).join(""));
  const publishedNews = siteContent.news.filter((item) => item.published !== false);
  renderInto("[data-news]", publishedNews.length ? publishedNews.map((item) => `
    <article class="news-card" data-year-item="news" data-item-year="${escapeHtml(item.year || "")}"><p>${escapeHtml(item.date)}</p><span>${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3><a href="${escapeHtml(item.url || "news.html")}">Read update <span aria-hidden="true">→</span></a></article>`).join("")
    : `<p class="empty-state">No news updates have been published yet.</p>`);
}

function setUpMenu() {
  const button = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-nav]");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) { button.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
  });
  window.matchMedia("(min-width: 50rem)").addEventListener("change", (event) => {
    if (event.matches) { button.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
  });
}

function setUpLabMap() {
  const mapElement = document.querySelector("[data-lab-map]");
  const mapConfig = siteContent.contact.map;
  if (!mapElement || !mapConfig || !window.L) return;

  mapElement.innerHTML = "";
  const map = window.L.map(mapElement, { scrollWheelZoom: false }).setView(
    [mapConfig.latitude, mapConfig.longitude],
    mapConfig.zoom,
  );
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  window.L.marker([mapConfig.latitude, mapConfig.longitude])
    .addTo(map)
    .bindPopup(`<strong>${escapeHtml(mapConfig.label)}</strong><br>${escapeHtml(mapConfig.description)}`)
    .openPopup();
}

function addHomeNavigation() {
  const nav = document.querySelector("[data-nav]");
  if (!nav || nav.querySelector('a[href="index.html"]')) return;
  const home = document.createElement("a");
  home.href = "index.html";
  home.textContent = "Home";
  if (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html")) home.setAttribute("aria-current", "page");
  nav.prepend(home);
}

function setUpYearIndexes() {
  document.querySelectorAll("[data-year-index]").forEach((index) => {
    const collection = index.dataset.yearIndex;
    const label = index.dataset.yearLabel || "items";
    const items = [...document.querySelectorAll(`[data-year-item="${collection}"]`)];
    const status = document.querySelector(`[data-year-status="${collection}"]`);
    const years = [...new Set(items.map((item) => item.dataset.itemYear).filter(Boolean))]
      .sort((first, second) => Number(second) - Number(first));

    if (!years.length) {
      index.hidden = true;
      if (status) status.hidden = true;
      return;
    }

    index.innerHTML = ["all", ...years].map((year) => `
      <button type="button" aria-pressed="${year === "all"}" data-filter-year="${escapeHtml(year)}">${year === "all" ? "All" : escapeHtml(year)}</button>`).join("");
    const buttons = [...index.querySelectorAll("[data-filter-year]")];

    const applyFilter = (year) => {
      let visibleCount = 0;
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filterYear === year)));
      items.forEach((item) => {
        const visible = year === "all" || item.dataset.itemYear === year;
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (status) {
        status.hidden = year === "all" || visibleCount > 0;
        if (!status.hidden) status.textContent = `No verified ${label} have been added for ${year} yet.`;
      }
    };

    buttons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filterYear)));
    applyFilter(index.querySelector('[aria-pressed="true"]')?.dataset.filterYear || "all");
  });
}

renderContent();
addHomeNavigation();
setUpMenu();
setUpLabMap();
setUpYearIndexes();
