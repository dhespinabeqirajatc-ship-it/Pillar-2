# Pillar 2 Interactive Demo

A self-contained Workiva-style Pillar 2 workflow demo built with HTML, CSS and vanilla JavaScript. It uses dummy data only and is designed for GitHub Pages.

## Workflow

1. Entity Administration — edit the entity code or other editable entity data directly in the spreadsheet, then use **Outgoing → Share updates** to push the data to WData. No separate save step is required.
2. Transitional Safe Harbour — select a jurisdiction, change financial values, and see PASS/FAIL recalculate. Germany and Netherlands both fail in the updated default story.
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

## Presentation mode update

`?mode=presentation` now auto-fits the entire demo to the **actual embedded browser viewport** rather than assuming a normal 16:9 browser window. This is especially useful in PowerPoint Web Viewer, which adds its own URL bar/footer and therefore provides a much shallower content area. The normal GitHub Pages URL is unchanged.

## ATC-style showcase skin

The normal GitHub Pages view now places the existing Pillar 2 Workiva simulation inside a centered browser-style frame inspired by the supplied ATC TRS clickable-demo references. It adds a white public-demo header, orange accent branding, a compact demo metadata/footer row and orange walkthrough callouts while preserving the underlying Workiva-style spreadsheet workflow and interactions. `?mode=presentation` continues to hide the public showcase chrome and renders only the compact interactive demo.

## Latest showcase refinements

- Removed the decorative orange floating marker and the duplicate title below the demo frame.
- Increased breathing room around the simulated Workiva interface and reduced internal density so the public demo does not feel zoomed in.
- Added visible sample instructions to the Entity Pack, including example “Don’t fill in this row” guidance.
- Compressed mostly-empty Entity Pack ID/check columns while preserving wider Description and Instructions columns.


## Latest requested changes

- Step 1 now uses the same direct hand-off as Step 3: after editing an entity value, the demo immediately opens Outgoing and highlights the Share updates icon.
- Step 4 now uses the earlier GloBE Income or Loss Entity Pack recreation, including rows 1–23 and the dedicated horizontal drag bar.


## Previous-demo sheet alignment

- Step 4 uses the prior GloBE Income or Loss Entity Pack sheet and is compacted only within that step so rows 1–23 fit more comfortably in the demo frame.
- Step 5 restores the prior Jurisdictional Pack general-information / Pillar II Tax Calculation Summary layout.
- Step 6 restores the prior GIR sheet layout.
- The final export interaction follows the prior demo's tabular preview with CSV and Excel download actions.

## Latest requested refinements

- Step 4 Entity Pack removes spreadsheet columns B and F from the recreated GloBE Income or Loss view.
- Step 4 column H is populated with red “Don't fill in this row” instruction cells on the applicable data rows.
- Step 5 Jurisdictional Pack uses a compact cell/font treatment so rows through 24 fit in the demo viewport more comfortably.


## Latest Step 4 / Step 5 fit refinements

- Step 4 removes the unused B, F, Q and R spreadsheet columns.
- Step 4 now fits its visible columns inside the demo frame without the horizontal-scroll hint or secondary drag bar.
- Step 5 uses tighter row heights with a slightly larger font, keeping the rows through 24 visible without horizontal scrolling.
