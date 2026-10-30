# Memory and Computing Group Website

Source repository for the public website of the Memory and Computing Group at Fudan University.

**Live site:** <https://memoryandcomputinggroup.github.io/>

## Technology

- Static HTML, CSS, and browser-native JavaScript
- No package installation or framework build is required
- Leaflet and OpenStreetMap tiles are loaded only on the Contact page to provide the interactive campus map
- GitHub Pages publishes the site from the `main` branch through the repository workflow

## Repository structure

```text
assets/
  images/
    home/        Home-page imagery
    research/    Research-page imagery and icon
    people/      People-page imagery, portraits, and icon
    publications/ Publications-page imagery and icon
    news/        News-page imagery and icon
    join/        Join-page imagery and icon
    contact/     Contact-page imagery and icon
    shared/      Logo and other images used across pages
  styles.css     Shared responsive styles
src/
  content.js     Central editable content: people, profiles, publications, news, contact
  app.js         Page rendering, navigation, filters, and map setup
*.html           Public pages and member-profile pages
build.ps1        Produces the deployable dist/ directory
```

## Update content

Edit `src/content.js` for routine content changes:

- `researchThemes` — the three research-area card titles, descriptions, images, and detail-page content (`url`, `intro`, `focus`)
- `leadershipGroups` — principal investigators and faculty
- `peopleGroups` — postdoctoral researchers, students, and alumni
- `profiles` — leader and student profile-page content
- `publications` — scholarly outputs; include an official DOI or publisher URL in `url` and an `area` number matching `researchThemes`
- `news` — dated news cards and their destination pages
- `joinCopy` and `jobOpenings` — Join Us introduction and opportunity cards
- `contact` — public contact details and the campus-map marker

Add approved images to the folder for their page under `assets/images/`. Put member portraits in `assets/images/people/` and images used across pages in `assets/images/shared/`. Update the image path in the relevant HTML page or `src/content.js` when adding or replacing a file. Use descriptive filenames and publish photographs only with permission.

Each publication’s `area` is `1`, `2`, or `3` and maps to the research themes in order: Emerging Memory and Integration, Hardware–Algorithm Co-Design for Neuromorphic Computing, and Neuromorphic Chips Based on Emerging Memory. The publications page renders the matching theme title as a colored label.

Each theme’s `url` points to its research-area page (`research-emerging-memory.html`, `research-hardware-algorithm-codesign.html`, or `research-neuromorphic-chips.html`). Those pages render the theme’s `intro` and `focus` items together with every publication whose `area` matches, so edit the theme entry rather than the page shell.

Each research card reserves a 16:10 visual area. A 1600×1000 image is a suitable replacement size; keep the placeholder until an approved image and descriptive alt text are available.

The three `news-*-update.html` files are draft templates. The build excludes them from the public site. To publish a news item, create an approved detail page with a distinct filename and add its dated record to `src/content.js` without `published: false`.

## Build and preview locally

From the repository root in PowerShell:

```powershell
.\build.ps1
python -m http.server 8080 --directory dist
```

Open <http://localhost:8080>. The Contact-page map requires an internet connection because its Leaflet library and OpenStreetMap tiles are delivered from public services.

## Publish changes

```powershell
git status
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

GitHub Actions builds and publishes `dist/` after a push to `main`. After deployment succeeds, review <https://memoryandcomputinggroup.github.io/> in a browser. Do not commit `dist/` unless the repository policy changes.

## Content and privacy checklist

Before publishing, confirm that names, biographies, affiliations, news, publication metadata, photographs, and contact details are approved for public release. Prefer official publisher pages and DOI links for publications. Keep credentials, tokens, private contact details, and unapproved images out of the repository.

## Map attribution

The Contact page uses [Leaflet](https://leafletjs.com/) with map tiles from [OpenStreetMap](https://www.openstreetmap.org/copyright). The marker identifies the Jiangwan Campus location; it is not represented as a room-level geolocation.
