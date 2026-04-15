# Booster Brand Guidelines Site

Static vanilla HTML/CSS/JS brand guidelines platform for the Booster Source identity direction.

## Structure

- `index.html` - The Brand / homepage
- `strategy.html` - strategic foundation, positioning, audience, and sustainability
- `voice.html` - verbal identity, language rules, and rewrites
- `visuals.html` - logo, colour, typography, packaging, photography, icon, advertising, and interface standards
- `gallery.html` - curated applications and artifact-needed list
- `css/styles.css` - shared Figma-derived visual system
- `js/components.js` - shared navigation, section progress, logo colour switcher, type testers, and reveal interactions

## Source Of Truth

The visual baseline follows the Figma Visuals page: large Montserrat hierarchy, Titillium Web uppercase labels, 30px rounded modules, lilac/grey surfaces, tight purple palette, blurred pill navigation, and dense modular guideline sections.

## Assets

The site uses the available local brand assets:

- `Brand Assets/Logos/SVG Versions/Main - Wordmark (primary Logo).svg`
- `Brand Assets/Logos/SVG Versions/Secondary - Main Icon (Secondary Logo).svg`
- `Brand Assets/Logos/SVG Versions/Secondary - Full Wordmark.svg`
- `Brand Assets/Image assets/Generated/booster_ui_app_1776116752479.png`
- `Brand Assets/Image assets/Generated/booster_cup_wrap_1776116781883.png`
- `Brand Assets/Image assets/Generated/booster_tote_mockup_1776116766320.png`

## Run Locally

Use a static server so the interactive logo colour switcher can fetch and recolour local SVG assets:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.
