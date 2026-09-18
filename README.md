# Dune Contract Tracker Project Plan

## Overview
This project is a lightweight browser-based mission tracker for Dune: Awakening-style contract/mission tracking. The app will pull mission definitions from the source at https://dune.gaming.tools/contracts, present them in a clean interface, let the user track completion progress by mission type, and allow them to save and reload their progress using a JSON file.

The app is presented as “Dune Awakening Contract Tracker” and is credited as “Created by: Oblivion on the Stoneheart server”.

The goal is to make it easy for players to track which missions they have completed without needing a backend or account system. The experience should feel fast, readable, and visually similar in tone to the calm, organized utility UI seen in the Spice Calculator mockup at https://meatylock.github.io/spice-calculator/src/index.html.

---

## Product Goals
- Display all available missions in a compact, readable tracker layout
- Support both a table-style view and a collapsible grouped view
- Group/filter missions by faction and mission type
- Allow a user to mark each mission as completed or incomplete
- Show a compact completion summary for each grouped section like N/N completed
- Save progress as a JSON file when the user clicks Save
- Reload the same JSON file on a later visit to restore progress
- Keep the app easy to run from a simple static front-end setup

---

## Core User Experience
### Main screen
- Top-level page title: “Dune Awakening Contract Tracker”
- Credit line: “Created by: Oblivion on the Stoneheart server”
- View toggle for switching between table mode and collapsible grouped mode
- Filter controls near the top for selecting a mission type or faction
- A list or grid of mission cards with status indicators
- Each card contains mission details such as:
  - name
  - faction
  - type
  - objective summary
  - rewards or notes if available
  - completion checkbox or toggle

### View mode toggle
The app should include a clear UI mode toggle, such as:
- Table view
- Collapsible grouped view

This gives users a choice between:
- a dense spreadsheet-style tracking table
- a more readable faction-based expansion list with grouped progress summaries

### Collapsible grouped view
In grouped mode, the page should render an expanding list organized by faction or group, such as:
- Atreides
- Harkonnen
- Fremen
- Imperial / other faction buckets

Each group header should show a summary like:
- Atreides: 5/12 complete
- Harkonnen: 2/7 complete

When collapsed, the section remains compact and readable. When expanded, it reveals the missions underneath.

### Hover details
In the collapsible view, hovering over a mission row or entry should show a tooltip or popover with:
- mission name
- mission type
- short objective description
- rewards or notes
- completion status

This should be lightweight and quick, without requiring the user to click into a separate page.

### Mission filtering
The user should be able to filter the list by one or more mission categories such as:
- combat
- exploration
- crafting
- gathering
- social / faction
- other dynamic mission categories from the source data
- faction buckets such as Atreides, Harkonnen, Fremen, etc.

Suggested interaction patterns:
- a dropdown for “All types”
- quick filter chips or buttons for each type
- faction filter chips or tabs
- optional “show only incomplete” toggle

### Completion tracking
Each mission card should allow the user to toggle completion state.

Example states:
- incomplete
- complete
- optional highlight for “tracked progress” if future expansions are added

The application should keep the data in a structured object such as:

```json
{
  "lastUpdated": "2026-09-18T00:00:00Z",
  "missions": [
    {
      "id": "mission-001",
      "name": "Example Mission",
      "type": "combat",
      "completed": true
    }
  ]
}
```

---

## Data Source Strategy
The app will use the public mission reference page at https://dune.gaming.tools/contracts as the source of truth for available mission names and categories.

### Data intake approach
Because this is a browser-only project, the most practical approach is:
1. Extract mission data from the source page manually or via scripting
2. Normalize it into a clean JSON structure
3. Store the final mission list in a local data file or a JS array
4. Merge the saved user progress data with the master mission list on load

### Recommended data shape
```js
[
  {
    id: "mission-001",
    name: "Mission Name",
    type: "combat",
    description: "Short objective text",
    rewards: ["Reward A", "Reward B"],
    completed: false
  }
]
```

This creates a clear distinction between:
- static mission catalog data
- user progress data

---

## Styling Direction
The visual design should echo the polished utility aesthetic from the Spice Calculator reference at https://meatylock.github.io/spice-calculator/src/index.html.

### Design goals
- muted, readable color palette
- strong hierarchy and spacing
- compact cards with soft borders and subtle shadows
- clean form controls and filters
- consistent status coloring for completed/incomplete missions
- crisp typography with high legibility

### Suggested palette
- background: warm off-white / sandstone / dark neutral base
- panel background: slightly contrasted cards
- accent: warm gold, amber, rust, or desert-inspired orange
- text: dark charcoal / warm gray
- success: muted green for completed state
- warning / inactive: gray or dusty tan

### Layout references
The page should feel like a dashboard utility rather than a game inventory screen:
- horizontal filter bar at the top
- scrollable mission grid below
- compact, card-based listing
- responsive layout for desktop and smaller screens

---

## Functional Requirements
### 1. Mission list rendering
- Load a static mission catalog from a JSON file or embedded array
- Render each mission card using its type and metadata
- Display completion state visually on each card
- Support both a table layout and grouped collapsible layout

### 2. View toggle behavior
- Add a toggle control that switches between table view and collapsible grouped view
- Table view should present missions in a straightforward column-based layout
- Collapsible view should group missions by faction or category with expand/collapse behavior
- Group headers should display a progress summary such as X/Y complete

### 3. Type and faction filtering
- Provide filter controls for mission type
- Provide filter controls for faction grouping when relevant
- Default state: “All”
- Update the rendered list when the user changes the filter
- Optionally allow multiple type filters in the future

### 4. Hover detail popover
- In grouped view, each mission should expose a hover tooltip or popover on mouseover
- The popover should show the mission detail summary without forcing navigation
- This should remain lightweight and not obscure the rest of the UI

### 5. Save progress
When the user clicks Save:
- gather current completion state for all missions
- serialize the data to JSON
- trigger a file download using the browser download mechanism

Example output filename:
- dune-contract-tracker-save.json

### 4. Reload progress
When the user revisits the app:
- provide a “Load JSON” or file input button
- read the selected saved JSON file
- merge the saved completion state back into the mission catalog
- restore the filtered view and completed states

### 5. Local persistence fallback
For convenience, the app may also store data in browser localStorage as a backup for repeated visits on the same device.

This gives the user:
- easy reload from a file for sharing or backup
- quick restore from local browser storage for convenience

---

## Suggested Project Structure
```text
DuneContractTracker/
  index.html
  styles.css
  app.js
  data/
    missions.json
  README.md
```

### File responsibilities
- index.html: page shell and UI structure
- styles.css: app styling modeled after the reference design
- app.js: mission rendering, filtering, save/load logic
- data/missions.json: master mission data

---

## Implementation Plan
### Phase 1: Foundation
- Create the static HTML layout
- Add a view toggle for table / collapsible grouped modes
- Add filter controls and mission container
- Set up the base styling and color system
- Confirm the page matches the utility/dashboard feel of the reference site

### Phase 2: Mission data integration
- Capture mission names, factions, and categories from the source page
- Normalize the dataset into a stable JSON structure
- Identify unique mission types and faction groupings
- Build a consistent ID scheme for each mission
- Include optional metadata fields such as description, rewards, and notes

### Phase 3: Tracking logic
- Add completion toggle UI
- Keep state in memory
- Render updated status visually after each toggle
- Support filtering by mission type and faction
- Compute completion summary values for each grouped section

### Phase 4: Collapsible grouped view
- Build a sectioned list grouped by faction or category
- Add expand/collapse behavior for each group
- Show compact summary badges like X/Y complete in the group header
- Ensure collapsed groups stay readable and visually efficient

### Phase 5: Hover detail interaction
- Add mouseover tooltip/popover behavior for each mission item in grouped mode
- Display mission metadata such as objective summary, rewards, and notes
- Ensure tooltips are styled to be subtle and readable without covering the interface excessively

### Phase 6: Save and reload workflow
- Add Save button that downloads a JSON file
- Add Load button that reads a JSON file from disk
- Merge saved state with the master mission list
- Validate the data structure before applying it

### Phase 7: UX refinement
- Improve spacing, card layout, and mobile responsiveness
- Add empty-state messaging when filters have no results
- Add a quick summary showing total completed vs total missions
- Optionally add ability to clear saved progress
- Fine-tune the grouped list animation and hover interactions

---

## Technical Approach Recommendation
The simplest and most reliable stack for this project is:
- HTML
- CSS
- vanilla JavaScript

This is ideal because:
- no build tooling is required
- users can open the page directly in a browser
- the app can save JSON files without a back-end service
- the project remains lightweight and easy to maintain

If needed later, the project could evolve to a Vite-based front-end, but the initial version should stay intentionally simple.

---

## Risks and Considerations
### Mission data quality
The official mission source may change formatting or include edge cases. The project should include a normalization step to clean and standardize the imported data before rendering it.

### Save compatibility
The JSON export must be structured consistently so the app can read it on the next visit without user confusion.

### Browser limitations
File input and JSON download are supported in modern browsers, but the UX should include clear feedback in case the user tries to load an invalid file.

---

## Success Criteria
The project is successful when:
- the user can browse a mission list taken from the source data
- the list can be filtered by mission type and faction
- the user can switch between table mode and collapsible grouped mode
- grouped sections display a compact completion summary like X/Y complete
- each mission can be marked complete or incomplete
- hovering over a mission in grouped view reveals mission details
- pressing Save creates a usable JSON file
- the user can load that JSON file later and restore their state
- the page has a polished, compact utility UI inspired by the Spice Calculator reference

---

## Next Steps
1. Inspect the mission source page and map out the exact fields available
2. Create the initial static HTML/CSS layout
3. Build the mission catalog data file
4. Add filtering and completion logic
5. Implement JSON save/load behavior
6. Review the UI against the reference design and refine styling

This plan gives a clear path from data extraction to a finished tracker that is easy to run, review, and reuse.
