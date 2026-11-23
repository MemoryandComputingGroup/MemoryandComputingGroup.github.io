#!/usr/bin/env python3
"""Add a bilingual profile to the Memory and Computing Group static site."""
import functools
import html
import http.server
import json
import re
import shutil
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
GROUPS = ["Postdoctoral Researchers", "Doctoral Students", "Graduate Students", "Alumni"]
MARKER = "// Automatically added profile card translations."


def js(value):
    return json.dumps(value, ensure_ascii=False)


def ask(label):
    while True:
        value = input(label + ": ").strip()
        if value:
            return value
        print("Please enter a value.")


def multiline(label):
    print(f"\n{label} (paste text, then enter a line containing only END)")
    while True:
        lines = []
        while True:
            line = input()
            if line.strip() == "END":
                break
            lines.append(line)
        result = "\n".join(lines).strip()
        if result:
            return result
        print("Please enter text, followed by END.")


def interests(label):
    return [re.sub(r"^\s*(?:[-*•]|\d+[.)、])\s*", "", line).strip()
            for line in multiline(label).splitlines() if line.strip()]


def insert_once(text, needle, replacement):
    if text.count(needle) != 1:
        raise ValueError(f"The site structure has changed; expected one occurrence of {needle!r}.")
    return text.replace(needle, replacement, 1)


def main():
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT
    content_path, i18n_path = root / "src/content.js", root / "src/i18n.js"
    template_path = root / "xianghui-li.html"
    if not all(p.is_file() for p in (content_path, i18n_path, template_path)):
        raise ValueError("Run this script from the website directory, or pass the website directory as an argument.")
    content = content_path.read_text(encoding="utf-8")
    i18n = i18n_path.read_text(encoding="utf-8")
    template = template_path.read_text(encoding="utf-8")

    name_zh = ask("Chinese name / 中文姓名")
    name_en = ask("English name")
    print("\nChoose People page group:")
    for index, group in enumerate(GROUPS, 1):
        print(f"  {index}. {group}")
    while True:
        choice = ask("Group number")
        if choice in ("1", "2", "3", "4"):
            group = GROUPS[int(choice) - 1]
            break
        print("Enter 1, 2, 3, or 4.")
    role_options = {
        "Postdoctoral Researchers": [("Postdoctoral researcher", "博士后研究人员")],
        "Doctoral Students": [("Doctoral student", "博士研究生")],
        "Graduate Students": [("Master's student", "硕士研究生"), ("Graduate student", "研究生")],
        "Alumni": [("Alumnus / alumna", "校友")],
    }
    options = role_options[group]
    print("\nChoose a role / 选择身份:")
    for index, (english, chinese) in enumerate(options, 1):
        print(f"  {index}. {english} / {chinese}")
    print(f"  {len(options) + 1}. Other / 其他（手动输入）")
    while True:
        role_choice = ask("Role number / 身份编号")
        if role_choice.isdigit() and 1 <= int(role_choice) <= len(options) + 1:
            selected = int(role_choice) - 1
            if selected < len(options):
                role_en, role_zh = options[selected]
            else:
                role_en = ask("Role in English")
                role_zh = ask("Role in Chinese / 中文身份")
            break
        print(f"Enter a number from 1 to {len(options) + 1}.")
    while True:
        photo = Path(ask("Photo path").strip('"\''))
        if photo.is_file() and photo.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            break
        print("Enter the path to an existing JPG, PNG, WebP, or GIF image.")
    email = ask("Email")
    bio_zh = multiline("Chinese introduction / 中文个人介绍")
    bio_en = multiline("English introduction")
    interests_zh = interests("Chinese research interests, one per line / 中文研究兴趣")
    interests_en = interests("English research interests, one per line")

    suggested = re.sub(r"[^a-z0-9]+", "-", name_en.lower()).strip("-")
    while True:
        slug = input(f"Page identifier [{suggested}]: ").strip().lower() or suggested
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            print("Use lowercase letters, numbers, and single hyphens.")
            continue
        key = "person_" + slug.replace("-", "_")
        page = root / (slug + ".html")
        image = root / "assets/images/people" / (slug + photo.suffix.lower())
        if page.exists() or image.exists() or re.search(r"\b" + re.escape(key) + r"\s*:", content):
            print("That identifier is already in use. Choose another.")
            continue
        break

    image_url = f"assets/images/people/{image.name}"
    page_url = page.name
    alt = "Portrait of " + name_en
    member = {"name": name_en, "role": role_en, "image": image_url, "alt": alt, "profile": page_url}
    profile = {"kind": "student", "name": name_en, "role": role_en,
               "affiliation": "Memory and Computing Group · Fudan University", "image": image_url,
               "alt": alt, "email": email,
               "sections": [{"heading": "Introduction", "type": "biography", "entries": [bio_en]},
                            {"heading": "Research interests", "type": "list", "entries": interests_en}]}
    localized = {"name": name_zh, "role": role_zh, "alt": name_zh + "肖像",
                 "sections": [{"entries": [bio_zh]}, {"entries": interests_zh}]}
    group_anchor = '{ title: ' + js(group) + ', members: ['
    content_new = insert_once(content, group_anchor, group_anchor + "\n      " + js(member) + ",")
    content_new = insert_once(content_new, '  profiles: {', '  profiles: {\n    ' + key + ': ' + js(profile) + ',')
    zh_start = i18n.find('const zhContent = {')
    if zh_start < 0:
        raise ValueError("Chinese content section not found.")
    before, after = i18n[:zh_start], i18n[zh_start:]
    after = insert_once(after, '  profiles: {', '  profiles: {\n    ' + key + ': ' + js(localized) + ',')
    i18n_new = before + after
    old_export = 'export const localizeContent = (content, language) => language === "zh-CN" ? localizeValue(content, zhContent) : content;'
    if MARKER not in i18n_new:
        translation_code = '''// Automatically added profile card translations.
const addedProfileCards = {};

'''
        i18n_new = insert_once(i18n_new, 'const localizeValue = (value, override) => {', translation_code + 'const localizeValue = (value, override) => {')
        new_export = '''export const localizeContent = (content, language) => {
  if (language !== "zh-CN") return content;
  const localized = localizeValue(content, zhContent);
  localized.peopleGroups.forEach((group) => group.members.forEach((member) => {
    const translation = addedProfileCards[member.profile];
    if (translation) Object.assign(member, translation);
  }));
  return localized;
};'''
        i18n_new = insert_once(i18n_new, old_export, new_export)
    i18n_new = insert_once(i18n_new, 'const addedProfileCards = {', 'const addedProfileCards = {\n  ' + js(page_url) + ': ' + js({"name": name_zh, "role": role_zh, "alt": name_zh + "肖像"}) + ',')

    title = html.escape(name_en, quote=True) + ' | Fudan Memory and Computing Group'
    page_text = template.replace('Xianghui Li | Fudan Memory and Computing Group', title)
    page_text = page_text.replace('Profile of doctoral student Xianghui Li', 'Profile of ' + html.escape(name_en, quote=True))
    page_text = page_text.replace('data-profile="xianghuiLi"', 'data-profile="' + key + '"')
    if page_text == template or 'data-profile="' + key + '"' not in page_text:
        raise ValueError("Profile page template has changed.")

    print(f"\nCreating {page_url} in {group}, with photo {image_url}.")
    if input("Write these files? [y/N]: ").strip().lower() != 'y':
        print("Cancelled.")
        return
    if content_path.read_text(encoding="utf-8") != content or i18n_path.read_text(encoding="utf-8") != i18n:
        raise ValueError("Site files changed while entering data. Please run again.")
    written = []
    try:
        with image.open("xb") as dest, photo.open("rb") as src:
            shutil.copyfileobj(src, dest)
        written.append(image)
        with page.open("x", encoding="utf-8", newline="") as dest:
            dest.write(page_text)
        written.append(page)
        content_path.write_text(content_new, encoding="utf-8", newline="")
        i18n_path.write_text(i18n_new, encoding="utf-8", newline="")
    except Exception:
        content_path.write_text(content, encoding="utf-8", newline="")
        i18n_path.write_text(i18n, encoding="utf-8", newline="")
        for item in written:
            item.unlink(missing_ok=True)
        raise
    print("Profile added. Review the profile and People page in English and Chinese.")
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/{page_url}"
        print("Preview:", url)
        webbrowser.open(url)
        input("Press Enter to stop the preview server: ")
        server.shutdown()


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, EOFError, KeyboardInterrupt) as error:
        print(f"\nStopped: {error}", file=sys.stderr)
        sys.exit(1)
