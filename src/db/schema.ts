import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Admins — only row(s) allowed into /admin. Email + bcrypt + TOTP 2FA */
/* ------------------------------------------------------------------ */
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  totpSecret: text("totp_secret").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* Short-lived admin session tokens (30 min default, sliding off) */
export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => admins.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  ip: text("ip"),
  userAgent: text("user_agent"),
});

/* ------------------------------------------------------------------ */
/* Campaigns — public fundraiser pages. Public pages expose ONLY       */
/* aggregate totals; donor data never leaves the admin surface.        */
/* ------------------------------------------------------------------ */
export const campaigns = pgTable(
  "campaigns",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    targetKes: integer("target_kes").notNull(),
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    rejectReason: text("reject_reason"),
    ownerName: text("owner_name").notNull(),
    ownerEmail: text("owner_email").notNull(),
    ownerPhone: text("owner_phone"),
    image: text("image").notNull().default("/images/facility.jpg"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
  },
  (t) => [index("campaigns_status_idx").on(t.status)],
);

/* ------------------------------------------------------------------ */
/* Donations — stored in KES (source of truth) + original currency +   */
/* the exact rate used at payment time.                                */
/* ------------------------------------------------------------------ */
export const donations = pgTable(
  "donations",
  {
    id: serial("id").primaryKey(),
    receiptCode: text("receipt_code").notNull().unique(),
    campaignId: integer("campaign_id").references(() => campaigns.id),
    donorName: text("donor_name").notNull(),
    donorEmail: text("donor_email"),
    donorPhone: text("donor_phone"),
    amountOriginal: numeric("amount_original", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("KES"),
    amountKes: integer("amount_kes").notNull(),
    /** KES per 1 unit of the original currency, snapshotted at payment time */
    rateUsed: numeric("rate_used", { precision: 12, scale: 6 }).notNull(),
    method: text("method").notNull(), // mpesa | airtel | bank | card
    /** pending | bank_pending | confirmed | failed | rejected */
    status: text("status").notNull().default("pending"),
    providerRef: text("provider_ref"),
    transferRef: text("transfer_ref"),
    message: text("message"),
    proofPath: text("proof_path"),
    thankYouNote: text("thank_you_note"),
    thankYouSentAt: timestamp("thank_you_sent_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("donations_status_idx").on(t.status),
    index("donations_campaign_idx").on(t.campaignId),
  ],
);

/* Payment audit trail — every provider event (init / callback / confirm) */
export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    donationId: integer("donation_id")
      .notNull()
      .references(() => donations.id),
    provider: text("provider").notNull(), // daraja | airtel | flutterwave | bank | admin
    event: text("event").notNull(), // init | callback | confirmed | failed | admin_verify
    status: text("status").notNull(),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("transactions_donation_idx").on(t.donationId)],
);

/* General contact form inbox */
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
