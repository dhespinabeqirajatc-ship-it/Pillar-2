# Pillar 2 Interactive Workiva-style Demo

A self-contained HTML/CSS/JavaScript prototype that simulates the Pillar 2 workflow discussed in the meeting and shown in the supplied Workiva screenshots.

## Demo flow

1. **Entity Administration** — review the legal-entity source-of-truth table and share the outgoing connection to WData.
2. **Transitional Safe Harbour** — move horizontally across a wide calculation sheet, review pass/fail tests, and share Safe Harbour outputs to WData.
3. **Jurisdictional Elections** — capture annual and five-year elections using dropdowns and share the results.
4. **Entity Pack** — unlocked for failed Safe Harbour entities; distinguish automated data from user additions/reductions and share entity outputs.
5. **Jurisdictional Pack** — aggregate entity-level results into jurisdiction-level GloBE income, covered taxes, ETR and top-up tax.
6. **GIR – Global** — combine entity- and jurisdiction-level information into a final GIR-ready dataset.

The demo includes a guided popup for every step, an instruction banner, simulated Incoming/Outgoing connection tabs, a **Share updates** action, a WData status panel, pass/fail branching, and horizontally scrollable Workiva-style spreadsheets.

## Files

- `index.html` — application markup
- `styles.css` — Workiva-inspired responsive styling
- `app.js` — local state, workflow logic and interactions

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/root`.
6. Save. GitHub Pages will provide the published URL.

## Important scope notes

- Dummy data only.
- No live Workiva, WData or customer systems are connected.
- No API keys or authentication are required.
- Tax calculations are simplified for demonstration purposes.
- GIR tagging / XML / XBRL generation and regulatory filing are not simulated.
- The visual design is a prototype inspired by the supplied screenshots and is not an official Workiva product.
