import { pgTable, serial, text, timestamp, boolean, jsonb, integer, decimal } from "drizzle-orm/pg-core";

// Users & Auth
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    role: text("role").default("user"), // 'admin', 'staff', 'user'
    createdAt: timestamp("created_at").defaultNow(),
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
    createdAt: timestamp("created_at").defaultNow(),
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
