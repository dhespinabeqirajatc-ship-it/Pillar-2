# Pillar 2 Interactive Demo

A self-contained Workiva-style Pillar 2 workflow demo built with HTML, CSS and vanilla JavaScript. It uses dummy data only and is designed for GitHub Pages.

## Workflow

1. Entity Administration — edit entity data (changes are treated as automatically saved), then use the **Outgoing → Share updates** icon to push the data to WData.
2. Transitional Safe Harbour — review the pre-populated PASS/FAIL logic. Netherlands fails. Germany’s De Minimis Test is FAILED because profit before tax exceeds the de minimis threshold; Germany still passes the Safe Harbour through the Simplified ETR Test.
3. Jurisdictional Elections — interact with annual/five-year election dropdowns and share the selections to WData.
4. Entity Pack — available only for the failed Netherlands path. Step 4 now shows the supplied **GloBE Income or Loss** reference sheet so the flow from elections into the Entity Pack is visually clear.
5. Jurisdictional Pack — automatically aggregates the two Entity Packs into Netherlands-level GloBE Income, Covered Taxes, ETR and Top-up Tax.
6. GIR / Final Output — combines the prior data into a GIR-style summary and lets the user preview a tabular extract and download CSV or Excel output.

A persistent sidebar shows workflow progress, WData state and the current data-flow position. The page also displays an explicit notice that the experience is a flow illustration rather than an identical reproduction of Workiva content/UX, and includes the Advance Tax Compliance logo.

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
- Entity rows, election dropdowns and final dataset export remain interactive. Step 4 uses the supplied GloBE Income or Loss reference image as a read-only visual walkthrough.

## PowerPoint / presentation mode

The same GitHub Pages site now supports a compact presentation layout without changing the normal webpage.

- Normal demo: `https://YOUR-USERNAME.github.io/YOUR-REPO/`
- PowerPoint-friendly demo: `https://YOUR-USERNAME.github.io/YOUR-REPO/?mode=presentation`

Presentation mode uses the same interactive workflow and data, but reduces navigation, spreadsheet rows, typography, spacing, and connection panels so the interface fits more comfortably inside a 16:9 PowerPoint web frame. The standard URL is unchanged.

## Presentation mode update

`?mode=presentation` now auto-fits the entire demo to the **actual embedded browser viewport** rather than assuming a normal 16:9 browser window. This is especially useful in PowerPoint Web Viewer, which adds its own URL bar/footer and therefore provides a much shallower content area. The normal GitHub Pages URL is unchanged.


## Client-requested UX revisions

- Added a prominent demo disclaimer clarifying that the interface illustrates data flow and is not an identical Workiva reproduction.
- Removed the manual spreadsheet save action; entity edits are auto-saved in demo state.
- Corrected Germany - CE so the **De Minimis Test** displays **FAILED** while the Simplified ETR Test supports the overall Safe Harbour pass.
- Removed the simulated Entity Pack switch control and display both failed-jurisdiction entity records in one view.
- Reworked the Jurisdictional Pack General Information sheet into a cleaner sectioned layout based on the supplied reference image.
- Removed JSON export; final output is CSV or Excel-compatible `.xls`.
- Added the supplied Advance Tax Compliance logo under `assets/`.

- Updated Step 4 to display the supplied GloBE Income or Loss sheet and select that sheet in the Entity Pack navigation tree.
