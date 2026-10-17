# Research Group Website

This lightweight, dependency-free website starter is located at `D:\Group_Web`.

## Edit content

All editable group-specific content is centralised in `src/content.js`. Each entry is intentionally a placeholder until verified information is supplied. The site uses separate static pages for Home, Research, People, Publications, News, Join us, and Contact.

After edits, run `./build.ps1` from PowerShell to refresh the deployable `dist` directory.

## Preview locally

From `D:\Group_Web`, run:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`. No build step or dependency installation is required.

## Content still required

- Official group name, institution, and research summary
- Team biographies and photographs with permission to use them
- Publication records and persistent links
- Dated news items and approved recruitment information
- Contact details and address
