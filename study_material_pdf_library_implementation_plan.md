# Study Material PDF Library --- Complete Implementation Plan

**Project type:** Existing React + Tailwind CSS + Supabase application\
**Goal:** Turn the current website into a polished, secure, responsive
educational PDF library without unnecessarily rebuilding the project.\
**Working rule:** Begin with read-only inspection. Do not modify
Supabase projects, database objects, storage files, policies, or
existing application behavior until the correct project and current
state have been identified and reported.

------------------------------------------------------------------------

## 1. Outcomes and acceptance criteria

The finished application should:

-   Look and behave like a credible academic document platform, not a
    generic AI landing page.
-   Show real PDF first-page previews or generated thumbnails derived
    from the actual PDFs.
-   Let public visitors discover and read published materials.
-   Provide secure, authenticated admin workflows for uploading,
    editing, replacing, publishing/unpublishing, categorizing, and
    deleting materials.
-   Use Supabase Auth, Postgres, Storage, and Row Level Security (RLS)
    for real operations---no mock data or decorative controls.
-   Preserve existing records, files, routes, working integrations, and
    useful components.
-   Work at mobile, tablet, laptop, and desktop widths.
-   Have clear loading, empty, success, and failure states, with useful
    diagnostics.
-   Be tested in the actual running application and in the target
    browser before release.

### Definition of done

A task is complete only when the relevant behavior has been implemented,
tested against the real configured environment, and documented. A button
that only looks functional does not count. Any test that cannot be run
because credentials, permissions, project access, or deployment
configuration are missing must be marked **blocked/not verified**, not
reported as passed.

------------------------------------------------------------------------

## 2. Phase 0 --- Read-only discovery and project identification

**No changes are allowed during this phase.**

### 2.1 Inspect the local project

Inspect and record:

-   Repository root, package manager, lockfile, `package.json`, scripts,
    and installed dependencies.
-   React entry point, routing approach, page layouts, reusable
    components, hooks, context/state management, and error boundaries.
-   Tailwind configuration, global CSS, fonts, icon library, assets, and
    responsive breakpoints.
-   Existing public pages, PDF reader, admin routes, forms, tables, and
    navigation.
-   Supabase client initialization, environment variable names, queries,
    mutations, upload/download flows, and auth/session handling.
-   Existing tests, linting, type checking, build configuration, and
    deployment files.
-   Existing `.env` files only for **variable names and presence**.
    Never print or copy secret values into reports, screenshots,
    commits, or frontend code.

Commands to choose from after confirming the project directory and
package manager:

``` bash
pwd
git status --short
git branch --show-current
find . -maxdepth 2 -type f
cat package.json
```

Use platform-appropriate alternatives on Windows. Do not dump `.env`,
service-role keys, access tokens, or private credentials. Review
`git status` before editing so pre-existing user changes remain
untouched.

### 2.2 Identify the correct Supabase project

Use only an authorized, read-only connection or dashboard inspection.
Compare the existing application's configured Supabase URL/project
reference with the available Supabase projects. Do not assume the first
project is the correct one.

Record:

-   Project display name and project reference/ID (safe identifier
    only).
-   Whether the application URL matches that project.
-   Current schema and table names.
-   Table columns, types, defaults, indexes, foreign keys, and
    constraints.
-   RLS enabled/disabled status and existing policies.
-   Storage buckets, public/private status, bucket limits, MIME
    restrictions, and storage policies.
-   Auth providers and relevant redirect/site URL configuration.
-   Existing SQL migrations, functions, triggers, and relevant database
    grants.
-   Current material counts and storage object counts where safely
    available.

Do not expose passwords, JWTs, anon keys in public reports, service-role
keys, signed URLs, user email lists, or other sensitive records. The
public anon/publishable key is not a substitute for RLS and must never
be treated as authorization by itself.

### 2.3 Report before making changes

Deliver a short discovery report containing:

1.  Identified repository and framework.
2.  Correct Supabase project and evidence that it matches the app
    configuration.
3.  Existing routes/components and their responsibilities.
4.  Database, storage, authentication, and RLS inventory.
5.  Working features, broken features, and risks.
6.  Existing user changes or uncommitted work that must be preserved.
7.  Proposed implementation plan, migrations/policies that may be
    needed, and a list of actions requiring approval.

**Gate 0:** Stop and request clarification if the project identity is
ambiguous, access is insufficient, or an operation might affect the
wrong project. Do not alter anything until the discovery report is
accepted.

------------------------------------------------------------------------

## 3. Phase 1 --- Audit and implementation design

### 3.1 Functional audit

Trace each user journey end-to-end:

-   Visitor opens home page → published materials load from Supabase.
-   Visitor searches → results update and empty/error states are
    understandable.
-   Visitor applies category/subject/exam/tag filters → results reflect
    all selected criteria.
-   Visitor opens a book → correct PDF opens at the expected page.
-   Visitor uses reader navigation, zoom, search, and fullscreen.
-   Admin signs in → session is validated and protected routes are
    enforced.
-   Admin uploads a PDF → file validation, upload progress, metadata
    persistence, and preview generation are handled.
-   Admin edits metadata → changes persist and are reflected in the
    public library.
-   Admin replaces a PDF → replacement is safe and does not accidentally
    orphan or delete the prior file.
-   Admin publishes/unpublishes → public visibility follows the policy.
-   Admin deletes a material → explicit confirmation, safe file/record
    handling, and recoverable failure behavior.
-   Admin manages categories and tags → references remain valid.
-   User refreshes a deep link → route still works.
-   Session expires or network fails → the UI handles the failure
    safely.

### 3.2 Design audit

Look for:

-   Oversized hero areas, unnecessary gradients/glows, glass effects,
    floating blobs, excessive rounded cards, repeated card layouts,
    excessive whitespace, and arbitrary animation.
-   Generic illustrations or emoji standing in for actual document
    previews.
-   Inconsistent spacing, typography, border radius, icon style, button
    height, focus states, and page width.
-   Low contrast, small tap targets, missing labels, keyboard traps, or
    weak focus indicators.
-   Misleading buttons, static controls, placeholder content, and hidden
    loading/error states.
-   Mobile overflow, narrow tables, clipped dialogs, and unusable reader
    controls.

### 3.3 Deliver before implementation

Prepare a compact change proposal with:

-   Existing files to reuse.
-   Files to change and why.
-   Any new components or dependencies and the reason for each.
-   Database/storage changes proposed (if any), with impact and rollback
    notes.
-   Test plan and known limitations.
-   Explicit confirmation that existing data will be preserved.

**Gate 1:** Review the proposed plan before applying changes to the
project or Supabase.

------------------------------------------------------------------------

## 4. Design system and user experience

### 4.1 Visual direction

Use a restrained academic/document-management visual system:

-   **Canvas:** white or very light neutral background.
-   **Text:** dark charcoal with secondary gray for metadata.
-   **Primary color:** one restrained, accessible academic blue or teal,
    selected to fit the existing brand.
-   **Typography:** one highly legible sans-serif family; use a clear
    scale for page titles, section headings, body text, labels, and
    metadata.
-   **Borders:** subtle neutral borders and small, consistent radii.
-   **Shadows:** rare and subtle, only when needed to communicate
    elevation.
-   **Icons:** use the project's existing icon library where suitable;
    otherwise choose one consistent library rather than emojis or mixed
    icon styles.
-   **Motion:** short, purposeful transitions; respect
    `prefers-reduced-motion`.
-   **Layout:** predictable content widths, aligned baselines,
    consistent spacing tokens, and intentional responsive behavior.

Avoid decoration that does not improve navigation, reading, or
comprehension. Do not change the whole brand arbitrarily if an existing
visual identity is already in use.

### 4.2 Responsive layout

-   **Mobile:** compact header, search accessible near the top, filter
    drawer or collapsible filters, one/two-column document layout
    depending on available width, touch-friendly reader controls, and
    admin table alternatives.
-   **Tablet:** balanced two/three-column document grid, usable filter
    panel, adaptive dashboard sidebar.
-   **Desktop:** compact navbar, optional left filter rail, multi-column
    grid, persistent admin sidebar, and comfortable reader width.
-   Use semantic landmarks, logical heading order, visible keyboard
    focus, accessible names, form labels, and sufficient color contrast.

### 4.3 Homepage structure

1.  Compact navbar with library identity, navigation, and admin sign-in
    entry.
2.  Search area focused on finding materials---not a huge marketing
    hero.
3.  Category/subject/exam filter controls.
4.  Recently added materials, based on real upload/publication
    timestamps.
5.  Main document grid with sorting and result count.
6.  Pagination or "load more" behavior appropriate to collection size.
7.  Helpful empty state with a clear way to clear filters.
8.  Simple footer with only useful links and ownership information.

### 4.4 Document card

Each card should show:

-   Actual first-page preview or a generated cover based on the PDF.
-   Title, subject, category/exam, short description, and
    upload/published date.
-   Optional tags and page count if available.
-   Clear "Open document" behavior and a visible hover/focus state.
-   A stable aspect ratio for previews and a fallback that identifies a
    missing preview without using a random illustration.

Do not render every PDF at full resolution in the initial page load. Use
thumbnail generation, lazy loading, caching, and appropriate image
sizes.

### 4.5 Admin dashboard

-   Sidebar navigation: Overview, Materials, Upload, Categories/Tags,
    and Settings only where needed.
-   Compact summary metrics derived from actual database queries.
-   Searchable/filterable materials table with title, category, status,
    updated date, and row actions.
-   Upload/edit form with clear validation and progress.
-   Accessible confirmation dialog for deletion and destructive
    replacement steps.
-   Toast/status feedback plus inline errors; never silently swallow
    failures.
-   Empty, loading, and retry states on every data-driven section.

### 4.6 PDF reading experience

-   Distraction-free reader page with document title and back-to-library
    navigation.
-   Previous/next page, current page, total pages, zoom in/out,
    fit-width or fit-page when supported, and fullscreen.
-   Text search within the PDF with next/previous match behavior if
    supported by the chosen PDF library.
-   Loading, password-protected/unsupported document, and corrupted-file
    error states.
-   Responsive page rendering, keyboard navigation where feasible, and
    touch-friendly controls.
-   Do not download an entire file repeatedly for each page. Use the PDF
    library's supported range loading/caching behavior where feasible.

------------------------------------------------------------------------

## 5. Suggested application architecture

**Do not impose this structure blindly.** Adapt names and boundaries to
the repository after inspection.

``` text
src/
  app/                 # router, providers, application shell
  components/
    layout/             # navbar, footer, page container
    library/            # document card, grid, filters, search
    reader/             # toolbar, page canvas, page navigation
    admin/              # sidebar, table, forms, confirmation dialog
    ui/                 # shared buttons, inputs, dialogs, alerts
  pages/
    LibraryPage
    ReaderPage
    AdminLoginPage
    AdminDashboardPage
    AdminMaterialsPage
    AdminUploadPage
    AdminCategoriesPage
  hooks/                # reusable data/auth hooks
  lib/
    supabaseClient      # browser-safe client only
    validation          # input/file validation
    pdf                 # preview and reader helpers
  services/
    materials           # database queries and mutations
    categories
    storage
    auth
  types/                # database and application types
  styles/               # only if not already managed by Tailwind
supabase/
  migrations/           # reviewed, versioned SQL changes
  seed.sql              # optional local-only development data
```

Prefer existing folders, routes, naming conventions, and services if
they already serve these responsibilities. Keep database calls out of
presentational components where possible. Use typed records and shared
validation rather than duplicated ad hoc logic.

### Dependencies

First audit existing dependencies. Add only what is missing and
justified:

-   Supabase JavaScript client.
-   A maintained React PDF rendering library such as `react-pdf`/PDF.js,
    after checking framework compatibility and worker configuration.
-   Existing icon library, or one consistent icon package if none
    exists.
-   Existing test runner; otherwise propose a small, maintainable test
    setup.
-   A schema validation library only if existing validation patterns are
    insufficient.

Avoid installing multiple libraries that solve the same problem.

------------------------------------------------------------------------

## 6. Data model proposal

**This is a proposal, not an instruction to create tables immediately.**
Compare it with the actual schema first and map to existing tables when
possible. Use additive, reviewed migrations rather than destructive
replacement.

### 6.1 `materials`

Possible fields:

-   `id`: UUID primary key.
-   `title`: required text.
-   `description`: text, nullable if desired.
-   `subject`: text or foreign key depending on the current schema.
-   `category_id`: nullable foreign key to categories.
-   `exam`: optional text or normalized relation.
-   `tags`: normalized relation preferred for a growing system; array
    only if simplicity is appropriate.
-   `storage_bucket`: bucket name.
-   `storage_path`: unique object path, not a public URL.
-   `preview_path`: storage path for generated thumbnail, if stored
    separately.
-   `page_count`: optional integer.
-   `status`: constrained values such as `draft`, `published`,
    `archived`.
-   `created_by`, `updated_by`: user IDs when supported by current auth
    model.
-   `created_at`, `updated_at`, `published_at`: timestamps.

### 6.2 `categories`

Possible fields:

-   `id`: UUID primary key.
-   `name`: required, unique under a defined case/normalization rule.
-   `slug`: unique URL-friendly value.
-   `description`: optional text.
-   `sort_order`: optional integer.
-   `created_at`, `updated_at`: timestamps.

### 6.3 Optional `material_tags` join table

Use if many-to-many tags are needed:

-   `material_id` foreign key.
-   `tag_id` foreign key.
-   Unique composite key to prevent duplicates.

A separate `tags` table may be appropriate if tags need management and
reuse. Do not add a complex taxonomy unless actual requirements justify
it.

### 6.4 Data model safeguards

-   Add indexes for common filters and sorting only after query patterns
    are confirmed.
-   Use foreign keys and constraints to protect relationships.
-   Define a consistent publication status model.
-   Avoid storing signed URLs as durable document references; store
    bucket and object path.
-   Do not store secrets or sensitive admin credentials in material
    records.
-   Do not backfill or transform existing records until the mapping and
    rollback plan are reviewed.
-   Decide how to handle legacy rows, missing storage objects, duplicate
    titles, and orphan files before migration.

------------------------------------------------------------------------

## 7. Supabase authentication, authorization, and storage security

### 7.1 Admin authentication

-   Use Supabase Auth for sign-in and session handling.
-   Do not implement a hardcoded admin password in frontend code.
-   Do not rely on hiding an admin route or checking a client-side role
    as the security boundary.
-   Establish an authoritative admin authorization mechanism after
    inspecting the existing project: for example, a restricted
    admin-membership table/policy or trusted claims managed through a
    secure server-side process.
-   Ensure ordinary authenticated users cannot grant themselves admin
    privileges.
-   Protect all write operations with database and storage policies,
    even if the UI hides admin actions.
-   Verify sign-out, session refresh, expired sessions, direct URL
    access, and unauthorized requests.

### 7.2 Row Level Security

For every relevant table, inspect existing RLS and policies before
changing them. The intended policy model is:

-   Public/anonymous visitors can select only materials marked
    `published`.
-   Public visitors can read only the category/tag metadata needed for
    published materials.
-   Authorized admins can perform approved insert/update/delete actions.
-   Non-admin authenticated users cannot write materials, categories,
    tags, or privileged metadata.
-   RLS is enabled on all tables exposed through the Supabase API.
-   Policies are narrow, explicit, and tested under anonymous, normal
    authenticated, and admin identities.

Do not blindly paste policies from a template. Confirm actual table
names, relationships, auth model, existing grants, and policy
interactions. Check for overlapping permissive policies that could
accidentally broaden access.

### 7.3 Storage design

Choose public or private storage based on the actual content and access
requirements:

-   **Public bucket:** suitable only if every object in it is
    intentionally public. A public bucket makes object delivery public;
    do not use it for drafts or private files.
-   **Private bucket:** use authenticated downloads or short-lived
    signed URLs for published reader access. Ensure the app's access
    flow is compatible with the chosen policy.

Recommended controls:

-   Validate file extension, MIME type, and file size on upload; do not
    trust browser-provided MIME alone.
-   Use stable, collision-resistant storage paths, such as a material
    UUID plus a safe filename.
-   Restrict write/delete actions to authorized admins.
-   Restrict uploads to PDF files and an explicit size limit chosen
    after checking project needs and Supabase limits.
-   Configure storage policies for the correct bucket and intended
    object paths.
-   Avoid overwriting a live file before the new file has uploaded and
    validated successfully.
-   On replacement, upload the new object, update metadata, verify the
    new document, then clean up the old object only after success.
-   For deletion, define an explicit, approved cleanup order and handle
    partial failures without losing the record of the remaining file.
-   Keep the service-role key exclusively in a trusted
    server/administrative environment. Never place it in React, browser
    bundles, public environment variables, or commits.

### 7.4 Secrets and environment variables

Use only browser-safe variables in the frontend, typically:

``` env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Use the project's actual naming convention (for example, Next.js uses a
different public-variable prefix). Never expose service-role keys. Keep
local `.env` files out of version control; provide a redacted
`.env.example` with names only. Configure production variables in the
hosting provider's secret/environment settings.

------------------------------------------------------------------------

## 8. PDF upload, preview, and reader implementation

### 8.1 Upload flow

1.  Admin selects a PDF and enters metadata.
2.  Validate required fields, file type, file size, and filename.
3.  Show progress and disable duplicate submission while the operation
    is in flight.
4.  Upload to the configured bucket using a safe, unique path.
5.  Create/update the material record with the exact bucket and object
    path.
6.  Generate or queue a first-page preview.
7.  Verify the stored object and metadata.
8.  Show a success message and refresh the list.
9.  If any step fails, show the exact safe error and perform only safe
    compensation; do not silently delete prior data.

For large files or unreliable networks, evaluate resumable upload
support if available and justified.

### 8.2 Preview generation

-   Render page one from the actual PDF using PDF.js or an equivalent
    maintained tool.
-   Generate a small thumbnail, with an optional larger preview for
    reader entry.
-   Decide whether thumbnails are generated in the browser or by a
    trusted server/worker based on performance, privacy, and deployment
    constraints.
-   Store generated previews in a dedicated bucket/path only if needed.
-   Cache previews and lazy-load them in the grid.
-   Fall back to a neutral document placeholder only when preview
    generation genuinely fails; do not invent a cover image that implies
    it is the real document.

### 8.3 Reader

-   Load the selected PDF from the correct storage access path.
-   Render the current page and only render more pages when needed.
-   Track current page, total pages, zoom, search query, and fullscreen
    state.
-   Debounce search input if required by the library.
-   Handle worker configuration, CORS, expired signed URLs, network
    errors, password-protected PDFs, and corrupt files.
-   Check licensing and compatibility of any PDF library/dependencies
    before adoption.

**Important limitation:** browser text search depends on the PDF's text
layer. Scanned/image-only PDFs may need OCR before their text can be
searched. Do not claim full-text search works on scanned documents
unless OCR is actually implemented and tested.

------------------------------------------------------------------------

## 9. Search, filters, sorting, and pagination

Support relevant fields according to the actual schema:

-   Search title, description, subject, exam, category, and tags where
    feasible.
-   Filter by subject, category, exam, and tags.
-   Sort by newest, oldest, title, and any other meaningful field
    supported by the data.
-   Show active filters and provide a clear-all action.
-   Keep search/filter state in the URL when useful so links can be
    shared and browser back/forward behaves naturally.
-   Use pagination or a bounded "load more" strategy; avoid fetching the
    entire library at once.
-   Use server-side filtering for larger collections and avoid leaking
    unpublished metadata through client-side filtering.
-   Ensure count and results use the same filter criteria.
-   Add a suitable database index only after examining query plans and
    actual collection scale.

------------------------------------------------------------------------

## 10. Admin workflows in detail

### 10.1 Materials list

-   Server-backed list with pagination.
-   Search and filter by category/status.
-   Clear status badges, updated timestamps, and actionable row menu.
-   View/open, edit, replace PDF, publish/unpublish, and delete where
    authorized.
-   Confirm actions that can cause data loss.
-   Use optimistic updates only where safe; otherwise refresh from the
    server after success.

### 10.2 Create/edit form

-   Required title and file rules.
-   Description, subject, category, exam, tags, and publication status.
-   Inline validation and accessible error messages.
-   Warn about unsaved changes when navigating away.
-   Edit metadata without requiring the user to upload the same PDF
    again.
-   Show the current file and preview when editing.

### 10.3 Replace PDF

-   Keep the current PDF available until the replacement upload and
    metadata update succeed.
-   If a replacement fails, retain the old file and show a retry path.
-   Clean up the previous object only after verifying that no record
    references it and the new object is working.
-   Log safe operation details for diagnosis without logging secrets or
    signed URLs.

### 10.4 Delete

-   Require explicit confirmation with the material title and the
    consequences.
-   Follow the approved database/storage cleanup plan.
-   Handle storage deletion failure separately from database deletion
    failure.
-   Never claim deletion succeeded unless all required steps are
    confirmed.
-   For potentially irreversible bulk operations, require a separate
    review and approval.

### 10.5 Categories and tags

-   Create, rename, and reorder categories as supported.
-   Prevent duplicate slugs/names according to defined rules.
-   Decide what happens to materials when a category is renamed or
    removed.
-   Prefer archive/reassign workflows over destructive deletion when
    references exist.
-   Ensure public filters show only relevant categories or handle empty
    categories intentionally.

------------------------------------------------------------------------

## 11. Implementation sequence

  ---------------------------------------------------------------------------------------
  Stage                   Work                       Exit criteria
  ----------------------- -------------------------- ------------------------------------
  0                       Read-only local and        Correct project identified;
                          Supabase inspection        inventory and risks reported

  1                       Audit user journeys and    Approved change list and test plan
                          design system              

  2                       Fix foundations            Build, routes, client setup, types,
                                                     and shared states are stable

  3                       Redesign library home      Real Supabase data, previews,
                                                     search, filters, sorting, pagination

  4                       Implement reader           Real PDFs render; navigation, zoom,
                                                     search, fullscreen work

  5                       Secure admin access        Auth and server/database/storage
                                                     authorization verified

  6                       Admin material workflows   Upload/edit/replace/publish/delete
                                                     and progress/error states work

  7                       Categories/tags and data   Relationships and filters behave
                          quality                    correctly

  8                       Security verification      RLS and storage policies tested for
                                                     anonymous/user/admin

  9                       Responsive/accessibility   Main flows work on
                          polish                     mobile/tablet/desktop and keyboard

  10                      Regression and deployment  Build/tests pass; release notes,
                                                     environment setup, rollback plan
                                                     documented
  ---------------------------------------------------------------------------------------

Do not start a later stage if a security or data-integrity blocker from
an earlier stage remains unresolved.

------------------------------------------------------------------------

## 12. Testing and verification plan

### 12.1 Automated checks

Run the commands supported by the existing repository, such as:

``` bash
npm run lint
npm run typecheck
npm test
npm run build
```

Do not assume these scripts exist; inspect `package.json` and use the
project's actual scripts. Add targeted tests where useful without
introducing unnecessary test infrastructure.

### 12.2 Functional tests

-   Published materials appear; drafts/unpublished materials do not.
-   Search, filters, sorting, pagination, and clear-all work together.
-   Opening a card loads the matching PDF and metadata.
-   Page controls respect document bounds.
-   Zoom and fullscreen work and remain usable on smaller screens.
-   Search works for text-based PDFs and limitations are clear for
    scanned PDFs.
-   Invalid file types and oversized PDFs are rejected.
-   Upload progress, success, failure, retry, and duplicate submission
    handling work.
-   Metadata updates persist after refresh.
-   Replacement failure leaves the original file intact.
-   Delete cancellation does nothing; confirmed deletion follows the
    approved process.
-   Admin route direct access is rejected for unauthorized visitors.
-   Session expiry and sign-out are handled correctly.
-   Broken/missing storage objects produce a useful error rather than a
    blank screen.
-   Deep links and refresh work on library, reader, and admin routes.

### 12.3 Security tests

Run these checks in a safe staging/test environment where possible:

-   Anonymous user can select published materials only.
-   Anonymous user cannot insert/update/delete materials or categories.
-   Authenticated non-admin cannot perform admin writes.
-   Authorized admin can perform allowed writes.
-   Storage uploads/deletes are rejected for unauthorized users.
-   Draft PDFs are not publicly accessible if private storage is
    required.
-   Admin privilege cannot be self-assigned through client requests.
-   RLS is enabled and policy behavior matches the intended rules.
-   No service-role key appears in source code, frontend bundle, browser
    requests, logs, or repository history.
-   Signed URLs, if used, expire as expected and are not stored as
    permanent references.

Do not run destructive security tests against production data. Never
disable RLS to "fix" an access error.

### 12.4 Visual and responsive checks

Open the actual running site in a browser and inspect:

-   Home page at narrow mobile, larger mobile, tablet, and desktop
    widths.
-   Search and filter states, no results, loading, and error states.
-   Reader with short and long PDFs, portrait/landscape pages where
    applicable, zoom, and fullscreen.
-   Admin list, upload/edit forms, validation messages, and confirmation
    dialogs.
-   Keyboard-only navigation and visible focus.
-   Console errors, failed network requests, missing assets, and layout
    overflow.

Take screenshots only if helpful for before/after review. Verify the
rendered site rather than relying solely on source-code inspection.

### 12.5 Report results honestly

For each test, record **Passed**, **Failed**, **Blocked**, or **Not
run**, plus the reason. Distinguish local build success from live
Supabase integration success. Never claim that the deployed website or
remote Supabase policies were tested unless they were actually accessed
and tested.

------------------------------------------------------------------------

## 13. Deployment plan

1.  Confirm target hosting platform and current deployment process.
2.  Review build settings and route fallback/rewrites for client-side
    routing.
3.  Configure only the required public Supabase URL and anon/publishable
    key in the frontend environment.
4.  Keep service-role credentials only in a trusted server/CI secret
    store when a server-side task genuinely needs them.
5.  Set Supabase Auth site URL and redirect URLs for the correct
    domains.
6.  Verify CORS and storage access behavior for the deployed domain.
7.  Apply reviewed database migrations in a controlled order; take a
    backup or confirm a recovery path first.
8.  Verify storage bucket configuration and RLS policies before enabling
    public traffic.
9.  Deploy to staging, run smoke and security tests, then deploy to
    production.
10. Verify sign-in, public listing, reader, upload, edit, replacement,
    and deletion using test records.
11. Monitor application errors and Supabase logs after release.
12. Keep a rollback path for frontend deployment and database changes.
    Database rollback may require a forward-fix or restore; do not
    promise automatic reversibility for destructive operations.

### Environment template

Use the prefix required by the framework. For a Vite React project:

``` env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never place a service-role key in `VITE_*` variables or any
browser-exposed configuration.

------------------------------------------------------------------------

## 14. Data preservation and change control

Before each consequential change:

-   Identify the exact project, table, bucket, policy, route, or file
    affected.
-   Explain why the change is necessary and what behavior it changes.
-   Check whether existing records or storage objects depend on it.
-   Prefer additive migrations and backward-compatible code.
-   Back up or establish a recovery method before database changes.
-   Request approval for destructive or broad-impact actions.
-   Record migration names, deployment version, and rollback/forward-fix
    notes.
-   Avoid changing unrelated functionality during a UI redesign.
-   Keep user edits and unrelated uncommitted changes intact.

Never delete tables, buckets, files, records, users, or policies without
explicit approval. Never use production data for casual test
uploads/deletions.

------------------------------------------------------------------------

## 15. Risks and decisions to resolve during inspection

  -----------------------------------------------------------------------
  Risk / question                     Required handling
  ----------------------------------- -----------------------------------
  More than one Supabase project      Compare app configuration and
  could match                         project metadata; stop if ambiguous

  Existing schema differs from        Map to current schema; do not
  proposal                            recreate it blindly

  Existing policies overlap           Evaluate effective access before
                                      editing policies

  Bucket may be public today          Confirm whether current files are
                                      intended to be public before
                                      changing access

  Admin role model is unclear         Identify an authoritative secure
                                      model before implementing write
                                      policies

  PDFs are large                      Establish file-size limits,
                                      progress behavior, and suitable
                                      loading strategy

  Scanned PDFs lack text              Explain search limitation or
                                      propose OCR as a separate feature

  Preview generation is expensive     Choose browser/server strategy
                                      after evaluating hosting and scale

  Replacement/delete can orphan files Use staged operations,
                                      verification, and explicit cleanup

  Existing user changes are           Preserve them and avoid broad
  uncommitted                         rewrites

  Missing credentials or permissions  Mark blocked; ask for the required
                                      authorized access without
                                      requesting secrets in chat

  Tests cannot reach live Supabase    Report local-only coverage and what
                                      remains unverified
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 16. Final delivery report template

At completion, provide:

### Summary

-   What was improved and why.
-   Which existing functionality was preserved.
-   Any intentional scope exclusions.

### Files changed

For each file: path, purpose, and notable behavior changes.

### Supabase changes

-   Project reference (safe identifier).
-   Migration names and database objects affected.
-   RLS/storage policy changes and rationale.
-   Bucket changes, if any.
-   Confirmation that existing records/files were preserved, or a
    precise list of approved changes.

### Verification

-   Build, lint, typecheck, and automated test results.
-   Browser-tested pages and viewport sizes.
-   Auth/RLS/storage tests performed and identity used for each.
-   Console/network errors found and fixed.
-   Tests blocked or not run, with reasons.

### Deployment

-   Build/deploy commands and required environment variable **names**.
-   Auth redirect/domain settings to verify.
-   Migration and rollback/forward-fix notes.
-   Remaining risks or follow-up tasks.

### Final status

Use one of: - **Ready for release:** all critical paths and security
checks passed. - **Ready for staging review:** implementation is
functional but production checks remain. - **Blocked:** list the
specific access, configuration, or defect preventing safe completion.

------------------------------------------------------------------------

## 17. First action checklist

The very first task is not a redesign or migration. It is read-only
discovery.

-   [ ] Inspect repository and working-tree changes.
-   [ ] Read package scripts, routes, components, styles, and assets.
-   [ ] Identify the Supabase URL/project reference used by the app
    without revealing credentials.
-   [ ] Confirm the matching Supabase project.
-   [ ] Inventory tables, columns, RLS policies, storage
    buckets/policies, and auth setup.
-   [ ] Trace existing public, reader, and admin flows.
-   [ ] Produce the discovery report and prioritized implementation
    plan.
-   [ ] Wait for approval before making changes that affect Supabase or
    existing data.

**Operating principle:** inspect first, report clearly, preserve data,
make the smallest sound changes, verify real behavior, and be
transparent about anything not tested.
