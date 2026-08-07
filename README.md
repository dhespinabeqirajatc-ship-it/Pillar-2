# Pillar 2 Interactive Demo

A self-contained Workiva-style Pillar 2 workflow demo built with HTML, CSS and vanilla JavaScript. It uses dummy data only and is designed for GitHub Pages.

## Workflow

1. Entity Administration — edit entity data, save spreadsheet changes, then use the **Outgoing → Share updates** icon to push the data to WData.
2. Transitional Safe Harbour — select a jurisdiction, change financial values, and see PASS/FAIL recalculate. Germany passes; Netherlands fails in the default story.
3. Jurisdictional Elections — interact with annual/five-year election dropdowns and share the selections to WData.
4. Entity Pack — available only for the failed Netherlands path. Switch between Alpha BV and Delta BV, enter additions/reductions, and see calculated totals.
5. Jurisdictional Pack — automatically aggregates the two Entity Packs into Netherlands-level GloBE Income, Covered Taxes, ETR and Top-up Tax.
6. GIR / Final Output — combines the prior data into a GIR-style summary and lets the user preview/download dummy JSON or CSV output.

A persistent sidebar shows workflow progress, WData state and the current data-flow position.

## Important interaction

The outgoing connection card intentionally mirrors the supplied Workiva screenshots: the **small upward Share updates icon in the top-right of the connection card** is the action that writes the latest spreadsheet values to WData. Clicking it shows a bottom-right “Refreshing Connection” progress notification before the step is marked shared.

## Files

- `index.html` — application structure
- `styles.css` — Workiva-style interface and responsive styling
- `app.js` — demo state, spreadsheet interactions, branch logic and exports

## Run locally

Open `index.html` directly, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the main branch and `/root`, then save.

## Scope

This is a simulated demonstration, not a production Pillar 2 engine or official Workiva product. It does not implement full OECD logic, real WData APIs, client data, XML/XBRL tagging or regulatory submission.

## Latest revisions

- Removed the simulated/dummy-data eyebrow banner from the page header.
- Removed the standalone WData status card from the sidebar.
- Removed the bottom workflow text label between Previous and Next.
- Updated typography to Arial/Helvetica and tightened the palette to Workiva-style navy, blue, light-blue, green and spreadsheet neutrals.
- Replaced the large outgoing Share updates button with the small connection-card share icon used in the supplied Workiva screenshots.
- Added pulsing blue guidance highlights to indicate the next element the user should click.
- Safe Harbour now ships with the demo scenario already populated: Netherlands fails and Germany passes. Users do not need to enter values to trigger the failed branch.
- Entity rows, election dropdowns, Entity Pack adjustments and final dataset export remain interactive.

## PowerPoint / presentation mode

The same GitHub Pages site now supports a compact presentation layout without changing the normal webpage.

- Normal demo: `https://YOUR-USERNAME.github.io/YOUR-REPO/`
- PowerPoint-friendly demo: `https://YOUR-USERNAME.github.io/YOUR-REPO/?mode=presentation`

Presentation mode uses the same interactive workflow and data, but reduces navigation, spreadsheet rows, typography, spacing, and connection panels so the interface fits more comfortably inside a 16:9 PowerPoint web frame. The standard URL is unchanged.
