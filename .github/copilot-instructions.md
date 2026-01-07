# OmniSale - AI Coding Agent Instructions

## Project Overview

OmniSale is an **omnichannel sales management platform** with a **Nuxt 4** admin dashboard frontend and a **NestJS** backend API.

The system is designed for **internal business operations**, allowing admins and staff to manage:
- Products and categories
- Customers (offline/internal only)
- Orders from multiple sales channels (**offline store, TikTok Shop, Shopee**)
- Inventory synced across channels

This project focuses on **back-office management**, not a customer-facing storefront.

## Architecture

### Monorepo Structure
- `client/` - Nuxt 4 application (port 3000)
- `server/` - NestJS API (port 4000) 
- `script.sql` - Database initialization at workspace root

### Client (Nuxt 4)
- **Framework**: Nuxt 4 with Vue 3 + TypeScript (strict mode)
- **UI Library**: @nuxt/ui (Nuxt UI v4) with Tailwind CSS
- **State Management**: Pinia stores in `client/app/stores/`
- **API Layer**: Hybrid architecture with both:
  - Client-side `useApi()` composable in `client/app/composables/useApi.ts` 
  - Server-side API routes in `client/server/api/` that proxy to NestJS backend

### Server (NestJS)
- **Database**: MySQL 8.0 via TypeORM (entities use decorators)
- **Authentication**: JWT with Passport (module in `server/src/auth/`)
- **API Documentation**: Swagger at `/api/docs` (extensively documented with examples)
- **Module Structure**: Feature-based modules (products, orders, customers, categories)

## Critical Patterns

### API Communication Flow
1. Nuxt pages call `/api/products` (Nuxt server routes)
2. Nuxt server routes use `getApiBaseURL()` helper from `client/server/utils/api.ts`
3. Requests proxy to NestJS backend at `NUXT_PUBLIC_API_BASE` (default: `http://localhost:4000/api`)

**Example from `client/server/api/products/index.ts`:**
```typescript
const baseURL = getApiBaseURL(); // Returns NUXT_PUBLIC_API_BASE
return await $fetch(`${baseURL}/products`);
```

### DTO & Validation Pattern (NestJS)
- All DTOs use `class-validator` decorators (`@IsNotEmpty`, `@IsString`, etc.)
- Swagger documentation via `@ApiProperty` with examples
- See `server/src/products/dto/create-product.dto.ts` for reference

### Entity Pattern (TypeORM)
- Entities use snake_case column names (`category_id`) mapped to camelCase properties (`categoryId`)
- Relations use `@ManyToOne` / `@JoinColumn` - see `server/src/products/entities/product.entity.ts`
- Always include `@CreateDateColumn` and `@UpdateDateColumn`

### UI Component Pattern (Nuxt)
- Pages use Nuxt UI components (`UTable`, `UButton`, `UBadge`, etc.)
- Resolve components explicitly: `const UAvatar = resolveComponent("UAvatar")`
- Tables use TanStack Table with column definitions - see `client/app/pages/orders/index.vue`

### Layout System
- Default layout (`client/app/layouts/default.vue`) uses `UDashboardGroup` with:
  - Collapsible/resizable sidebar
  - `TeamsMenu` header
  - `UNavigationMenu` for nav items
  - `UserMenu` footer
- Navigation items defined in layout with `to` paths and Lucide icons (`i-lucide-house`)

## Development Workflows

### Starting the Application
```bash
# Terminal 1: Start MySQL (required first)
cd server && docker-compose up -d

# Terminal 2: Start NestJS backend
cd server && npm run start:dev  # Runs on port 4000

# Terminal 3: Start Nuxt frontend  
cd client && npm run dev  # Runs on port 3000
```

### Environment Configuration
- Client: `client/.env` with `NUXT_PUBLIC_API_BASE=http://localhost:4000/api`
- Server: `server/.env` with database credentials (see `server/src/config/database.config.ts`)

### Database
- MySQL runs in Docker via `server/docker-compose.yml`
- Connection: `localhost:3306`, DB: `omni_sales`, password: `123456`
- TypeORM auto-sync enabled in development (`synchronize: true`)

## Project-Specific Conventions

### File Organization
- **Nuxt pages**: Auto-routed from `client/app/pages/` (e.g., `orders/index.vue` → `/orders`)
- **NestJS modules**: Each feature has controller, service, module, dto/, entities/ subdirectories
- **Shared types**: Client types in `client/app/types/`, server entities in `server/src/*/entities/`

### Naming Conventions
- **Routes**: kebab-case (`/draft-orders`, `/orders`)
- **Components**: PascalCase files (`TeamsMenu.vue`, `UserMenu.vue`)
- **Composables**: camelCase with `use` prefix (`useApi.ts`, `useDashboard.ts`)
- **API endpoints**: Match NestJS controller paths (e.g., `/api/products`, `/api/auth/login`)

### TypeScript Configuration
- Both projects use strict mode
- Client: `typeCheck: false` in nuxt.config.ts (relies on editor checking)
- Server: Standard NestJS tsconfig with decorators enabled

## Key Integration Points

### Authentication Flow
- Login at `/login` → calls `/api/auth/login` (NestJS)
- JWT stored in Pinia store (`client/app/stores/auth.ts`)
- Middleware at `client/app/middleware/auth.ts` (currently placeholder)

### API Response Format
- NestJS controllers return data directly
- Nuxt `useApi()` wraps responses in `ApiResponse<T>` type
- Error handling in `useApi.ts` via `onResponseError` callback

## Common Tasks

### Adding a New Feature Module
1. NestJS: Generate with `nest g resource feature-name`
2. Create entity with TypeORM decorators and snake_case columns
3. Add DTOs with class-validator and Swagger decorators
4. Register module in `server/src/app.module.ts`
5. Create Nuxt API proxy in `client/server/api/feature-name/`
6. Add page in `client/app/pages/feature-name.vue`
7. Update navigation in `client/app/layouts/default.vue`

### Working with Tables
- Use TanStack Table via Nuxt UI's `UTable` component
- Define columns with `TableColumn<Type>[]` type
- Custom cells use `h()` render function for components
- See `client/app/pages/orders/index.vue` for complete example

### Swagger Documentation
- Access at `http://localhost:4000/api/docs`
- All endpoints extensively documented with request/response examples
- Use for API reference when building client features
