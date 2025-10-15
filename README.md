# 🏥 HealthSync — Full-Stack Healthcare Management System

**HealthSync** is a modern, full-stack healthcare management platform built with **React + Vite + Supabase**.  
It streamlines patient management, appointment scheduling, billing, and analytics — all in one place.

---

## Features

- **Patient Records** – Add, edit, and manage patient details with contact info and medical history.  
- **Appointments** – Schedule, update, or cancel visits with live status tracking.  
- **Billing System** – Track pending, paid, and overdue invoices for every patient.  
- **Analytics Dashboard** – Real-time charts for appointment trends, revenue breakdowns, and no-show insights.  
- **Smart No-Show Prediction** – Uses an in-app TypeScript algorithm to estimate appointment no-show probability based on past behavior and scheduling patterns.

---

## Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Analytics | TypeScript-based risk scoring model |
| Icons/UI | Lucide React + ShadCN UI components |

---

## Setup Instructions

Follow these steps to run the **HealthSync** app locally.

---

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or newer) — [Download here](https://nodejs.org/)
- **npm** (comes with Node) or **yarn**
- A **Supabase account** (free) — [https://supabase.com](https://supabase.com)

---

### Clone the Repository
git clone https://github.com/yourusername/healthsync.git

### Create Supabase Project 
Copy sql file into new Supabase project 

### Copy Env Variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co 
VITE_SUPABASE_ANON_KEY=your_anon_key

### Start the App
npm run dev
