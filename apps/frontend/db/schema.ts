import { pgTable, serial, text, timestamp, boolean, jsonb, integer, decimal } from "drizzle-orm/pg-core";

// Users & Auth (Better Auth Schema)
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    role: text("role").default("user"), // Custom field for RBAC
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

// Hotlines
export const hotlines = pgTable("hotlines", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    numbers: text("numbers").array(), // Store as array of strings
    category: text("category").notNull(),
    description: text("description"),
    color: text("color"),
    links: jsonb("links"), // Store social links as JSON
    isPopular: boolean("is_popular").default(false),
    displayOrder: integer("display_order").default(0), // Order for sorting (lower = higher priority)
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Shelters
export const shelters = pgTable("shelters", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    location: text("location").notNull(),
    status: text("status").notNull(), // 'open', 'full', 'closed'
    contacts: jsonb("contacts"), // Array of { name, phone }
    area: text("area"),
    icon: text("icon"),
    link: text("link"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Donation Channels
export const donations = pgTable("donations", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    bankName: text("bank_name"),
    accountNumber: text("account_number"),
    accountName: text("account_name"),
    description: text("description"),
    qrCodeUrl: text("qr_code_url"),
    contacts: jsonb("contacts"),
    donationPoints: text("donation_points").array(),
    acceptsMoney: boolean("accepts_money").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// External Links
export const externalLinks = pgTable("external_links", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    category: text("category"),
    icon: text("icon"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Rescue Cases (Migrated from SQL)
export const cases = pgTable("cases", {
    id: serial("id").primaryKey(),
    source: text("source").notNull(),
    sourceUrl: text("source_url"),
    rawContent: text("raw_content").notNull(),
    extractedPhones: text("extracted_phones").array(),
    extractedLocation: text("extracted_location"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    extractedName: text("extracted_name"),
    description: text("description"),
    urgencyLevel: text("urgency_level").default("medium"),
    status: text("status").default("pending"),
    assignedTo: text("assigned_to"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
