---
name: add-group-member
description: Add one or more people to the Memory and Computing Group website from a bilingual member information table or equivalent details. Use when asked to add people, student profiles, or new members to the QiLiuRRAMGroup.github.io People page using add_person.py.
---

# Add group members

Use the existing repository's `add_person.py` as the source of truth. Locate the project root from the current workspace; check `add_person.py`, `src/content.js`, `src/i18n.js` and `pages/people/xianghui-li.html` exist. Read the current script before running it: its prompts and behavior may have changed. Respect existing changes; do not overwrite, commit, push or publish unrelated work.

## Prepare each person

Interpret a pasted Markdown row as: Chinese name | portrait link or file | status | email | Chinese biography | English biography | bilingual research interests | optional additional information. Accept equivalent input with or without table headings. Decode Markdown links and `mailto:`; convert `<br>` to line breaks and split Chinese and English research interests, preserving separate topics. Ignore `None` as a missing optional value. Extract the English name from a clearly identified biography or explicit field; do not guess a name spelling, gender, degree, affiliation, dates, or research topic. Map 博士在读 to Doctoral Students / Doctoral student; map other roles only when clear. The script requires both languages for biographies and interests; ask only for information that cannot be reliably inferred or supplied. Preserve additional supplied facts where the site supports them; disclose any fields that the script cannot represent instead of silently discarding them.

Before writing, check existing names, email, profiles and slug in `src/content.js`, `src/i18n.js`, existing HTML files and portrait names. If a person already exists, report this and do not create a duplicate; ask whether to update if appropriate. Check for slug or image name collisions, including case variations and all supported image extensions; do not use a different slug to circumvent a duplicate person.

Obtain the portrait into a temporary local file. A web or Kingsoft link may require authorization or be unavailable; use an authorized available connector or download when possible. Verify actual image content and supported extension (JPG, JPEG, PNG, WebP, GIF), not just the HTTP status or filename; avoid treating a login page as an image. If unavailable, ask for the image or a working link. Do not expose access tokens or private URLs in output.

## Run and verify

For each complete, nonduplicate person, run `add_person.py` with the project root. The current prompt order is Chinese name, English name, group number (1 postdoc, 2 doctoral, 3 graduate, 4 alumni), role number, local image path, email, Chinese biography, English biography, Chinese interests, English interests, slug, write confirmation, then preview-server stop. Each multiline field ends with a line containing only `END`; give one interest per line. Choose the default role when it accurately matches the user; use the script's custom role option otherwise. Never pass `END` as a line of user content. Confirm the script's write prompt on the user's behalf when adding members is requested. Use UTF-8 for subprocess input and output. If automating, suppress browser opening without changing the original script, send the final newline to stop its preview server, check its exit status and output, and impose a timeout. Process members sequentially, verifying each before proceeding.

The script currently creates the portrait and HTML page and edits both JavaScript content files. It may reject changed site structures and assumes a student profile kind; if the requested person or role cannot be represented correctly, stop for that person and explain rather than forcing a misleading profile. Do not blindly retry after failure: inspect whether partial writes occurred and preserve pre-existing changes.

Review the diff and verify each new portrait, profile page, group placement, email, names and biographies, and Chinese and English interests and translations. Run relevant project checks that are available; where possible preview both People and profile pages in both languages. Report what was added and any verification limitations. Adding source files does not itself publish the site.
