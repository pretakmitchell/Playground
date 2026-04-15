#!/usr/bin/env python3
"""Legacy generator notice.

The Booster Brand Guidelines site is now maintained directly as static HTML,
CSS, and JavaScript. This old generator previously referenced obsolete asset
names and should not be used to rebuild the site.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parent


def main() -> None:
    pages = [
        "index.html",
        "strategy.html",
        "voice.html",
        "visuals.html",
        "gallery.html",
    ]
    existing = [page for page in pages if (ROOT / page).exists()]
    print("Booster Brand Guidelines static site is already generated.")
    print("Edit these files directly:")
    for page in existing:
        print(f"- {page}")


if __name__ == "__main__":
    main()
