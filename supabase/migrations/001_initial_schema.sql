-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('EXPORT', 'IMPORT')),
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  invoiced_weight NUMERIC(10, 2) NOT NULL,
  invoiced_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_company_id ON shipments(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_shipment_id ON invoices(shipment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since auth is not required)
CREATE POLICY "Allow public read access on companies" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access on companies" ON companies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on companies" ON companies
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on shipments" ON shipments
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access on shipments" ON shipments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on shipments" ON shipments
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on invoices" ON invoices
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access on invoices" ON invoices
  FOR INSERT WITH CHECK (true);

