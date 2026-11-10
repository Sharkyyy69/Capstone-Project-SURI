# SURI: An AI-Assisted Image-Based Web Application for the Assessment of Visible Freshness in Selected Fruits and Meat

SURI is an AI-assisted web application designed to help market consumers assess the visible freshness of selected fruits and meat products before purchase. The application uses image-based analysis to classify products, estimate freshness, and provide a recommendation based on visible quality cues.

## System Overview

- Fruit categories: Fresh, Overripe, Spoiled
- Meat categories: Fresh, Questionable, Spoiled
- Features: image upload, assessment history, user authentication, dashboard, export support
- Scope: decision support only; not a replacement for laboratory testing or official food safety inspection

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zustand
- Zod
- Axios
- ESLint

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcryptjs
- multer
- nodemailer
- helmet
- cors
- dotenv

### Data & Export
- SheetJS (xlsx)
- jsPDF

### Dev & Testing
- Node test runner
- nodemon

## Project Structure

- src/ – frontend application
- server/ – Express API and middleware
- prisma/ – Prisma schema, migrations, and seed files
- uploads/ – uploaded assessment images

## Setup

1. Copy `.env.example` to `.env` and configure your PostgreSQL and mail settings.
2. In the first terminal, install the frontend dependencies from the project root and start the client:
   npm install
   npm run dev
3. In a second terminal, generate the Prisma client and start the API from the server folder:
   cd server
   npx prisma generate
   npm run dev

If you want to run both together from the project root for development, use:
   npm run dev:all

## Notes

This repo includes the main project scaffold for the SURI system, including a frontend app shell, Express API, Prisma data model, and migration setup.
