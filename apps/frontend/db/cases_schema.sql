-- Rescue Cases Table
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,              -- 'facebook', 'twitter', 'line', 'manual'
  source_url TEXT,                   -- Link to original post
  raw_content TEXT NOT NULL,         -- Original pasted content
  
  -- Extracted Information
  extracted_phones TEXT[],           -- Array of phone numbers
  extracted_location TEXT,           -- Location name (e.g., "หาดใหญ่, สงขลา")
  latitude DECIMAL(10, 8),           -- Latitude coordinate
  longitude DECIMAL(11, 8),          -- Longitude coordinate
  extracted_name TEXT,               -- Person name
  description TEXT,                  -- Detailed description (e.g., "มีเด็ก 10 คน ติดบนหลังคา")
  
  -- Case Management
  urgency_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'pending',       -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  assigned_to TEXT,                    -- Rescue team assigned
  notes TEXT,                          -- Internal notes
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_urgency ON cases(urgency_level);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_location ON cases(extracted_location);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
