"""Version local asset URLs in a copied site, without changing source files."""
from hashlib import sha256
from pathlib import Path
from urllib.parse import unquote
import re
import sys

root = Path(sys.argv[1]).resolve()
url_pattern = re.compile(r"(?<![\w/])(?P<path>(?:assets/|src/|images/|\./)[^\s\"\'()<>?#]+)(?:\?v=[A-Za-z0-9._-]+)?")
versions = {}
processing = set()


def version_file(file):
    if file in versions:
        return versions[file]
    if file in processing:
        raise ValueError(f"Circular asset dependency: {file}")
    processing.add(file)
    if file.suffix.lower() in {".js", ".css"}:
        text = file.read_text(encoding="utf-8")
        updated = version_urls(text, file)
        if updated != text:
            file.write_text(updated, encoding="utf-8", newline="")
    version = sha256(file.read_bytes()).hexdigest()[:16]
    processing.remove(file)
    versions[file] = version
    return version


def version_urls(text, source):
    def replace(match):
        url = match.group("path")
        decoded = unquote(url)
        if decoded.startswith(("assets/", "src/")):
            target = root / decoded
        else:
            target = source.parent / decoded
        target = target.resolve()
        if not target.is_relative_to(root) or not target.is_file():
            return match.group(0)
        return f"{url}?v={version_file(target)}"
    return url_pattern.sub(replace, text)

for page in root.glob("*.html"):
    content = page.read_text(encoding="utf-8")
    page.write_text(version_urls(content, page), encoding="utf-8", newline="")
print(f"Versioned {len(versions)} local assets across the built site.")
