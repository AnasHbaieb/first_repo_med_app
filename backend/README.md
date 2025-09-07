# Med-CRM Backend API

A secure Node.js/Express backend for the Med-CRM student management system with Prisma ORM and PostgreSQL.

## 🏗️ Architecture

This backend follows a clean, secure architecture with:
- **Express.js** for the web framework
- **Prisma ORM** for database operations
- **PostgreSQL** as the database
- **JWT** for secure admin authentication
- **bcrypt** for password hashing

## 🔐 Security Model

### Admin Authentication
Admin access is secured through environment variables, NOT database records:

1. **Hard-coded Admin Password**: The admin password is hashed with bcrypt and stored as `ADMIN_PASSWORD_HASH` in environment variables
2. **JWT Tokens**: Admin sessions use JWT tokens with 24-hour expiration
3. **No Database Admin Records**: Admin credentials are never stored in the database, preventing privilege escalation

### Security Features
- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- SQL injection prevention via Prisma ORM

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies:**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Environment Configuration:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update `.env` with your values:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/medcrm"
   JWT_SECRET="your-super-secure-jwt-secret"
   ADMIN_PASSWORD_HASH="$2b$10$..." # Generate with bcrypt
   \`\`\`

3. **Generate Admin Password Hash:**
   \`\`\`bash
   node -e "console.log(require('bcrypt').hashSync('your-admin-password', 10))"
   \`\`\`

4. **Database Setup:**
   \`\`\`bash
   npx prisma migrate dev
   npx prisma generate
   \`\`\`

5. **Start Development Server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/admin/login`
Admin login with password verification.

**Request:**
\`\`\`json
{
  "password": "admin-password"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "token": "jwt-token-here",
  "message": "Admin authentication successful"
}
\`\`\`

#### GET `/api/auth/admin/verify`
Verify JWT token validity.

**Headers:**
\`\`\`
Authorization: Bearer <jwt-token>
\`\`\`

### Student Management Endpoints

#### GET `/api/students`
Get all students with filtering options.

#### POST `/api/students`
Create a new student registration.

#### PUT `/api/students/:id`
Update student information.

#### DELETE `/api/students/:id`
Delete a student record.

### Attendance Endpoints

#### POST `/api/attendance/mark`
Mark student attendance for a session.

#### GET `/api/attendance/student/:id`
Get attendance history for a student.

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Admin Password**: Use a strong password (20+ characters)
3. **JWT Secret**: Use a cryptographically secure random string
4. **Database**: Use connection pooling and prepared statements (via Prisma)
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Adjust limits based on your needs

## 🔧 Development

### Database Operations
\`\`\`bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
\`\`\`

### Testing
\`\`\`bash
# Health check
curl http://localhost:3001/health

# Admin login test
curl -X POST http://localhost:3001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
\`\`\`

## 📁 Project Structure

\`\`\`
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── middleware/      # Authentication & validation
│   └── server.js        # Express app configuration
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── package.json
└── README.md
