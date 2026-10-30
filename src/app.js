import { siteContent as englishContent } from "./content.js?v=20261030-publication-areas";
import { languageStorageKey, localizeContent, translate } from "./i18n.js?v=20261030-research-areas";

let currentLanguage = "en";
let siteContent = englishContent;
let labMapMarker;
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const originalTitle = document.title;

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
const publicationMarkup = (publication, index, { showArea = true } = {}) => {
  const detail = [
    publication.authors,
    publication.journal,
    publication.year,
    publication.doi ? `DOI: ${publication.doi}` : "",
  ].filter(Boolean).join(" · ");
  const areaTheme = siteContent.researchThemes[Number(publication.area) - 1];
  const areaLabel = areaTheme ? areaTheme.title : "";
  const areaMarkup = showArea && areaLabel
    ? areaTheme.url
      ? `<a class="publication-area" data-area="${escapeHtml(publication.area)}" href="${escapeHtml(areaTheme.url)}">${escapeHtml(areaLabel)}</a>`
      : `<span class="publication-area" data-area="${escapeHtml(publication.area)}">${escapeHtml(areaLabel)}</span>`
    : "";

  return `
    <article class="publication" data-year-item="publications" data-item-year="${escapeHtml(publication.year || "")}">
      <div class="publication-entry">
        <span class="publication-number">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <div class="publication-meta">
            <p class="publication-type">${escapeHtml(publication.type)}</p>
            ${areaMarkup}
          </div>
          <h3><a class="publication-title-link" href="${escapeHtml(publisherUrl(publication.url, publication.doi))}" target="_blank" rel="noopener noreferrer" aria-label="${currentLanguage === "zh-CN" ? "查看论文原文：" : "Open publication: "}${escapeHtml(publication.title)}">${escapeHtml(publication.title)}</a></h3>
          <p>${escapeHtml(detail)}</p>
        </div>
      </div>
    </article>`;
};

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
      <a class="opening-link" href="${escapeHtml(opening.url || "contact.html")}" aria-label="${opening.url ? (currentLanguage === "zh-CN" ? `查看${escapeHtml(opening.title)}招聘详情` : `View details for ${escapeHtml(opening.title)}`) : (currentLanguage === "zh-CN" ? `咨询${escapeHtml(opening.title)}申请事宜` : `Enquire about ${escapeHtml(opening.title)}`)}">${opening.url ? (currentLanguage === "zh-CN" ? "查看详情" : "View details") : "Enquire about this opportunity"} <span aria-hidden="true">↗</span></a>
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
    <a class="theme-card" href="${escapeHtml(theme.url)}">
      <div class="theme-card-media" aria-hidden="true"><img src="${escapeHtml(theme.image)}" alt="" loading="lazy" decoding="async" /><span class="theme-card-number">${escapeHtml(theme.number)}</span></div>
      <div class="theme-card-body"><h3>${escapeHtml(theme.title)}</h3><p>${escapeHtml(theme.description)}</p><span class="theme-card-link">Explore area <span aria-hidden="true">→</span></span></div>
    </a>`).join(""));
  renderInto("[data-leadership-groups]", siteContent.leadershipGroups.map((group, index) => {
    const groupId = `leadership-group-${index + 1}`;
    return `<section class="leadership-section" aria-labelledby="${escapeHtml(groupId)}"><div class="section-heading people-heading"><p class="eyebrow">Leadership</p><h2 id="${escapeHtml(groupId)}">${escapeHtml(group.title)}</h2></div><div class="leadership-grid">${group.members.map(leaderCardMarkup).join("")}</div></section>`;
  }).join(""));
  const peopleGroups = siteContent.peopleGroups
    .map((group) => ({ ...group, members: group.members.filter((person) => !person.placeholder) }))
    .filter((group) => group.members.length > 0);
  renderInto("[data-people-groups]", peopleGroups.map((group, index) => `
    <section class="people-group" aria-labelledby="people-group-${index + 1}"><div class="group-heading"><h2 id="people-group-${index + 1}">${escapeHtml(group.title)}</h2></div><div class="member-grid">${group.members.map((person) => `
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
  renderInto("[data-publications]", publications.map((publication, index) => publicationMarkup(publication, index)).join(""));
  const publishedNews = siteContent.news.filter((item) => item.published !== false);
  renderInto("[data-news]", publishedNews.length ? publishedNews.map((item) => `
    <article class="news-card" data-year-item="news" data-item-year="${escapeHtml(item.year || "")}">
      <div class="news-card-meta">
        <p class="news-card-date">${escapeHtml(item.date)}</p>
        <span class="news-card-category">${escapeHtml(item.category)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <a class="news-card-link" href="${escapeHtml(item.url || "news.html")}">Read update <span class="news-card-arrow" aria-hidden="true">→</span></a>
    </article>`).join("")
    : `<p class="empty-state">No news updates have been published yet.</p>`);
  renderResearchAreaPage();
}

function renderResearchAreaPage() {
  const areaNumber = Number(document.body.dataset.researchArea);
  if (!Number.isInteger(areaNumber) || areaNumber < 1) return;
  const container = document.querySelector("[data-research-area-content]");
  const theme = siteContent.researchThemes[areaNumber - 1];
  if (!container || !theme) return;

  const areaPublications = siteContent.publications
    .filter((publication) => Number(publication.area) === areaNumber)
    .sort((first, second) => Number(second.year || 0) - Number(first.year || 0));
  const otherThemes = siteContent.researchThemes
    .map((otherTheme, index) => ({ theme: otherTheme, number: index + 1 }))
    .filter((entry) => entry.number !== areaNumber);

  container.innerHTML = `
    <nav class="research-breadcrumb section-shell" aria-label="Breadcrumb">
      <a href="research.html">Research</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(theme.title)}</span>
    </nav>
    <section class="page-hero page-hero-with-media section-shell research-area-hero" aria-labelledby="research-area-title">
      <div>
        <p class="eyebrow">Research area <span class="research-area-number">${escapeHtml(theme.number)}</span></p>
        <h1 id="research-area-title">${escapeHtml(theme.title)}</h1>
        <p>${escapeHtml(theme.intro)}</p>
      </div>
      <div class="research-area-media">
        <img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.imageAlt || "")}" decoding="async" />
      </div>
    </section>
    <section class="section-shell area-focus" aria-labelledby="area-focus-title">
      <div class="section-heading"><p class="eyebrow">Focus</p><h2 id="area-focus-title">What we work on</h2></div>
      <div class="area-focus-grid">${(theme.focus || []).map((item, index) => `
        <article class="area-focus-card" data-area="${areaNumber}">
          <span class="area-focus-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>`).join("")}</div>
    </section>
    <section class="area-publications" aria-labelledby="area-publications-title">
      <div class="section-shell">
        <div class="section-heading split-heading"><div><p class="eyebrow">Selected outputs</p><h2 id="area-publications-title">Publications</h2></div><p>Peer-reviewed work from this research area.</p></div>
        ${areaPublications.length
          ? `<div class="publication-list">${areaPublications.map((publication, index) => publicationMarkup(publication, index, { showArea: false })).join("")}</div>`
          : `<p class="empty-state">No publications have been added for this area yet.</p>`}
        <p class="area-publications-all"><a class="text-link" href="publications.html">Browse all publications <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
    <section class="section-shell area-other" aria-labelledby="area-other-title">
      <div class="section-heading"><p class="eyebrow">Continue exploring</p><h2 id="area-other-title">Other research areas</h2></div>
      <div class="area-other-grid">${otherThemes.map(({ theme: otherTheme, number }) => `
        <a class="area-other-card" data-area="${number}" href="${escapeHtml(otherTheme.url)}">
          <span class="area-other-media" aria-hidden="true">
            <img src="${escapeHtml(otherTheme.image)}" alt="" loading="lazy" decoding="async" />
            <span class="area-other-number">${escapeHtml(otherTheme.number)}</span>
          </span>
          <span class="area-other-copy"><strong>${escapeHtml(otherTheme.title)}</strong><span class="area-other-description">${escapeHtml(otherTheme.description)}</span><span class="area-other-link">Explore area <span aria-hidden="true">→</span></span></span>
        </a>`).join("")}</div>
    </section>`;
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
  window.matchMedia("(min-width: 64rem)").addEventListener("change", (event) => {
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
  labMapMarker = window.L.marker([mapConfig.latitude, mapConfig.longitude]).addTo(map);
  updateLabMapPopup();
  labMapMarker.openPopup();
}

function updateLabMapPopup() {
  if (!labMapMarker) return;
  const { label, description } = siteContent.contact.map;
  labMapMarker.bindPopup(`<strong>${escapeHtml(label)}</strong><br>${escapeHtml(description)}`);
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
        if (!status.hidden) status.textContent = currentLanguage === "zh-CN"
          ? `${year} 年暂无已核实的${collection === "publications" ? "论文" : "新闻"}。`
          : `No verified ${label} have been added for ${year} yet.`;
      }
    };

    buttons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filterYear)));
    applyFilter(index.querySelector('[aria-pressed="true"]')?.dataset.filterYear || "all");
  });
}

function translateDocument(language) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest("script, style, [data-no-translate]")) continue;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const parts = source.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (parts) node.nodeValue = `${parts[1]}${translate(parts[2], language)}${parts[3]}`;
  }

  document.querySelectorAll("[aria-label], [alt], [title]").forEach((element) => {
    const originals = originalAttributes.get(element) || {};
    ["aria-label", "alt", "title"].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
      element.setAttribute(attribute, translate(originals[attribute], language));
    });
    originalAttributes.set(element, originals);
  });
  document.title = translate(originalTitle, language);
}

function updateLanguageControl() {
  const toggle = document.querySelector("[data-language-toggle]");
  if (!toggle) return;
  toggle.setAttribute("aria-label", currentLanguage === "zh-CN" ? "语言：简体中文" : "Language: English");
  toggle.querySelector("[data-language-code]").textContent = currentLanguage === "zh-CN" ? "中" : "EN";
  document.querySelector("[data-language-options]").setAttribute("aria-label", currentLanguage === "zh-CN" ? "选择语言" : "Choose language");
  document.querySelectorAll("[data-set-language]").forEach((option) => {
    option.setAttribute("aria-pressed", String(option.dataset.setLanguage === currentLanguage));
  });
}

function applyLanguage(language) {
  currentLanguage = language;
  siteContent = localizeContent(englishContent, language);
  document.documentElement.lang = language;
  renderContent();
  addHomeNavigation();
  setUpYearIndexes();
  translateDocument(language);
  updateLabMapPopup();
  updateLanguageControl();
}

function setUpLanguageControl() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const control = document.createElement("div");
  control.className = "language-switcher";
  control.dataset.noTranslate = "";
  control.innerHTML = `
    <button class="language-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="language-options" data-language-toggle>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
      <span data-language-code>EN</span>
    </button>
    <div class="language-options" id="language-options" role="group" hidden data-language-options>
      <button type="button" lang="en" data-set-language="en">English</button>
      <button type="button" lang="zh-CN" data-set-language="zh-CN">简体中文</button>
    </div>`;
  header.append(control);
  const toggle = control.querySelector("[data-language-toggle]");
  const options = control.querySelector("[data-language-options]");
  const close = () => { options.hidden = true; toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => {
    options.hidden = !options.hidden;
    toggle.setAttribute("aria-expanded", String(!options.hidden));
  });
  control.querySelectorAll("[data-set-language]").forEach((option) => option.addEventListener("click", () => {
    const language = option.dataset.setLanguage;
    try { localStorage.setItem(languageStorageKey, language); } catch { /* Preference remains active on this page. */ }
    applyLanguage(language);
    close();
    toggle.focus();
  }));
  document.addEventListener("click", (event) => { if (!control.contains(event.target)) close(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !options.hidden) { close(); toggle.focus(); }
  });
}

setUpLanguageControl();
let preferredLanguage = "en";
try { if (localStorage.getItem(languageStorageKey) === "zh-CN") preferredLanguage = "zh-CN"; } catch { /* Use English when storage is unavailable. */ }
applyLanguage(preferredLanguage);
setUpMenu();
setUpLabMap();
