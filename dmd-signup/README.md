# DMD Signup Holding Page

Static GitHub Pages-ready signup site generated from the Figma frame `250:3212`.

## Files

- `index.html` - the holding page and signup form.
- `styles.css` - self-hosted styling and responsive rules.
- `script.js` - validation and hidden-iframe form submission.
- `privacy.html` - starter privacy notice.
- `assets/` - Figma-exported imagery.
- `fonts/` - self-hosted IBM Plex Sans weights.

The folder is intentionally lightweight: no build step, no package manager, no analytics, no cookies, and no exposed API keys.

## Brevo Setup

GitHub Pages cannot safely call the Brevo API directly because API keys would be public. Use a Brevo hosted subscription form instead:

1. Create a free Brevo account and contact list.
2. Create a subscription form for that list.
3. Enable double opt-in for the safest consent record.
4. Add fields for `EMAIL` and `FIRSTNAME`.
5. Copy the generated form `action` URL from Brevo's HTML embed.
6. Replace `https://YOUR-BREVO-FORM-ACTION-URL` in `index.html` with that URL.
7. Update `privacy.html` with your business contact email and mailing address.

Keep the visible DMD form. Do not paste Brevo's full embed markup over the page unless you want to replace the Figma styling.

## Compliance Notes

This is implementation support, not legal advice. The page includes:

- Explicit, unchecked marketing consent.
- Clear purpose language for launch updates.
- A privacy notice link beside the consent field.
- No tracking scripts or third-party runtime font calls.
- A hidden honeypot field to reduce bot submissions without fingerprinting users.

Before sending campaigns, make sure your email footer includes a valid physical mailing address and an unsubscribe link.
