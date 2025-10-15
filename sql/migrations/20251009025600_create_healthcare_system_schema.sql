/*
  # Healthcare Management System Database Schema

  ## Overview
  This migration creates a comprehensive healthcare management system with support for:
  - Patient records management
  - Appointment scheduling and tracking
  - Billing and payment processing
  - Analytics for no-show prediction

  ## New Tables

  ### 1. patients
  Stores patient demographic and contact information
  - `id` (uuid, primary key) - Unique patient identifier
  - `first_name` (text) - Patient's first name
  - `last_name` (text) - Patient's last name
  - `email` (text, unique) - Contact email
  - `phone` (text) - Contact phone number
  - `date_of_birth` (date) - Patient's date of birth
  - `address` (text) - Residential address
  - `medical_history` (text) - Medical history notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. appointments
  Manages appointment scheduling and status tracking
  - `id` (uuid, primary key) - Unique appointment identifier
  - `patient_id` (uuid, foreign key) - References patients table
  - `appointment_date` (timestamptz) - Scheduled date and time
  - `duration_minutes` (integer) - Appointment duration
  - `appointment_type` (text) - Type of appointment (checkup, consultation, etc.)
  - `status` (text) - Current status (scheduled, completed, cancelled, no-show)
  - `notes` (text) - Appointment notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. billing
  Tracks billing records and payment status
  - `id` (uuid, primary key) - Unique billing identifier
  - `patient_id` (uuid, foreign key) - References patients table
  - `appointment_id` (uuid, foreign key, nullable) - Optional reference to appointment
  - `amount` (decimal) - Billed amount
  - `description` (text) - Billing description
  - `status` (text) - Payment status (pending, paid, overdue)
  - `due_date` (date) - Payment due date
  - `paid_date` (date, nullable) - Actual payment date
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Policies allow public access for demo purposes
  - Production systems should implement proper authentication

  ## Indexes
  - Foreign key indexes for efficient joins
  - Status and date indexes for common queries

  ## Important Notes
  1. All tables use UUID primary keys for scalability
  2. Timestamps use timestamptz for timezone awareness
  3. Constraints ensure data integrity
  4. RLS policies are permissive for demo - restrict in production
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  date_of_birth date NOT NULL,
  address text DEFAULT '',
  medical_history text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  appointment_type text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show'))
);

-- Create billing table
CREATE TABLE IF NOT EXISTS billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  amount decimal(10, 2) NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  due_date date NOT NULL,
  paid_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_billing_status CHECK (status IN ('pending', 'paid', 'overdue'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_billing_patient_id ON billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_appointment_id ON billing(appointment_id);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients (permissive for demo)
CREATE POLICY "Allow public read access to patients"
  ON patients FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to patients"
  ON patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to patients"
  ON patients FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to patients"
  ON patients FOR DELETE
  USING (true);

-- RLS Policies for appointments
CREATE POLICY "Allow public read access to appointments"
  ON appointments FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to appointments"
  ON appointments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to appointments"
  ON appointments FOR DELETE
  USING (true);

-- RLS Policies for billing
CREATE POLICY "Allow public read access to billing"
  ON billing FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to billing"
  ON billing FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to billing"
  ON billing FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to billing"
  ON billing FOR DELETE
  USING (true);

-- Insert sample data for demonstration
INSERT INTO patients (id, first_name, last_name, email, phone, date_of_birth, address, medical_history)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(555) 123-4567', '1985-03-15', '123 Main St, Springfield, IL', 'No known allergies. Previous surgery in 2019.'),
  ('00000000-0000-0000-0000-000000000002', 'Michael', 'Chen', 'michael.chen@email.com', '(555) 234-5678', '1992-07-22', '456 Oak Ave, Springfield, IL', 'Asthma, uses inhaler as needed.'),
  ('00000000-0000-0000-0000-000000000003', 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '(555) 345-6789', '1978-11-08', '789 Pine Rd, Springfield, IL', 'Diabetes Type 2, on medication.')
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (patient_id, appointment_date, duration_minutes, appointment_type, status, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000001', now() + interval '1 day', 30, 'Annual Checkup', 'scheduled', 'Regular annual physical examination'),
  ('00000000-0000-0000-0000-000000000002', now() - interval '2 days', 45, 'Follow-up', 'completed', 'Asthma follow-up, medication working well'),
  ('00000000-0000-0000-0000-000000000003', now() - interval '1 day', 30, 'Consultation', 'no-show', 'Patient did not show up'),
  ('00000000-0000-0000-0000-000000000001', now() + interval '3 days', 60, 'Consultation', 'scheduled', 'Discuss lab results')
ON CONFLICT DO NOTHING;

-- Insert sample billing
INSERT INTO billing (patient_id, appointment_id, amount, description, status, due_date, paid_date)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM appointments WHERE patient_id = '00000000-0000-0000-0000-000000000001' AND status = 'scheduled' LIMIT 1),
  150.00,
  'Annual Physical Examination',
  'pending',
  now() + interval '30 days',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM billing WHERE patient_id = '00000000-0000-0000-0000-000000000001' AND description = 'Annual Physical Examination');

INSERT INTO billing (patient_id, appointment_id, amount, description, status, due_date, paid_date)
SELECT
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM appointments WHERE patient_id = '00000000-0000-0000-0000-000000000002' AND status = 'completed' LIMIT 1),
  100.00,
  'Follow-up Consultation',
  'paid',
  now() - interval '1 day',
  now() - interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM billing WHERE patient_id = '00000000-0000-0000-0000-000000000002' AND description = 'Follow-up Consultation');

INSERT INTO billing (patient_id, appointment_id, amount, description, status, due_date, paid_date)
SELECT
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM appointments WHERE patient_id = '00000000-0000-0000-0000-000000000003' AND status = 'no-show' LIMIT 1),
  125.00,
  'Consultation',
  'overdue',
  now() - interval '7 days',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM billing WHERE patient_id = '00000000-0000-0000-0000-000000000003' AND description = 'Consultation');