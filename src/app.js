import { siteContent } from "./content.js";

const setText = (selector, value) => document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));
const renderInto = (selector, markup) => {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = markup;
};

function renderContent() {
  setText("[data-site-name]", siteContent.siteName);
  setText("[data-hero-title]", siteContent.hero.title);
  setText("[data-hero-summary]", siteContent.hero.summary);
  setText("[data-home-statement]", siteContent.homeStatement);
  setText("[data-join-copy]", siteContent.joinCopy);
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
    <article class="theme-card"><span>${escapeHtml(theme.number)}</span><h3>${escapeHtml(theme.title)}</h3><p>${escapeHtml(theme.description)}</p></article>`).join(""));
  renderInto("[data-leadership]", siteContent.leaders.map((person) => `
    <article class="leader-card"><img src="${escapeHtml(person.image)}" alt="${escapeHtml(person.alt)}" width="640" height="960" /><div class="leader-card-copy"><p class="eyebrow">${escapeHtml(person.role)}</p><h3>${escapeHtml(person.name)}</h3><a class="text-link" href="${escapeHtml(person.profile)}">View profile <span aria-hidden="true">→</span></a></div></article>`).join(""));
  renderInto("[data-people-groups]", siteContent.peopleGroups.map((group) => `
    <section class="people-group" aria-labelledby="${escapeHtml(group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}"><div class="group-heading"><h2 id="${escapeHtml(group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">${escapeHtml(group.title)}</h2></div><div class="member-grid">${group.members.map((person) => `
      <article class="member-card">${person.placeholder ? `<div class="member-photo member-photo-placeholder" role="img" aria-label="Placeholder portrait"><span>Profile<br />forthcoming</span></div>` : `<img class="member-photo" src="${escapeHtml(person.image)}" alt="${escapeHtml(person.alt)}" width="640" height="800" />`}<h3>${escapeHtml(person.name)}</h3><p>${escapeHtml(person.role)}</p></article>`).join("")}</div></section>`).join(""));

  const profileKey = document.body.dataset.profile;
  const profile = profileKey ? siteContent.profiles[profileKey] : null;
  if (profile) {
    renderInto("[data-profile-content]", `<section class="profile-hero section-shell"><div class="profile-portrait"><img src="${escapeHtml(profile.image)}" alt="${escapeHtml(profile.alt)}" width="640" height="960" /></div><div><p class="eyebrow">${escapeHtml(profile.role)}</p><h1>${escapeHtml(profile.name)}</h1><p class="profile-affiliation">${escapeHtml(profile.affiliation)}</p><p class="profile-email"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></p></div></section><section class="profile-content section-shell">${profile.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.type === "list" ? `<ul>${section.entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>` : section.entries.map((entry) => `<p>${escapeHtml(entry)}</p>`).join("")}</section>`).join("")}</section>`);
  }
  renderInto("[data-publications]", siteContent.publications.map((publication, index) => `
    <article class="publication"><span>${String(index + 1).padStart(2, "0")}</span><div><p class="publication-type">${escapeHtml(publication.type)}</p><h3>${escapeHtml(publication.title)}</h3><p>${escapeHtml(publication.detail)}</p></div><span class="publication-arrow" aria-hidden="true">↗</span></article>`).join(""));
  renderInto("[data-news]", siteContent.news.map((item) => `
    <article class="news-card"><p>${escapeHtml(item.date)}</p><span>${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3><a href="contact.html">Read update <span aria-hidden="true">→</span></a></article>`).join(""));
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

renderContent();
addHomeNavigation();
setUpMenu();
