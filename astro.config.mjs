// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.kanrimemberships.com",
  integrations: [
    starlight({
      title: "Kanri",
      logo: { src: "./src/assets/logo.svg" },
      components: {
        Hero: "./src/components/Hero.astro",
      },
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Introduction", slug: "introduction" },
            {
              label: "How It All Fits Together",
              slug: "how-it-all-fits-together",
            },
          ],
        },
        {
          label: "What's New",
          collapsed: true,
          items: [
            { label: "All Releases", slug: "whats-new" },
            { label: "Spring 2026", slug: "whats-new/spring-2026" },
          ],
        },
        {
          label: "Getting Started",
          collapsed: true,
          items: [
            { label: "Overview", slug: "getting-started" },
            {
              label: "Create Your School",
              slug: "getting-started/create-your-school",
            },
            {
              label: "Initial Settings",
              slug: "getting-started/initial-settings",
            },
            {
              label: "Create Your First Program",
              slug: "getting-started/create-your-first-program",
            },
            {
              label: "Create Your First Schedule",
              slug: "getting-started/create-your-first-schedule",
            },
            {
              label: "Add Your First Member",
              slug: "getting-started/add-your-first-member",
            },
            { label: "Set Up Billing", slug: "getting-started/set-up-billing" },
            {
              label: "Invite Your Team",
              slug: "getting-started/invite-your-team",
            },
          ],
        },
        {
          label: "Members",
          collapsed: true,
          items: [
            { label: "Overview", slug: "members" },
            { label: "Add a Member", slug: "members/add-member" },
            { label: "Edit a Member", slug: "members/edit-member" },
            { label: "Search & Filter", slug: "members/search-and-filter" },
            {
              label: "Duplicate a Member",
              slug: "members/duplicate-members",
            },
            {
              label: "Invite to Member Portal",
              slug: "members/invite-member-portal",
            },
            { label: "Member Number", slug: "members/member-number" },
            { label: "Notes", slug: "members/notes" },
            { label: "Interactions", slug: "members/interactions" },
            { label: "Discounts", slug: "members/discounts" },
            { label: "Evaluations", slug: "members/evaluations" },
            {
              label: "Billing",
              collapsed: true,
              items: [
                { label: "Overview", slug: "members/billing" },
                {
                  label: "View Invoices",
                  slug: "members/billing/view-invoices",
                },
                {
                  label: "Review Charges",
                  slug: "members/billing/view-charges",
                },
              ],
            },
            {
              label: "Contacts",
              collapsed: true,
              items: [
                { label: "About Contacts", slug: "members/contacts" },
                {
                  label: "Add a Contact",
                  slug: "members/contacts/add-contact",
                },
                { label: "Contact Of", slug: "members/contact-of" },
              ],
            },
            {
              label: "Memberships",
              collapsed: true,
              items: [
                { label: "About Memberships", slug: "members/memberships" },
                {
                  label: "Assign a Membership",
                  slug: "members/memberships/assign-membership",
                },
                {
                  label: "Change Status",
                  slug: "members/memberships/change-status",
                },
                {
                  label: "Promote a Level",
                  slug: "members/memberships/promote-level",
                },
                {
                  label: "End a Membership",
                  slug: "members/memberships/end-membership",
                },
              ],
            },
            {
              label: "Subscriptions",
              collapsed: true,
              items: [
                { label: "About Subscriptions", slug: "members/subscriptions" },
                {
                  label: "Add a Payment Method",
                  slug: "members/subscriptions/add-payment-method",
                },
                {
                  label: "Create a Subscription",
                  slug: "members/subscriptions/create-subscription",
                },
                {
                  label: "Edit a Subscription",
                  slug: "members/subscriptions/edit-subscription",
                },
                {
                  label: "Extend a Subscription",
                  slug: "members/subscriptions/extend-subscription",
                },
                {
                  label: "Archive a Subscription",
                  slug: "members/subscriptions/archive-subscription",
                },
                {
                  label: "Cancel a Subscription",
                  slug: "members/subscriptions/cancel-subscription",
                },
                {
                  label: "Retry a Failed Payment",
                  slug: "members/subscriptions/retry-failed-payment",
                },
                {
                  label: "View Payment History",
                  slug: "members/subscriptions/view-payment-history",
                },
                {
                  label: "Session Credits",
                  slug: "members/subscriptions/session-credits",
                },
              ],
            },
            {
              label: "Attendance",
              collapsed: true,
              items: [
                { label: "About Attendance", slug: "members/attendance" },
                {
                  label: "View Attendance History",
                  slug: "members/attendance/view-member-attendance",
                },
                {
                  label: "Add Attendance Manually",
                  slug: "members/attendance/add-attendance-manually",
                },
                {
                  label: "Delete an Attendance Record",
                  slug: "members/attendance/delete-attendance",
                },
              ],
            },
            {
              label: "Bookings",
              collapsed: true,
              badge: { text: "Pro", variant: "tip" },
              items: [
                { label: "About Bookings", slug: "members/bookings" },
                {
                  label: "Book into a Class",
                  slug: "members/bookings/book-member-into-class",
                },
                {
                  label: "Cancel a Booking",
                  slug: "members/bookings/cancel-booking",
                },
                {
                  label: "Reschedule a Booking",
                  slug: "members/bookings/reschedule-booking",
                },
                {
                  label: "Edit Booking Notes",
                  slug: "members/bookings/edit-booking",
                },
                {
                  label: "Mark Attended / No-Show",
                  slug: "members/bookings/mark-attended-no-show",
                },
              ],
            },
            {
              label: "Gallery",
              collapsed: true,
              items: [
                { label: "About Member Gallery", slug: "members/gallery" },
                { label: "Upload Files", slug: "members/gallery/upload-files" },
                {
                  label: "Manage Folders",
                  slug: "members/gallery/manage-folders",
                },
              ],
            },
          ],
        },
        {
          label: "Programs",
          collapsed: true,
          items: [
            { label: "Overview", slug: "programs" },
            { label: "Create a Program", slug: "programs/create-program" },
            { label: "Edit a Program", slug: "programs/edit-program" },
            {
              label: "Levels",
              collapsed: true,
              items: [
                { label: "About Levels", slug: "programs/levels" },
                {
                  label: "Create a Level",
                  slug: "programs/levels/create-level",
                },
                { label: "Edit a Level", slug: "programs/levels/edit-level" },
                {
                  label: "Promote a Member",
                  slug: "programs/levels/promote-member",
                },
                {
                  label: "Promotions Report",
                  slug: "programs/levels/promotions-report",
                },
                {
                  label: "Manage Gradings",
                  slug: "programs/levels/gradings",
                },
              ],
            },
            {
              label: "Classes",
              collapsed: true,
              items: [
                { label: "About Classes", slug: "programs/classes" },
                {
                  label: "Create a Class",
                  slug: "programs/classes/create-class",
                },
                {
                  label: "Create a Class Variant",
                  slug: "programs/classes/create-class-variant",
                },
              ],
            },
          ],
        },
        {
          label: "Schedules",
          collapsed: true,
          items: [
            { label: "Overview", slug: "schedules" },
            { label: "Create a Schedule", slug: "schedules/create-schedule" },
            { label: "Edit a Schedule", slug: "schedules/edit-schedule" },
            {
              label: "Duplicate a Schedule",
              slug: "schedules/duplicate-schedule",
            },
            {
              label: "Activate / Deactivate",
              slug: "schedules/activate-deactivate",
            },
            { label: "Sync a Schedule", slug: "schedules/sync-schedule" },
            { label: "Taking Attendance", slug: "schedules/taking-attendance" },
            {
              label: "Bookings",
              collapsed: true,
              badge: { text: "Pro", variant: "tip" },
              items: [
                { label: "About Session Bookings", slug: "schedules/bookings" },
                {
                  label: "View Session Bookings",
                  slug: "schedules/bookings/view-session-bookings",
                },
                {
                  label: "Add a Booking",
                  slug: "schedules/bookings/add-booking",
                },
                {
                  label: "Cancel a Booking",
                  slug: "schedules/bookings/cancel-booking",
                },
                {
                  label: "Booking Analytics",
                  slug: "schedules/bookings/booking-analytics",
                },
              ],
            },
          ],
        },
        {
          label: "Calendar",
          collapsed: true,
          items: [
            { label: "Overview", slug: "calendar" },
            { label: "Manage Calendars", slug: "calendar/manage-calendars" },
            { label: "Create and Edit Events", slug: "calendar/events" },
            { label: "Set Closed Days", slug: "calendar/closed-days" },
            {
              label: "Share a Calendar Feed",
              slug: "calendar/share-calendar-feed",
            },
          ],
        },
        {
          label: "Billing",
          collapsed: true,
          items: [
            { label: "Overview", slug: "billing" },
            {
              label: "Invoices",
              collapsed: true,
              items: [
                { label: "About Invoices", slug: "billing/invoices" },
                {
                  label: "Create an Invoice",
                  slug: "billing/invoices/create-invoice",
                },
                {
                  label: "Edit an Invoice",
                  slug: "billing/invoices/edit-invoice",
                },
                {
                  label: "Collect a Payment",
                  slug: "billing/invoices/collect-payment",
                },
                {
                  label: "Refund or Void a Payment",
                  slug: "billing/invoices/refunds-and-voids",
                },
                {
                  label: "Receipts and Payment History",
                  slug: "billing/invoices/receipts-and-history",
                },
              ],
            },
            {
              label: "Billing Plans",
              collapsed: true,
              items: [
                { label: "About Billing Plans", slug: "billing/billing-plans" },
                {
                  label: "Create a Plan",
                  slug: "billing/billing-plans/create-plan",
                },
                {
                  label: "Edit a Plan",
                  slug: "billing/billing-plans/edit-plan",
                },
                {
                  label: "Add a Price",
                  slug: "billing/billing-plans/add-price",
                },
                {
                  label: "Edit a Price",
                  slug: "billing/billing-plans/edit-price",
                },
                {
                  label: "Set Program Access",
                  slug: "billing/billing-plans/set-program-access",
                },
              ],
            },
            {
              label: "In-Person Payments",
              collapsed: true,
              items: [
                { label: "About In-Person Payments", slug: "billing/terminal" },
                {
                  label: "Set Up a Card Reader",
                  slug: "billing/terminal/set-up-reader",
                },
                {
                  label: "Take an In-Person Payment",
                  slug: "billing/terminal/take-payment",
                },
              ],
            },
            {
              label: "Payouts",
              collapsed: true,
              items: [
                { label: "About Payouts", slug: "billing/payouts" },
                {
                  label: "View Payout History",
                  slug: "billing/payouts/view-payouts",
                },
                {
                  label: "Update Bank Account",
                  slug: "billing/payouts/update-bank-account",
                },
              ],
            },
            {
              label: "Troubleshooting",
              collapsed: true,
              items: [
                {
                  label: "Failed Payments",
                  slug: "billing/troubleshooting/failed-payments",
                },
                {
                  label: "Disputed Payments",
                  slug: "billing/troubleshooting/disputed-payments",
                },
                {
                  label: "Subscription Not Charging",
                  slug: "billing/troubleshooting/subscription-not-charging",
                },
              ],
            },
          ],
        },
        {
          label: "Messages",
          collapsed: true,
          items: [
            { label: "Overview", slug: "messages" },
            { label: "Send a Message", slug: "messages/send-a-message" },
            {
              label: "Reply & Manage Conversations",
              slug: "messages/reply-and-manage-conversations",
            },
            { label: "Send a Broadcast", slug: "messages/send-a-broadcast" },
            {
              label: "Templates",
              collapsed: true,
              items: [
                { label: "Overview", slug: "messages/templates" },
                {
                  label: "Create a Template",
                  slug: "messages/templates/create-a-template",
                },
                {
                  label: "Build with the Email Builder",
                  slug: "messages/templates/build-with-email-builder",
                },
              ],
            },
            { label: "The Outbox", slug: "messages/outbox" },
            {
              label: "From a Member Profile",
              collapsed: true,
              items: [
                { label: "Member Messages", slug: "members/messages" },
                {
                  label: "Send a Message to a Member",
                  slug: "members/messages/send-message-to-member",
                },
              ],
            },
          ],
        },
        {
          label: "Groups",
          collapsed: true,
          items: [
            { label: "Overview", slug: "groups" },
            { label: "Create a Group", slug: "groups/create-group" },
            {
              label: "Add Members to a Group",
              slug: "groups/add-members-to-group",
            },
            {
              label: "Add a Program to a Group",
              slug: "groups/add-program-to-group",
            },
            {
              label: "Add Members Using a Custom Filter",
              slug: "groups/add-members-by-filter",
            },
            {
              label: "Broadcast to a Group",
              slug: "groups/send-broadcast-to-group",
            },
          ],
        },
        {
          label: "Lead Management",
          collapsed: true,
          badge: { text: "Pro", variant: "tip" },
          items: [
            { label: "Overview", slug: "lead-management" },
            {
              label: "View & Convert Leads",
              slug: "lead-management/view-leads",
            },
            {
              label: "Front-Desk Intake",
              slug: "lead-management/front-desk-intake",
            },
            {
              label: "Automatic Lead Sync from Aquila",
              slug: "lead-management/aquila-lead-sync",
            },
            {
              label: "Lead Page",
              collapsed: true,
              items: [
                {
                  label: "About the Lead Page",
                  slug: "lead-management/lead-page",
                },
                {
                  label: "Enable the Lead Page",
                  slug: "lead-management/lead-page/enable-lead-page",
                },
                {
                  label: "Configure the Lead Page",
                  slug: "lead-management/lead-page/configure-lead-page",
                },
                {
                  label: "Share Your Lead Page",
                  slug: "lead-management/lead-page/share-your-lead-page",
                },
              ],
            },
          ],
        },
        {
          label: "Reports",
          collapsed: true,
          items: [
            { label: "Overview", slug: "reports" },
            { label: "Home Dashboard", slug: "reports/dashboard" },
            {
              label: "Custom Reports",
              collapsed: true,
              items: [
                {
                  label: "About Custom Reports",
                  slug: "reports/custom-reports",
                },
                {
                  label: "Create a Custom Report",
                  slug: "reports/custom-reports/create-report",
                },
                {
                  label: "Build Filters",
                  slug: "reports/custom-reports/filter-builder",
                },
                {
                  label: "Configure Tables",
                  slug: "reports/custom-reports/configure-tables",
                },
                {
                  label: "Configure Charts and Summary Cards",
                  slug: "reports/custom-reports/configure-charts-and-stats",
                },
                {
                  label: "Manage Report Views",
                  slug: "reports/custom-reports/report-views",
                },
                {
                  label: "Share a Report",
                  slug: "reports/custom-reports/share-report",
                },
                {
                  label: "Use Report Actions",
                  slug: "reports/custom-reports/report-actions",
                },
              ],
            },
            {
              label: "KPIs",
              collapsed: true,
              items: [
                { label: "About KPIs", slug: "reports/kpis" },
                { label: "Create a KPI", slug: "reports/kpis/create-kpi" },
                { label: "Set KPI Goals", slug: "reports/kpis/set-goals" },
              ],
            },
            {
              label: "Attendance",
              collapsed: true,
              items: [
                { label: "Attendance", slug: "reports/attendance/attendance" },
                {
                  label: "Historical Attendance",
                  slug: "reports/attendance/historical-attendance",
                },
                { label: "Absentees", slug: "reports/attendance/absentees" },
              ],
            },
            {
              label: "Lead Reports",
              collapsed: true,
              items: [
                { label: "Lead Funnel and Follow-Up", slug: "reports/leads" },
              ],
            },
            {
              label: "Memberships",
              collapsed: true,
              items: [
                {
                  label: "Memberships",
                  slug: "reports/memberships/memberships",
                },
                {
                  label: "Historical Memberships",
                  slug: "reports/memberships/historical-memberships",
                },
                {
                  label: "New Members",
                  slug: "reports/memberships/new-members",
                },
                {
                  label: "Only Memberships",
                  slug: "reports/memberships/only-memberships",
                },
                {
                  label: "Only Subscriptions",
                  slug: "reports/memberships/only-subscriptions",
                },
                { label: "Promotions", slug: "reports/memberships/promotions" },
                {
                  label: "Recent Promotions",
                  slug: "reports/memberships/recent-promotions",
                },
              ],
            },
            {
              label: "Billing",
              collapsed: true,
              items: [
                { label: "Payments", slug: "reports/billing/payments" },
                {
                  label: "Historical Payments",
                  slug: "reports/billing/historical-payments",
                },
                {
                  label: "Active Subscriptions",
                  slug: "reports/billing/active-subscriptions",
                },
                {
                  label: "Failing Subscriptions",
                  slug: "reports/billing/failing-subscriptions",
                },
                {
                  label: "Disputed Payments",
                  slug: "reports/billing/disputed-payments",
                },
                {
                  label: "Subscriptions",
                  slug: "reports/billing/subscriptions",
                },
              ],
            },
            {
              label: "Bookings",
              collapsed: true,
              items: [{ label: "Bookings", slug: "reports/bookings/bookings" }],
            },
            {
              label: "Other",
              collapsed: true,
              items: [
                { label: "Birthdays", slug: "reports/other/birthdays" },
                { label: "Health", slug: "reports/other/health" },
                {
                  label: "Member Record Checks",
                  slug: "reports/other/member-records",
                },
                { label: "Resolve", slug: "reports/other/resolve" },
              ],
            },
          ],
        },
        {
          label: "Gallery",
          collapsed: true,
          items: [
            { label: "Overview", slug: "gallery" },
            { label: "Upload Files", slug: "gallery/upload-files" },
            { label: "Manage Folders", slug: "gallery/manage-folders" },
            { label: "Share with Members", slug: "gallery/share-gallery" },
          ],
        },
        {
          label: "Documents",
          collapsed: true,
          items: [
            { label: "Overview", slug: "documents" },
            { label: "Document Templates", slug: "documents/templates" },
            {
              label: "Upload and Manage Documents",
              slug: "documents/upload-and-manage",
            },
            {
              label: "Request a Signature",
              slug: "documents/request-signature",
            },
            { label: "Waivers", slug: "documents/waivers" },
            { label: "Member Profile Documents", slug: "members/documents" },
          ],
        },
        {
          label: "Shop & Inventory",
          collapsed: true,
          items: [
            { label: "Overview", slug: "shop" },
            { label: "Products and Variants", slug: "shop/products" },
            { label: "Manage Inventory", slug: "shop/inventory" },
            { label: "Suppliers", slug: "shop/suppliers" },
            { label: "Purchase Orders", slug: "shop/purchase-orders" },
            { label: "Fulfil Product Sales", slug: "shop/fulfil-sales" },
            { label: "Process Returns", slug: "shop/returns" },
            { label: "Shop Reports", slug: "shop/reports" },
          ],
        },
        {
          label: "Staff & Shifts",
          collapsed: true,
          items: [
            { label: "Overview", slug: "staff" },
            { label: "Create and Manage Shifts", slug: "staff/manage-shifts" },
            { label: "Offer and Swap Shifts", slug: "staff/shift-swaps" },
            { label: "Clock In and Out", slug: "staff/time-tracking" },
            { label: "Timesheets", slug: "staff/timesheets" },
            { label: "Staff Departments", slug: "staff/departments" },
          ],
        },
        {
          label: "Website",
          collapsed: true,
          items: [
            { label: "Overview", slug: "website" },
            { label: "Set Up Your Website", slug: "website/setup" },
            {
              label: "Pages and Navigation",
              slug: "website/pages-and-navigation",
            },
            { label: "Write a Blog Post", slug: "website/blog" },
            { label: "Publish Your Website", slug: "website/publish" },
          ],
        },
        {
          label: "Kiosk",
          collapsed: true,
          items: [
            { label: "Overview", slug: "kiosk" },
            { label: "Set Up a Kiosk Device", slug: "kiosk/set-up-kiosk" },
            { label: "Member Numbers", slug: "kiosk/member-numbers" },
            { label: "Mobile Check-In", slug: "kiosk/mobile-check-in" },
            { label: "Kiosk Behaviors", slug: "kiosk/kiosk-behaviors" },
            { label: "Manage Member Holds", slug: "kiosk/member-holds" },
          ],
        },
        {
          label: "Member Portal",
          collapsed: true,
          items: [
            { label: "Overview", slug: "member-portal" },
            { label: "Invite a Member", slug: "member-portal/invite-member" },
            {
              label: "View Invoices and Receipts",
              slug: "member-portal/view-and-pay-invoices",
            },
            {
              label: "What Members Can See",
              slug: "member-portal/what-members-can-see",
            },
          ],
        },
        {
          label: "Workflows",
          collapsed: true,
          badge: { text: "Beta", variant: "caution" },
          items: [
            { label: "Overview", slug: "workflows" },
            {
              label: "How Workflows Work",
              slug: "workflows/how-workflows-work",
            },
            {
              label: "Create Your First Workflow",
              slug: "workflows/create-your-first-workflow",
            },
            { label: "Triggers", slug: "workflows/triggers" },
            { label: "Steps", slug: "workflows/steps" },
            {
              label: "Building in the Editor",
              slug: "workflows/building-in-the-editor",
            },
            {
              label: "Publish and Enable",
              slug: "workflows/publish-and-enable",
            },
            { label: "Version History", slug: "workflows/version-history" },
            { label: "Run History", slug: "workflows/run-history" },
            {
              label: "Run a Workflow Manually",
              slug: "workflows/run-manually",
            },
            {
              label: "Reference",
              collapsed: true,
              items: [
                {
                  label: "Available Actions",
                  slug: "workflows/reference/available-actions",
                },
                {
                  label: "Trigger Event Types",
                  slug: "workflows/reference/trigger-events",
                },
              ],
            },
          ],
        },
        {
          label: "Audit Log",
          collapsed: true,
          badge: { text: "Pro", variant: "tip" },
          items: [
            { label: "Overview", slug: "logs" },
            { label: "Reading the Log", slug: "logs/reading-the-log" },
            { label: "Member Audit Log", slug: "logs/member-log" },
          ],
        },
        {
          label: "Settings",
          collapsed: true,
          items: [
            { label: "Overview", slug: "settings" },
            { label: "General", slug: "settings/general" },
            {
              label: "Membership Statuses",
              slug: "settings/membership-statuses",
            },
            { label: "Booking Settings", slug: "settings/booking-settings" },
            { label: "Referral Types", slug: "settings/referral-types" },
            { label: "Account", slug: "settings/account" },
            { label: "Usage", slug: "settings/usage" },
            { label: "Evaluation Forms", slug: "settings/evaluations" },
            { label: "Connected Domains", slug: "settings/domains" },
            { label: "API Keys", slug: "settings/api-keys" },
            { label: "Kiosk Messages", slug: "settings/kiosk-messages" },
            {
              label: "Branding",
              collapsed: true,
              items: [
                { label: "About Branding", slug: "settings/branding" },
                {
                  label: "Brand Colour",
                  slug: "settings/branding/brand-color-logo",
                },
                {
                  label: "Email Address",
                  slug: "settings/branding/email-address",
                },
                {
                  label: "Phone Number (SMS)",
                  slug: "settings/branding/phone-number",
                },
                { label: "Vanity URL", slug: "settings/branding/vanity-url" },
              ],
            },
            {
              label: "Roles & Staff",
              collapsed: true,
              items: [
                { label: "About Roles", slug: "settings/roles" },
                { label: "Create a Role", slug: "settings/roles/create-role" },
                {
                  label: "Invite a Staff Member",
                  slug: "settings/roles/invite-staff",
                },
                {
                  label: "Manage Role Users",
                  slug: "settings/roles/manage-role-users",
                },
              ],
            },
            {
              label: "Behaviors",
              collapsed: true,
              items: [
                { label: "About Behaviors", slug: "settings/behaviors" },
                {
                  label: "General Behaviors",
                  slug: "settings/behaviors/general-behaviors",
                },
                {
                  label: "Kiosk Behaviors",
                  slug: "settings/behaviors/kiosk-behaviors",
                },
                {
                  label: "Subscription Behaviors",
                  slug: "settings/behaviors/subscription-behaviors",
                },
              ],
            },
          ],
        },
        {
          label: "Troubleshooting",
          collapsed: true,
          items: [
            {
              label: "Member Can't Check In",
              slug: "troubleshooting/member-cant-check-in",
            },
            { label: "Payment Failed", slug: "troubleshooting/payment-failed" },
            {
              label: "Member Missing from List",
              slug: "troubleshooting/member-missing-from-list",
            },
            {
              label: "Schedule Not Showing",
              slug: "troubleshooting/schedule-not-showing",
            },
            {
              label: "Can't Invite Staff",
              slug: "troubleshooting/cant-invite-staff",
            },
          ],
        },
        {
          label: "Reference",
          collapsed: true,
          items: [
            { label: "Glossary", slug: "reference/glossary" },
            { label: "Plans & Pricing", slug: "reference/plans" },
            { label: "Permissions", slug: "reference/permissions" },
            {
              label: "Billing Plan Fields",
              slug: "reference/billing-plan-fields",
            },
            { label: "Member Fields", slug: "reference/member-fields" },
            { label: "Schedule Fields", slug: "reference/schedule-fields" },
            {
              label: "Message Placeholders",
              slug: "reference/message-placeholders",
            },
            { label: "Report Index", slug: "reference/report-index" },
          ],
        },
      ],
      customCss: ["./src/styles/global.css"],
      editLink: {
        baseUrl: "https://github.com/kanrimemberships/docs/edit/master/",
      },
    }),
    icon({
      include: {
        tabler: [
          "book-2",
          "rocket",
          "users",
          "tournament",
          "calendar-event",
          "calendar",
          "credit-card",
          "building-store",
          "file-description",
          "clock",
          "mail",
          "chart-bar",
          "device-desktop",
          "user-plus",
          "settings",
          "layout-grid",
          "photo",
          "world",
          "door-enter",
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
});
