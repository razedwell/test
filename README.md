# User Management Service

## Features
- User registration with OTP verification
- JWT authentication with refresh tokens
- Role-based access control (Admin/User)
- User blocking functionality
- Clean architecture with layered design
- TypeScript for type safety
- PostgreSQL with Prisma ORM
- Input validation with Joi
- Security best practices (helmet, rate limiting)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file with the configuration shown above

### 3. Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Create Admin User (Optional)
Run this SQL in your database or via Prisma Studio:
```sql
INSERT INTO users (id, full_name, birth_date, email, password, role, is_active)
VALUES (
  gen_random_uuid(),
  'Admin User',
  '1990-01-01',
  'admin@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7MK4qXvL5m', -- password: admin123
  'ADMIN',
  true
);
```

### 5. Run the Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/verify-otp` - Verify OTP code
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh-token` - Refresh access token
- POST `/api/auth/logout` - Logout user
- POST `/api/auth/resend-otp` - Resend OTP
- GET `/api/auth/me` - Get current user (requires auth)

### Users
- GET `/api/users` - Get all users (Admin only)
- GET `/api/users/:id` - Get user by ID (Admin or self)
- PATCH `/api/users/:id/block` - Block user (Admin or self)

## Example Requests

### 1. Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "birthDate": "1990-01-01",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-from-registration",
    "otpCode": "123456"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Get User by ID
```bash
curl http://localhost:3000/api/users/user-id \
  -H "Authorization: Bearer your-access-token"
```

### 5. Get All Users (Admin)
```bash
curl http://localhost:3000/api/users?page=1&limit=10 \
  -H "Authorization: Bearer admin-access-token"
```

### 6. Block User
```bash
curl -X PATCH http://localhost:3000/api/users/user-id/block \
  -H "Authorization: Bearer your-access-token"
```

## Architecture

### Layered Structure
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic
- **Middlewares**: Authentication, validation, error handling
- **Routes**: API endpoint definitions
- **Validators**: Input validation schemas
- **Utils**: Helper functions (JWT, OTP, errors)

### Security Features
- Password hashing with bcrypt (cost factor: 12)
- JWT tokens with expiration
- Refresh token rotation
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)

## Database Schema

### Users Table
- id (UUID, PK)
- full_name (String)
- birth_date (Date)
- email (String, Unique)
- password (String, Hashed)
- role (Enum: ADMIN/USER)
- is_active (Boolean)
- created_at, updated_at

### OTPs Table
- id (UUID, PK)
- user_id (UUID, FK)
- code (String)
- expires_at (DateTime)
- verified (Boolean)

### Refresh Tokens Table
- id (UUID, PK)
- user_id (UUID, FK)
- token (String, Unique)
- expires_at (DateTime)

## Technologies Used
- Node.js & TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT (jsonwebtoken)
- Bcrypt
- Joi (validation)
- Nodemailer (email)
- Helmet (security)
- Express Rate Limit

## Best Practices Implemented
TypeScript for type safety
Environment variables for configuration
Layered architecture (separation of concerns)
Error handling middleware
Input validation
Security headers
Rate limiting
Graceful shutdown
Database connection pooling
JWT with refresh tokens
OTP verification
Role-based access control
Password hashing
API versioning (/api prefix)
Health check endpoint