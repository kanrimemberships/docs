#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const eventFile = process.argv[2];
if (!eventFile) {
  console.error("Usage: node scripts/generate-workflow-events.mjs <path-to-kanri1/src/event.rs>");
  process.exit(1);
}

const sourcePath = resolve(eventFile);
const source = readFileSync(sourcePath, "utf8");
const pagePath = resolve("src/content/docs/workflows/reference/trigger-events.mdx");
const page = readFileSync(pagePath, "utf8");
const beginMarker = "{/* BEGIN GENERATED WORKFLOW EVENT CATALOG */}";
const endMarker = "{/* END GENERATED WORKFLOW EVENT CATALOG */}";

const matches = [...source.matchAll(/^\s{4}([A-Za-z]\w*)\s+(\d+)\s+"([^"]+)"\s+"([^"]+)"\s+\{/gm)];
if (matches.length === 0) {
  throw new Error(`No event declarations found in ${sourcePath}`);
}

const events = matches.map(([, variant, id, name, label]) => ({ variant, id, name, label }));
const names = new Set(events.map((event) => event.name));
if (names.size !== events.length) {
  throw new Error("Duplicate event names found; refusing to generate an ambiguous catalog.");
}

const auditOnlyMatch = source.match(
  /pub fn is_audit_only\(self\)[\s\S]*?matches!\(\s*self,([\s\S]*?)\n\s*\)\s*\}/,
);
if (!auditOnlyMatch) {
  throw new Error(`Could not find EventType::is_audit_only in ${sourcePath}`);
}

const auditOnlyVariants = new Set(
  [...auditOnlyMatch[1].matchAll(/\bSelf::([A-Za-z]\w*)/g)].map(([, variant]) => variant),
);
const eventVariants = new Set(events.map((event) => event.variant));
for (const variant of auditOnlyVariants) {
  if (!eventVariants.has(variant)) {
    throw new Error(`Audit-only event ${variant} has no matching event declaration.`);
  }
}

const categoryLabels = {
  admin_fee: "Administrative fees",
  billing_plan: "Billing plans",
  billing_plan_price: "Billing plan prices",
  billing_plan_program_access: "Billing plan program access",
  calendar_event: "Calendar events",
  class: "Classes",
  class_group: "Class groups",
  class_program: "Class programs",
  class_variant: "Class variants",
  conversation: "Conversations",
  document: "Documents",
  document_signing: "Document signing",
  document_template: "Document templates",
  evaluation_template: "Evaluation templates",
  group: "Groups",
  group_assignment: "Group assignments",
  invoice: "Invoices",
  invoice_discount: "Invoice discounts",
  invoice_item: "Invoice items",
  invoice_item_allocation: "Invoice item allocations",
  invoice_item_fulfillment: "Invoice item fulfillment",
  inventory: "Inventory",
  kiosk_session: "Kiosk sessions",
  member: "Members",
  member_contact: "Member contacts",
  member_discount: "Member discounts",
  member_evaluation: "Member evaluations",
  member_interaction: "Member interactions",
  member_note: "Member notes",
  member_type_history: "Member type history",
  membership: "Memberships",
  membership_history: "Membership history",
  membership_promotion: "Membership promotions",
  membership_status: "Membership statuses",
  message: "Messages",
  message_template: "Message templates",
  organization: "School events",
  payment_method: "Payment methods",
  product: "Products",
  product_category: "Product categories",
  product_variant: "Product variants",
  program: "Programs",
  purchase_order: "Purchase orders",
  purchase_order_item: "Purchase order items",
  refund: "Refunds",
  return_order: "Returns",
  role: "Staff roles",
  school: "School settings",
  schedule: "Schedules",
  session: "Sessions",
  session_credit: "Session credits",
  shift: "Staff shifts",
  shift_offer: "Staff shift offers",
  staff_clock_record: "Staff time records",
  subscription: "Subscriptions",
  subscription_payment: "Subscription payments",
  supplier: "Suppliers",
  workflow: "Workflows",
};

function categoryLabel(prefix) {
  return categoryLabels[prefix]
    ?? prefix.split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function markdownCell(value) {
  return value.replaceAll("|", "\\|").replaceAll("`", "\\`");
}

const selectable = events.filter((event) => !auditOnlyVariants.has(event.variant));
const categories = new Map();
for (const event of selectable) {
  const prefix = event.name.split(".")[0];
  if (!categories.has(prefix)) categories.set(prefix, []);
  categories.get(prefix).push(event);
}

const generatedCatalog = [
  `### Selectable events (${selectable.length})`,
  ...[...categories.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([prefix, categoryEvents]) => [
      "",
      `#### ${categoryLabel(prefix)}`,
      "",
      "| Event name | Label shown in the selector |",
      "|---|---|",
      ...categoryEvents.map(
        ({ name, label }) => `| \`${markdownCell(name)}\` | ${markdownCell(label)} |`,
      ),
    ]),
].join("\n");

const beginIndex = page.indexOf(beginMarker);
const endIndex = page.indexOf(endMarker);
if (beginIndex === -1 || endIndex === -1 || endIndex <= beginIndex) {
  throw new Error(`Expected one ordered pair of generated catalog markers in ${pagePath}`);
}
if (page.indexOf(beginMarker, beginIndex + beginMarker.length) !== -1
  || page.indexOf(endMarker, endIndex + endMarker.length) !== -1) {
  throw new Error(`Expected exactly one generated catalog marker pair in ${pagePath}`);
}

const nextPage = [
  page.slice(0, beginIndex + beginMarker.length),
  "",
  generatedCatalog,
  "",
  page.slice(endIndex),
].join("");
writeFileSync(pagePath, nextPage);
console.log(`Generated ${selectable.length} selectable event types from ${sourcePath}.`);
