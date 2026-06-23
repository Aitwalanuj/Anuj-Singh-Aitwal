# Anuj Odoo Consultant Frontend

This is the public website only. It is separated from the CMS so the public site stays fast and does not expose any admin code.

## Files

```text
index.html
assets/css/style.css
assets/js/app.js
data/content.json
_headers
.nojekyll
```

## Hosting

Upload this folder to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- S3/static hosting
- cPanel/static public_html

No Node server is required.

## How content updates work

The website reads content from:

```text
data/content.json
```

The separate GitHub CMS updates this JSON file in your GitHub repository. After the commit is made, your hosting service should redeploy or refresh the static file depending on your hosting setup.

## Contact form

Because this is a static frontend, it does not save leads to a backend by default.

Options:

1. Leave `contact.formEndpoint` blank in the CMS. The form will open the visitor's email app using your contact email.
2. Add a form endpoint from a service like Formspree, Web3Forms, Formspark, Netlify Forms, or your own API endpoint.

## Speed notes

- No external fonts.
- No frontend framework.
- No server calls except loading `data/content.json`.
- CSS/JS are local files.
- `_headers` includes cache settings for static hosting platforms that support Netlify-style headers.
