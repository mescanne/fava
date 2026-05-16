# Fava Smart Import: Journal-Driven Review Strategy

## 1. Strategic Direction: The "Journal Triage" Feed (Approach A Modified)

The goal is to shift the Fava import UI from a one-by-one modal flow to a
high-throughput **vertical triage feed**. Based on feedback, instead of creating
a new customized "grid" or "condensed row", we will leverage Fava's existing
visual language by displaying the imported transactions exactly as they appear
in the **Journal View**.

This assumes a smart importer has already made highly accurate guesses. The user
can seamlessly scroll through the imported transactions with all their nested
postings visible (identical to how they look in the main ledger journal), and
seamlessly drill down to edit exceptions.

We will adopt an **opinionated but opt-in** approach. The feature will be
toggled via a new Fava option to ensure backward compatibility for users who
prefer the legacy modal.

## 2. Configuration & State Management

### The Fava Option

We will introduce a new string-based Fava option in
`src/fava/core/fava_options.py`.

- **Option Name:** `import_feed_review` (boolean).
- **Behavior:** When set to `true` (e.g.,
  `2016-01-01 custom "fava-option" "import_feed_review" "true"`), the frontend
  will route the user to the new Journal-style Triage Feed instead of opening
  the `Extract.svelte` modal.
- **Default:** `false` (Legacy modal behavior remains default).

### State Management

- The `entries` array fetched from `get_extract()` (which returns a JSON array
  of parsed Beancount `Entry` types) remains the primary state.
- We will maintain a `Set` of "ignored" (duplicate) indices, allowing users to
  toggle duplicates directly from the feed.
- We will maintain an "active editing" index for the transaction currently being
  fixed.

## 3. View Layer & UX Heuristics

### The Client-Side Journal View

Because Fava's primary Journal view is historically server-rendered HTML
(Jinja2) and the import extraction returns JSON objects to Svelte, we cannot
trivially pass the JSON to the existing `<ol class="journal">` HTML fragment
loader.

Instead, we will build a **Client-Side Journal Component** tailored for the
import flow:

1. **`ClientJournalRow.svelte`**: A Svelte component that mirrors the HTML/CSS
   structure of `src/fava/templates/_journal_table.html`.
   - It takes a single `Entry` object.
   - It renders the Date, Flag, Payee, Narration.
   - It renders the `<ul>` of nested postings (`account`, `number`, `currency`),
     giving the user full visibility into splits and counteraccounts without
     relying on messy heuristics.
1. **Visual Indicators**: Rows flagged as `duplicate` will be visually muted
   (e.g., opacity dropped, or a "Duplicate" badge applied).

### The Drill-Down (Expansion)

When a user clicks an "Edit" button on a `ClientJournalRow`:

- The journal row swaps in-place (or expands) into the existing `<Entry />`
  Svelte component.
- This grants full access to Fava's robust posting editor, tag management, and
  metadata.
- Upon hitting "Save/Close" on the edit, the component collapses back into the
  `ClientJournalRow`, rendering the updated JSON state.

## 4. API & Component Boundaries

### Python Backend (`src/fava/core/fava_options.py`)

- Add `import_feed_review: bool = False` to the `FavaOptions` dataclass.
- Expose it to the frontend via the existing options payload.

### Svelte Frontend (`frontend/src/`)

- **`stores/fava_options.ts`**: Export the new `import_feed_review` derived
  store.
- **`reports/import/Extract.svelte`**:
  - Refactor to conditionally render the legacy modal OR the new feed view based
    on the `$import_feed_review` option.
- **`reports/import/ExtractFeed.svelte` (New)**:
  - Renders an `<ol class="flex-table journal">` wrapper.
  - Iterates over the `entries` array, rendering `ExtractFeedRow.svelte`.
  - Includes a master "Save All Valid Imports" button at the top/bottom.
- **`reports/import/ExtractFeedRow.svelte` (New)**:
  - Takes an `Entry` object.
  - Manages its own `isEditing` state.
  - When `!isEditing`: Renders the transaction using the exact CSS classes of
    the main Fava journal (e.g.,
    `<li class="transaction">...<ul class="postings">...</ul></li>`). Includes
    action buttons: "Edit", "Ignore/Duplicate".
  - When `isEditing`: Renders the existing `<Entry />` form component.

## 5. Execution Intuition (For the Engineer)

1. **Backend First:** Add the option in Python. Ensure it flows through the
   `ledgerData` endpoint.
1. **Scaffold the UI:** Build `ExtractFeed.svelte`. Wire the conditional
   rendering so the legacy modal is bypassed when the option is enabled.
1. **Clone the Journal Styling:** Build `ExtractFeedRow.svelte`. Use
   `src/fava/templates/_journal_table.html` as your visual reference. You do not
   need to implement every single journal feature (like complex metadata linking
   or dynamic column sorting); focus solely on rendering the `Date`, `Payee`,
   `Narration`, and the `Postings` list using the existing `.journal` CSS
   classes.
1. **Wire the Drill-Down:** When a row is clicked (or an edit button is hit),
   toggle `isEditing` to mount `<Entry bind:entry={...} />`. The two-way binding
   will ensure the parent `entries` array is updated.
1. **Save Flow:** The master "Save All" button should filter out the
   ignored/duplicate entries and send the remaining clean array to
   `save_entries()`.
