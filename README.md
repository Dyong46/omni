# OmniSale

OmniSale is an internal omnichannel sales management platform. The project consists of a Nuxt 4 admin dashboard and a NestJS REST API backed by MySQL.

## Overview

- Manage products, categories, customers, and orders
- Support multiple sales channels: offline, TikTok Shop, and Shopee
- Provide an internal dashboard for admins and staff
- Upload product images to the local server
- Track shipments, draft orders, and basic business metrics

## Tech Stack

- Frontend: Nuxt 4, Vue 3, TypeScript, Pinia, Nuxt UI, Tailwind CSS
- Backend: NestJS, TypeORM, MySQL 8, JWT, Swagger
- Local infrastructure: Docker Compose for MySQL

## Directory Structure

```text
.
|- client/     # Nuxt 4 admin dashboard
|- server/     # NestJS API
|- script.sql  # Database schema and seed data
```

## Core Features

- JWT-based authentication
- CRUD for products, categories, customers, and orders
- Shipment management and shipment dashboard
- Draft order workflow
- TikTok Shop mock order ingestion for channel testing
- Stripe Checkout payment flow for order payment confirmation
- Media upload stored on the local server
- Swagger API documentation

## Requirements

- Node.js 20+
- npm or bun
- Docker Desktop or Docker Engine
- MySQL 8 if you do not use Docker

## Quick Start

### 1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure the frontend

Use [client/.env.example](client/.env.example) as a reference. Minimum configuration:

```env
NUXT_PUBLIC_API_BASE=http://localhost:4000/api
NUXT_PUBLIC_APP_NAME=OmniSale
```

### 3. Configure the backend

Create `server/.env` with at least the following values:

```env
PORT=4000
APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=omni_sales
DB_SYNCHRONIZE=true

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=15
MAX_FILE_SIZE=5242880
UPLOAD_LOCATION=./uploads
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Start MySQL

```bash
cd server
docker compose up -d
```

By default, the container creates the `omni_sales` database and uses `123456` as the root password.

### 5. Import schema and seed data

```bash
mysql -u root -p omni_sales < script.sql
```

If you use the default Docker password, enter `123456` when prompted.

### 6. Run the backend

```bash
cd server
npm run start:dev
```

The backend runs at `http://localhost:4000`.

### 7. Run the frontend

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Important URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`
- Swagger docs: `http://localhost:4000/api/docs`
- TikTok mock webhook endpoint: `http://localhost:4000/api/tiktok/webhook`
- TikTok mock order generator: `http://localhost:4000/api/tiktok/mock/generate`
- Stripe webhook endpoint: `http://localhost:4000/api/payment/webhook`
- Uploaded files: `http://localhost:4000/uploads/...`

## TikTok Shop Integration

The project currently includes a mock TikTok Shop integration for testing the omnichannel order flow.

### Available endpoints

- `POST /api/tiktok/webhook`: accepts a TikTok Shop-style webhook payload and creates an order with `channel=tiktok`
- `POST /api/tiktok/mock/generate`: creates a random mock TikTok order using real products from the database

### Current behavior

1. A TikTok-style payload is sent to the webhook endpoint.
2. The backend maps the payload into the internal order structure.
3. The order is created with `channel=tiktok`.
4. Inventory is validated and reduced using the normal order creation flow.
5. TikTok orders appear in the shared orders, shipments, and dashboard views.

### Notes

- This is a mock/testing integration, not a full production TikTok Shop app integration
- The current webhook endpoint does not implement TikTok signature verification
- The mock generator is useful for seeding demo data for the TikTok sales channel
- TikTok orders are currently created as normal orders with `status=new`

## Stripe Payment

Stripe payment is already integrated into the order flow.

### Available endpoints

- `POST /api/payment/checkout`: creates a Stripe Checkout session for an order
- `GET /api/payment/session-status/:sessionId`: checks the payment status of a Stripe Checkout session
- `POST /api/payment/webhook`: receives Stripe webhook events and marks orders as paid

### Current payment flow

1. A new order is created from the admin dashboard.
2. The backend creates a Stripe Checkout session for payable orders.
3. The frontend receives `checkoutUrl` and `sessionId`.
4. The order page shows a QR/payment link and polls the session status.
5. Once Stripe marks the session as paid, the backend updates the order `paymentStatus` to `paid`.

### Stripe environment variables

- `STRIPE_SECRET_KEY`: Stripe secret key used to create checkout sessions
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret used to verify webhook events

### Local webhook setup

If you want to test Stripe webhooks locally, run the Stripe CLI and forward events to the backend:

```bash
stripe listen --forward-to localhost:4000/api/payment/webhook
```

Then copy the generated webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `server/.env`.

### Payment status behavior

- Orders start with `paymentStatus=unpaid` by default unless the channel logic overrides it
- A successful Stripe payment updates the order to `paymentStatus=paid`
- Draft orders are saved without triggering Stripe checkout

## Development Workflow

### Frontend

```bash
cd client
npm run dev
npm run build
npm run lint
```

### Backend

```bash
cd server
npm run start:dev
npm run build
npm run test
npm run lint
```

## Project Notes

- The frontend calls the backend through `NUXT_PUBLIC_API_BASE`
- Swagger is enabled by default in the backend
- Media uploads are currently stored in `server/uploads/`
- Draft orders do not reduce inventory until they are confirmed
- TikTok Shop is currently supported through a mock webhook and test order generator
- Stripe Checkout is used for payment session creation and status tracking
- Shipments and orders currently share the `orders` table, using `status` to drive the workflow

## Current Seed Data

The [script.sql](script.sql) file currently includes:

- 15 categories
- 100 products
- 50 customers

You can extend it further with orders, order items, and app config records if you need a richer demo dataset.