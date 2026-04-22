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
        Banner: "./src/components/Banner.astro",
      },
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Introduction", slug: "introduction" },
            { label: "How It All Fits Together", slug: "how-it-all-fits-together" },
          ],
        },
        {
          label: "Getting Started",
          collapsed: true,
          items: [
            { label: "Overview", slug: "getting-started" },
            { label: "Create Your School", slug: "getting-started/create-your-school" },
            { label: "Initial Settings", slug: "getting-started/initial-settings" },
            { label: "Create Your First Program", slug: "getting-started/create-your-first-program" },
            { label: "Create Your First Schedule", slug: "getting-started/create-your-first-schedule" },
            { label: "Add Your First Member", slug: "getting-started/add-your-first-member" },
            { label: "Set Up Billing", slug: "getting-started/set-up-billing" },
            { label: "Invite Your Team", slug: "getting-started/invite-your-team" },
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
            { label: "Merge Duplicate Members", slug: "members/merge-duplicate-members" },
            { label: "Invite to Member Portal", slug: "members/invite-member-portal" },
            { label: "Assign Member Number", slug: "members/assign-member-number" },
            { label: "Notes", slug: "members/notes" },
            { label: "Interactions", slug: "members/interactions" },
            {
              label: "Contacts",
              collapsed: true,
              items: [
                { label: "About Contacts", slug: "members/contacts" },
                { label: "Add a Contact", slug: "members/contacts/add-contact" },
                { label: "Set Billing Contact", slug: "members/contacts/set-billing-contact" },
              ],
            },
            {
              label: "Memberships",
              collapsed: true,
              items: [
                { label: "About Memberships", slug: "members/memberships" },
                { label: "Assign a Membership", slug: "members/memberships/assign-membership" },
                { label: "Change Status", slug: "members/memberships/change-status" },
                { label: "Promote a Level", slug: "members/memberships/promote-level" },
                { label: "End a Membership", slug: "members/memberships/end-membership" },
              ],
            },
            {
              label: "Subscriptions",
              collapsed: true,
              items: [
                { label: "About Subscriptions", slug: "members/subscriptions" },
                { label: "Add a Payment Method", slug: "members/subscriptions/add-payment-method" },
                { label: "Create a Subscription", slug: "members/subscriptions/create-subscription" },
                { label: "Edit a Subscription", slug: "members/subscriptions/edit-subscription" },
                { label: "Extend a Subscription", slug: "members/subscriptions/extend-subscription" },
                { label: "Cancel a Subscription", slug: "members/subscriptions/cancel-subscription" },
                { label: "Retry a Failed Payment", slug: "members/subscriptions/retry-failed-payment" },
                { label: "View Payment History", slug: "members/subscriptions/view-payment-history" },
              ],
            },
            {
              label: "Attendance",
              collapsed: true,
              items: [
                { label: "About Attendance", slug: "members/attendance" },
                { label: "View Attendance History", slug: "members/attendance/view-member-attendance" },
                { label: "Add Attendance Manually", slug: "members/attendance/add-attendance-manually" },
                { label: "Delete an Attendance Record", slug: "members/attendance/delete-attendance" },
              ],
            },
            {
              label: "Bookings",
              collapsed: true,
              badge: { text: "Pro", variant: "tip" },
              items: [
                { label: "About Bookings", slug: "members/bookings" },
                { label: "Book into a Class", slug: "members/bookings/book-member-into-class" },
                { label: "Cancel a Booking", slug: "members/bookings/cancel-booking" },
                { label: "Mark Attended / No-Show", slug: "members/bookings/mark-attended-no-show" },
              ],
            },
            {
              label: "Gallery",
              collapsed: true,
              items: [
                { label: "About Member Gallery", slug: "members/gallery" },
                { label: "Upload Files", slug: "members/gallery/upload-files" },
                { label: "Manage Folders", slug: "members/gallery/manage-folders" },
              ],
            },
            {
              label: "Messages",
              collapsed: true,
              items: [
                { label: "Message History", slug: "members/messages" },
                { label: "Send a Message", slug: "members/messages/send-message-to-member" },
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
                { label: "Create a Level", slug: "programs/levels/create-level" },
                { label: "Edit a Level", slug: "programs/levels/edit-level" },
                { label: "Promote a Member", slug: "programs/levels/promote-member" },
                { label: "Promotions Report", slug: "programs/levels/promotions-report" },
              ],
            },
            {
              label: "Classes",
              collapsed: true,
              items: [
                { label: "About Classes", slug: "programs/classes" },
                { label: "Create a Class", slug: "programs/classes/create-class" },
                { label: "Create a Class Variant", slug: "programs/classes/create-class-variant" },
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
            { label: "Duplicate a Schedule", slug: "schedules/duplicate-schedule" },
            { label: "Activate / Deactivate", slug: "schedules/activate-deactivate" },
            { label: "Sync a Schedule", slug: "schedules/sync-schedule" },
            { label: "Taking Attendance", slug: "schedules/taking-attendance" },
            {
              label: "Bookings",
              collapsed: true,
              badge: { text: "Pro", variant: "tip" },
              items: [
                { label: "About Session Bookings", slug: "schedules/bookings" },
                { label: "View Session Bookings", slug: "schedules/bookings/view-session-bookings" },
                { label: "Add a Booking", slug: "schedules/bookings/add-booking" },
                { label: "Cancel a Booking", slug: "schedules/bookings/cancel-booking" },
                { label: "Booking Analytics", slug: "schedules/bookings/booking-analytics" },
              ],
            },
          ],
        },
        {
          label: "Billing",
          collapsed: true,
          items: [
            { label: "Overview", slug: "billing" },
            {
              label: "Billing Plans",
              collapsed: true,
              items: [
                { label: "About Billing Plans", slug: "billing/billing-plans" },
                { label: "Create a Plan", slug: "billing/billing-plans/create-plan" },
                { label: "Edit a Plan", slug: "billing/billing-plans/edit-plan" },
                { label: "Add a Price", slug: "billing/billing-plans/add-price" },
                { label: "Edit a Price", slug: "billing/billing-plans/edit-price" },
                { label: "Set Program Access", slug: "billing/billing-plans/set-program-access" },
              ],
            },
            {
              label: "Payouts",
              collapsed: true,
              items: [
                { label: "About Payouts", slug: "billing/payouts" },
                { label: "View Payout History", slug: "billing/payouts/view-payouts" },
                { label: "Update Bank Account", slug: "billing/payouts/update-bank-account" },
              ],
            },
            {
              label: "Troubleshooting",
              collapsed: true,
              items: [
                { label: "Failed Payments", slug: "billing/troubleshooting/failed-payments" },
                { label: "Disputed Payments", slug: "billing/troubleshooting/disputed-payments" },
                { label: "Subscription Not Charging", slug: "billing/troubleshooting/subscription-not-charging" },
              ],
            },
          ],
        },
        {
          label: "Messages",
          collapsed: true,
          items: [
            { label: "Overview", slug: "messages" },
            { label: "Send a Broadcast", slug: "messages/send-broadcast" },
            { label: "Send to One Member", slug: "messages/send-to-member" },
            { label: "Using Templates", slug: "messages/using-templates" },
            { label: "View Message History", slug: "messages/view-message-history" },
          ],
        },
        {
          label: "Groups",
          collapsed: true,
          items: [
            { label: "Overview", slug: "groups" },
            { label: "Create a Group", slug: "groups/create-group" },
            { label: "Add Members to a Group", slug: "groups/add-members-to-group" },
            { label: "Add a Program to a Group", slug: "groups/add-program-to-group" },
            { label: "Broadcast to a Group", slug: "groups/send-broadcast-to-group" },
          ],
        },
        {
          label: "Lead Management",
          collapsed: true,
          badge: { text: "Pro", variant: "tip" },
          items: [
            { label: "Overview", slug: "lead-management" },
            { label: "View & Convert Leads", slug: "lead-management/view-leads" },
            {
              label: "Lead Page",
              collapsed: true,
              items: [
                { label: "About the Lead Page", slug: "lead-management/lead-page" },
                { label: "Enable the Lead Page", slug: "lead-management/lead-page/enable-lead-page" },
                { label: "Configure the Lead Page", slug: "lead-management/lead-page/configure-lead-page" },
                { label: "Share Your Lead Page", slug: "lead-management/lead-page/share-your-lead-page" },
              ],
            },
          ],
        },
        {
          label: "Reports",
          collapsed: true,
          items: [
            { label: "Overview", slug: "reports" },
            {
              label: "Attendance",
              collapsed: true,
              items: [
                { label: "Attendance", slug: "reports/attendance/attendance" },
                { label: "Historical Attendance", slug: "reports/attendance/historical-attendance" },
                { label: "Absentees", slug: "reports/attendance/absentees" },
              ],
            },
            {
              label: "Memberships",
              collapsed: true,
              items: [
                { label: "Memberships", slug: "reports/memberships/memberships" },
                { label: "Historical Memberships", slug: "reports/memberships/historical-memberships" },
                { label: "Only Memberships", slug: "reports/memberships/only-memberships" },
                { label: "Only Subscriptions", slug: "reports/memberships/only-subscriptions" },
                { label: "Promotions", slug: "reports/memberships/promotions" },
              ],
            },
            {
              label: "Billing",
              collapsed: true,
              items: [
                { label: "Payments", slug: "reports/billing/payments" },
                { label: "Historical Payments", slug: "reports/billing/historical-payments" },
                { label: "Active Subscriptions", slug: "reports/billing/active-subscriptions" },
                { label: "Failing Subscriptions", slug: "reports/billing/failing-subscriptions" },
                { label: "Disputed Payments", slug: "reports/billing/disputed-payments" },
                { label: "Subscriptions", slug: "reports/billing/subscriptions" },
              ],
            },
            {
              label: "Bookings",
              collapsed: true,
              items: [
                { label: "Bookings", slug: "reports/bookings/bookings" },
              ],
            },
            {
              label: "Other",
              collapsed: true,
              items: [
                { label: "Birthdays", slug: "reports/other/birthdays" },
                { label: "Health", slug: "reports/other/health" },
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
          label: "Kiosk",
          collapsed: true,
          items: [
            { label: "Overview", slug: "kiosk" },
            { label: "Set Up a Kiosk Device", slug: "kiosk/set-up-kiosk" },
            { label: "Member Numbers", slug: "kiosk/member-numbers" },
            { label: "Kiosk Behaviors", slug: "kiosk/kiosk-behaviors" },
          ],
        },
        {
          label: "Member Portal",
          collapsed: true,
          items: [
            { label: "Overview", slug: "member-portal" },
            { label: "Invite a Member", slug: "member-portal/invite-member" },
            { label: "What Members Can See", slug: "member-portal/what-members-can-see" },
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
            { label: "Membership Statuses", slug: "settings/membership-statuses" },
            { label: "Booking Settings", slug: "settings/booking-settings" },
            { label: "Referral Types", slug: "settings/referral-types" },
            { label: "Account", slug: "settings/account" },
            { label: "Usage", slug: "settings/usage" },
            {
              label: "Branding",
              collapsed: true,
              items: [
                { label: "About Branding", slug: "settings/branding" },
                { label: "Brand Colour", slug: "settings/branding/brand-color-logo" },
                { label: "Email Address", slug: "settings/branding/email-address" },
                { label: "Phone Number (SMS)", slug: "settings/branding/phone-number" },
                { label: "Vanity URL", slug: "settings/branding/vanity-url" },
              ],
            },
            {
              label: "Roles & Staff",
              collapsed: true,
              items: [
                { label: "About Roles", slug: "settings/roles" },
                { label: "Create a Role", slug: "settings/roles/create-role" },
                { label: "Invite a Staff Member", slug: "settings/roles/invite-staff" },
                { label: "Manage Role Users", slug: "settings/roles/manage-role-users" },
              ],
            },
            {
              label: "Behaviors",
              collapsed: true,
              items: [
                { label: "About Behaviors", slug: "settings/behaviors" },
                { label: "General Behaviors", slug: "settings/behaviors/general-behaviors" },
                { label: "Kiosk Behaviors", slug: "settings/behaviors/kiosk-behaviors" },
                { label: "Subscription Behaviors", slug: "settings/behaviors/subscription-behaviors" },
              ],
            },
            {
              label: "Templates",
              collapsed: true,
              items: [
                { label: "About Templates", slug: "settings/templates" },
                { label: "Create a Template", slug: "settings/templates/create-template" },
              ],
            },
          ],
        },
        {
          label: "Troubleshooting",
          collapsed: true,
          items: [
            { label: "Member Can't Check In", slug: "troubleshooting/member-cant-check-in" },
            { label: "Payment Failed", slug: "troubleshooting/payment-failed" },
            { label: "Member Missing from List", slug: "troubleshooting/member-missing-from-list" },
            { label: "Schedule Not Showing", slug: "troubleshooting/schedule-not-showing" },
            { label: "Can't Invite Staff", slug: "troubleshooting/cant-invite-staff" },
          ],
        },
        {
          label: "Reference",
          collapsed: true,
          items: [
            { label: "Glossary", slug: "reference/glossary" },
            { label: "Plans & Pricing", slug: "reference/plans" },
            { label: "Permissions", slug: "reference/permissions" },
            { label: "Billing Plan Fields", slug: "reference/billing-plan-fields" },
            { label: "Member Fields", slug: "reference/member-fields" },
            { label: "Schedule Fields", slug: "reference/schedule-fields" },
            { label: "Report Index", slug: "reference/report-index" },
          ],
        },
      ],
      customCss: ["./src/styles/global.css"],
      editLink: {
        baseUrl: "https://github.com/kanrimemberships/docs/edit/master/",
      },
    }),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
});
