# GitHub Copilot Instructions for Kanri Documentation

## Project Overview

This is the official documentation site for **Kanri** — a school management platform for martial arts schools, dance studios, gymnastics clubs, and similar activity-based schools. It is built with [Astro Starlight](https://starlight.astro.build/) and deployed to Cloudflare Pages.

**Live site:** <https://docs.kanrimemberships.com>  
**Kanri app:** <https://app.kanrimemberships.com>  
**Kanri source:** `./kanri1`, `./kanri2`, and `./kanri3`, relative to the workspace root that contains this repository. Use the clone selected for the current task as the source of truth for feature behaviour. If no clone is established, ask which to use; do not assume the clones contain identical changes. Documentation is at `./kanri-docs`. Repository-local paths below are relative to `kanri-docs`; cross-repository paths are workspace-relative. Check the current location after resuming a session; never reuse historical absolute paths.

---

## Audience

Documentation is written for **non-technical school owners, administrators, and staff**. Assume readers:

- Are comfortable using a web browser but are not technical
- May not know terms like "dashboard", "CRM", or "database" — use plain language
- Are learning Kanri for the first time, or looking up how to do a specific task
- Benefit from numbered steps, concrete examples, and simple explanations

**Never use jargon without explaining it first.** When introducing a new concept, define it in plain terms before using the name.

---

## Writing Style Guide

- **Voice:** Friendly, supportive, direct. Write like a helpful colleague, not a manual.
- **Person:** Use "you" to address the reader. Avoid passive voice.
- **Tone:** Encouraging. Users may be setting up software for the first time.
- **Sentence length:** Short and clear. One idea per sentence.
- **Headings:** Action-oriented ("Add a New Member", not "Member Addition").
- **Steps:** Number every multi-step process. Start each step with a verb ("Click", "Enter", "Select").
- **Notes/Tips:** Use Starlight `:::note`, `:::tip`, and `:::caution` admonitions for important callouts.
- **Screenshots:** Reference screenshots with descriptive alt text. Place them after the step they illustrate.
- **Links:** Link to related pages liberally and naturally throughout the body text — readers should never feel stuck.
- **Examples:** Use realistic examples relevant to martial arts schools, dance studios, gymnastics clubs (e.g. "Springfield Karate", "Adult Karate", "Yellow Belt").

### Linking — Model After Stripe and Cloudflare

Links are one of the most important parts of good documentation. Use them aggressively:

- **Inline links on first mention:** The first time you mention a concept or feature in an article, link its name to the relevant reference or overview page. Example: "Before creating a subscription, the member needs a [payment method](/members/subscriptions/add-payment-method/) on file."
- **Link on every mention if it helps:** If a term appears multiple times and a new reader hitting that paragraph would benefit from a link, include it again. Don't assume the reader read the top of the page.
- **Link concepts, not just features:** When you mention something abstract like "active membership", "billing plan", or "program access gating", link the phrase to wherever that concept is explained.
- **"See also" and "Next steps" sections:** End every guide with a curated list of related pages — what would someone naturally do next, or want to learn more about?
- **Cross-section links:** When a Schedules page mentions attendance, link to the attendance section. When a Billing page mentions subscriptions, link to the subscriptions section. Never assume the reader knows where else to look.
- **Prerequisite links:** If a guide requires something to be set up first, say so at the top and link to the setup guide. Example: "You'll need at least one billing plan before you can create a subscription. [Create a billing plan →](/billing/billing-plans/create-plan/)"
- **Avoid dead ends:** Every page should have at least one link onwards. A page with no outbound links is a dead end.

### Do

- Include "Before you start" prerequisites at the top of complex guides, with links
- Break long content into sub-pages rather than one giant page
- Add a "Next steps" section at the bottom of each guide with 2–4 relevant links
- Use tables for comparing options or listing fields with descriptions
- When a term has its own reference page (e.g. glossary, member fields reference), link to it

### Don't

- Don't reference internal implementation details (Rust, database schema, API routes)
- Don't use developer acronyms (CRUD, API, HTTP) without explanation
- Don't write placeholder content — stubs use bullet-point outlines, full articles should have real content
- Don't repeat the same information across multiple pages — link instead
- Don't document the **Staff PIN** — this is an internal feature that should not appear in docs
- Don't document **Organisations** — this feature is being refactored out; everything belongs to a school
- **Avoid em-dashes (—) almost entirely.** The default should be: don't use one. When you feel the urge to write an em-dash, stop and rewrite the sentence instead. Use a comma, a colon, a period, or split into two sentences. Em-dashes are permitted only in the rarest cases where no rewrite is natural — and even then, only one per page maximum.

---

## What's New Changelog Workflow

`src/content/docs/whats-new/` is the single source for published updates and
unpublished feature announcements. Do not maintain a separate app changelog or
copy entries into monthly or seasonal roundups.

- For a user-visible change that is already available, add it to a
  `YYYY-MM-DD.mdx` entry using the release date. If an entry for that date
  already exists, add the change there. Keep entries factual, concise, and
  linked to the relevant user guide.
- For a larger feature that is being implemented in pieces and is not ready
  for announcement, create one feature entry with `draft: true`. Update that
  same draft as user-visible pieces become available. Publish the announcement
  only when the complete feature is ready, by renaming it to
  `YYYY-MM-DD.mdx` and removing `draft: true`.
- Publish or update detailed how-to guides as soon as they accurately describe
  behavior users can access. A draft announcement does not make live feature
  documentation a draft.
- `src/components/WhatsNewList.astro` automatically lists published entries
  by date. Do not manually duplicate entries in the What's New index or add
  draft pages to the sidebar. Starlight excludes draft pages from production
  builds.
- When publishing an entry, add its dated page to the What's New group in
  `astro.config.mjs`. The index is automatic; the sidebar is not.
- Use `_monthly-template.mdx` as the starting format for an unpublished
  feature entry. Keep its draft status until publication.

---

## Critical Kanri Concepts

### The Most Important Distinction: Membership vs Subscription

These are the two most commonly confused concepts. **Always** be precise:

- **Membership** = enrolment record — "which program is this member enrolled in?" (e.g. Adult Karate, Active status, White Belt)
- **Subscription** = billing record — "how and when does this member pay?" (e.g. Monthly Karate plan, $120/month, charges on the 1st)

They are **completely independent objects**. A member can have a membership without a subscription (e.g. cash payer), or a subscription without a membership (a data error). The "Only Memberships" and "Only Subscriptions" reports exist specifically to find these mismatches.

### Billing Plans and Prices

A **Billing Plan** is a named product (e.g. "Monthly Karate"). A **Price** is a specific amount and interval on that plan (e.g. Adult $120/month, Junior $80/month). One plan can have multiple prices — controlled by the school-level **Billing Plan Mode** setting (Single = one price per plan, Multiple = several prices per plan).

### Programs, Classes, and Schedules

- **Program** = a category of training (e.g. "Adult Karate", "Junior Ballet")
- **Class** = a named type of training within a program (e.g. "Karate (Blue–Black Belt)", "Beginner Karate", "Open Mat")
- **Class Variant** = an optional sub-type of a class — e.g. "Sparring" or "Kata" as variants of "Karate (Blue–Black Belt)". Variants are optional; a class with no variants just runs as itself.
- **Session** = a single occurrence of a class (with optional variant) at a specific time — e.g. "Monday 7–8pm". Sessions are generated by Schedules.
- **Schedule** = a named timetable containing recurring class entries, with optional effective and end dates
- **Sync** = applying template changes to an active timetable. Check the actual sync handler for booking reassignment/cancellation; do not promise that changes can never affect existing records.

The "counts towards attendance" flag lives on the **class** — if turned off, attending any session of that class (regardless of variant) does not count toward level promotion requirements.

### Levels and Promotions

Levels are ranks within a program (e.g. White Belt, Yellow Belt). Each level has optional `min_classes` and `min_days` requirements. A **Promotion** in Kanri means advancing a member to the next level — NOT a discount or marketing promotion. The Promotions report shows members who have met their level's requirements.

### Groups

Groups are named collections of members. Currently used for targeting broadcasts, but will be used for other purposes in the future — document them as a general-purpose grouping tool, not solely as a broadcast feature. Two assignment types:

1. **Member assignments** — specific members added directly (static)
2. **Program assignments** — all active members in a program, with optional min/max level range (dynamic)

### Lead Page

The public-facing enrolment form at a school's public URL. Prospective members submit their details; optionally book a trial class; optionally sign a waiver. Controlled by three independent toggles: `lead_page_enabled`, `lead_page_bookings_enabled`, `lead_page_waivers_enabled`.

### Key Behaviors Settings

These school-level settings significantly affect how Kanri works:

- **Auto-link accounts** — links a user account to a member profile when emails match
- **Block expired subscriptions (kiosk)** — prevents kiosk sign-in without an active subscription
- **Single vs Multiple subscription mode** — whether a member can have one or multiple active subscriptions
- **Billing plan mode** — Single (one price per plan) or Multiple (several prices per plan)
- **Program access gating** — when on, active subscriptions control which programs a member can sign in for at the kiosk
- **Subscription receipts** — whether members get email receipts after each payment

### What NOT to Document

- **Staff PIN** — do not mention or document
- **Organisations** — being refactored out; treat everything as belonging to "a school"

---

## Document Structure Examples

The outline below is illustrative, not the current inventory. Inspect the actual files and `astro.config.mjs` for current paths. `DOCS_AUDIT.md` tracks writing status and implementation evidence; do not recreate an obsolete path from this outline.

```
src/content/docs/
├── index.mdx                                    # Homepage (splash page)
├── introduction.mdx                             # What is Kanri, who it's for
├── how-it-all-fits-together.mdx                 # Conceptual overview of all pieces
│
├── getting-started/
│   ├── index.mdx                                # Setup overview
│   ├── create-your-school.mdx
│   ├── initial-settings.mdx
│   ├── create-your-first-program.mdx
│   ├── create-your-first-schedule.mdx
│   ├── add-your-first-member.mdx
│   ├── set-up-billing.mdx
│   └── invite-your-team.mdx
│
├── members/
│   ├── index.mdx                                # Members overview
│   ├── add-member.mdx
│   ├── edit-member.mdx
│   ├── search-and-filter.mdx
│   ├── merge-duplicate-members.mdx
│   ├── invite-member-portal.mdx
│   ├── assign-member-number.mdx
│   ├── notes.mdx                                # Mutable notes (medical, discounts, etc.)
│   ├── interactions.mdx                         # Immutable log entries (incidents, calls)
│   ├── contacts/
│   │   ├── index.mdx
│   │   ├── add-contact.mdx
│   │   └── set-billing-contact.mdx
│   ├── memberships/
│   │   ├── index.mdx
│   │   ├── assign-membership.mdx
│   │   ├── change-status.mdx
│   │   ├── promote-level.mdx
│   │   └── end-membership.mdx
│   ├── subscriptions/
│   │   ├── index.mdx
│   │   ├── add-payment-method.mdx
│   │   ├── create-subscription.mdx
│   │   ├── edit-subscription.mdx
│   │   ├── extend-subscription.mdx
│   │   ├── cancel-subscription.mdx
│   │   ├── retry-failed-payment.mdx
│   │   └── view-payment-history.mdx
│   ├── attendance/
│   │   ├── index.mdx
│   │   ├── view-member-attendance.mdx
│   │   ├── add-attendance-manually.mdx
│   │   └── delete-attendance.mdx
│   ├── bookings/
│   │   ├── index.mdx
│   │   ├── book-member-into-class.mdx
│   │   ├── cancel-booking.mdx
│   │   └── mark-attended-no-show.mdx
│   ├── gallery/
│   │   ├── index.mdx
│   │   ├── upload-files.mdx
│   │   └── manage-folders.mdx
│   └── messages/
│       ├── index.mdx
│       └── send-message-to-member.mdx
│
├── programs/
│   ├── index.mdx
│   ├── create-program.mdx
│   ├── edit-program.mdx
│   ├── levels/
│   │   ├── index.mdx
│   │   ├── create-level.mdx
│   │   ├── edit-level.mdx
│   │   ├── promote-member.mdx
│   │   └── promotions-report.mdx
│   └── classes/
│       ├── index.mdx
│       ├── create-class.mdx
│       └── create-class-variant.mdx
│
├── schedules/
│   ├── index.mdx
│   ├── create-schedule.mdx
│   ├── edit-schedule.mdx
│   ├── duplicate-schedule.mdx
│   ├── activate-deactivate.mdx
│   ├── sync-schedule.mdx
│   ├── taking-attendance.mdx
│   └── bookings/
│       ├── index.mdx
│       ├── view-session-bookings.mdx
│       ├── add-booking.mdx
│       ├── cancel-booking.mdx
│       └── booking-analytics.mdx
│
├── billing/
│   ├── index.mdx
│   ├── billing-plans/
│   │   ├── index.mdx
│   │   ├── create-plan.mdx
│   │   ├── edit-plan.mdx
│   │   ├── add-price.mdx
│   │   ├── edit-price.mdx
│   │   └── set-program-access.mdx
│   ├── payouts/
│   │   ├── index.mdx
│   │   ├── view-payouts.mdx
│   │   └── update-bank-account.mdx
│   └── troubleshooting/
│       ├── failed-payments.mdx
│       ├── disputed-payments.mdx
│       └── subscription-not-charging.mdx
│
├── messages/
│   ├── index.mdx
│   ├── send-broadcast.mdx
│   ├── send-to-member.mdx
│   ├── using-templates.mdx
│   └── view-message-history.mdx
│
├── groups/
│   ├── index.mdx
│   ├── create-group.mdx
│   ├── add-members-to-group.mdx
│   ├── add-program-to-group.mdx
│   └── send-broadcast-to-group.mdx
│
├── reports/
│   ├── index.mdx
│   ├── attendance/
│   │   ├── attendance.mdx
│   │   ├── historical-attendance.mdx
│   │   └── absentees.mdx
│   ├── memberships/
│   │   ├── memberships.mdx
│   │   ├── historical-memberships.mdx
│   │   ├── only-memberships.mdx
│   │   ├── only-subscriptions.mdx
│   │   └── promotions.mdx
│   ├── billing/
│   │   ├── payments.mdx
│   │   ├── historical-payments.mdx
│   │   ├── active-subscriptions.mdx
│   │   ├── failing-subscriptions.mdx
│   │   ├── disputed-payments.mdx
│   │   └── subscriptions.mdx
│   ├── bookings/
│   │   └── bookings.mdx
│   └── other/
│       ├── birthdays.mdx
│       └── health.mdx
│
├── gallery/
│   ├── index.mdx
│   ├── upload-files.mdx
│   ├── manage-folders.mdx
│   └── share-gallery.mdx
│
├── kiosk/
│   ├── index.mdx
│   ├── set-up-kiosk.mdx
│   ├── member-numbers.mdx
│   └── kiosk-behaviors.mdx
│
├── lead-management/
│   ├── index.mdx
│   ├── view-leads.mdx
│   └── lead-page/
│       ├── index.mdx
│       ├── enable-lead-page.mdx
│       ├── configure-lead-page.mdx
│       └── share-your-lead-page.mdx
│
├── settings/
│   ├── index.mdx
│   ├── general.mdx
│   ├── membership-statuses.mdx
│   ├── booking-settings.mdx
│   ├── referral-types.mdx
│   ├── account.mdx
│   ├── usage.mdx
│   ├── branding/
│   │   ├── index.mdx
│   │   ├── brand-color-logo.mdx
│   │   ├── email-address.mdx
│   │   ├── phone-number.mdx
│   │   └── vanity-url.mdx
│   ├── roles/
│   │   ├── index.mdx
│   │   ├── create-role.mdx
│   │   ├── invite-staff.mdx
│   │   └── manage-role-users.mdx
│   ├── behaviors/
│   │   ├── index.mdx
│   │   ├── general-behaviors.mdx
│   │   ├── kiosk-behaviors.mdx
│   │   └── subscription-behaviors.mdx
│   └── templates/
│       ├── index.mdx
│       └── create-template.mdx
│
├── logs/
│   ├── index.mdx
│   ├── reading-the-log.mdx
│   └── member-log.mdx
│
├── member-portal/
│   ├── index.mdx
│   ├── invite-member.mdx
│   └── what-members-can-see.mdx
│
├── troubleshooting/
│   ├── member-cant-check-in.mdx
│   ├── payment-failed.mdx
│   ├── member-missing-from-list.mdx
│   ├── schedule-not-showing.mdx
│   └── cant-invite-staff.mdx
│
└── reference/
    ├── glossary.mdx
    ├── plans.mdx
    ├── permissions.mdx
    ├── billing-plan-fields.mdx
    ├── member-fields.mdx
    ├── schedule-fields.mdx
    └── report-index.mdx
```

---

## Plan Tiers

Kanri has Starter, Professional, and Enterprise plans. Keep the comparison in
`src/content/docs/reference/plans.mdx`, rather than copying prices or fees into
these instructions.

- Verify feature availability against the selected clone's current
  `Features::starter()`, `professional()`, and `enterprise()` definitions and
  the relevant route's authorization checks.
- Verify public prices and usage fees against the current authoritative
  marketing pricing/usage pages. Read that repository's instructions before
  using its source. Account-specific terms may differ.
- Explain prerequisites where they matter, but do not add Pro badges to the
  sidebar. Keep Beta notices for features that are still in beta.
- Do not infer a feature is unfinished from an older "coming soon" table, or
  infer that a role permission enables a feature the school does not have.

---

## Content Status

The public guides are authored. Use `DOCS_AUDIT.md` for the current page
inventory, reviewed claims, implementation sources, and unresolved limitations.
Written content is not automatically verified content.

When adding or changing a guide:

1. Read the actual route, form, validation, and processing logic for every
   material claim. Check exact labels, defaults, permissions, dates, and side
   effects rather than relying on older developer notes.
2. Follow the writing style guide and include practical examples and related links.
3. Keep the page's writing and implementation-review records up to date.
4. Distinguish source-verified behavior from live deployment, provider, pricing,
   or account-specific facts. Record uncertainty rather than inventing a promise.

---

## Tech Stack

- **Framework:** Astro 5 with Starlight
- **Styling:** Tailwind CSS v4 + `@astrojs/starlight-tailwind`
- **Fonts:** Geist Variable (matches Kanri app)
- **Deployment:** Cloudflare Pages (via `@astrojs/cloudflare` adapter)
- **Icons:** `astro-icon`

### Kanri Brand Colors

- **Primary purple:** `hsl(254, 82%, 47%)` = `#4316da`
- **Dark mode accent:** `#6040f0` (lightened for readability on dark backgrounds)
- **Dark background:** `hsl(224, 71.4%, 4.1%)` ≈ `#0d0d1a`

---

## Adding New Pages

1. Create the `.mdx` file in the correct `src/content/docs/` subdirectory
2. Add frontmatter: `title` and `description` (required)
3. Add the page to the `sidebar` array in `astro.config.mjs` — all sections use `collapsed: true` except "Start Here"
4. Write content following the style guide
5. Link to the new page from related pages

### Sidebar structure

The sidebar uses collapsible groups (`collapsed: true`). Only "Start Here" is always expanded. All other top-level sections (Members, Programs, Schedules, Billing, etc.) start collapsed. Sub-sections within a parent section also use `collapsed: true`. Starlight automatically expands the section containing the currently active page.

### Starlight Slug Convention

`index.mdx` inside a directory uses the **directory name** as its slug — not `directory/index`.

```js
// ✅ Correct
{ label: "Members", slug: "members" }             // → members/index.mdx

// ❌ Wrong — will fail build
{ label: "Members", slug: "members/index" }
```
