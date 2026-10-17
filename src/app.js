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
  setText("[data-statement]", siteContent.statement);
  setText("[data-join-copy]", siteContent.joinCopy);
  setText("[data-institution]", siteContent.contact.institution);
  setText("[data-address]", siteContent.contact.address);
  setText("[data-year]", new Date().getFullYear());

  const email = document.querySelector("[data-email]");
  if (email) {
    email.href = `mailto:${siteContent.contact.email}`;
    email.textContent = `[${siteContent.contact.email} — placeholder]`;
  }

  renderInto("[data-research-themes]", siteContent.researchThemes.map((theme) => `
    <article class="theme-card"><span>${escapeHtml(theme.number)}</span><h3>${escapeHtml(theme.title)}</h3><p>${escapeHtml(theme.description)}</p></article>`).join(""));
  renderInto("[data-people]", siteContent.people.map((person) => `
    <article class="person-card"><div class="avatar avatar-${escapeHtml(person.tone)}" aria-hidden="true">${escapeHtml(person.initials)}</div><h3>${escapeHtml(person.name)}</h3><p>${escapeHtml(person.role)}</p></article>`).join(""));
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

renderContent();
setUpMenu();
