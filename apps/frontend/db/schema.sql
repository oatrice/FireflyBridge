-- Rescue Contacts Table
CREATE TABLE IF NOT EXISTS rescue_contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  area TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_rescue_contacts_phone ON rescue_contacts(phone);
