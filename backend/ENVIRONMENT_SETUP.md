# Environment Setup Guide

## Database Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onlinenotebook
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Default Values

If you don't create a `.env` file, the application will use these default values:
- Host: localhost
- Port: 5432
- Database: onlinenotebook
- User: postgres
- Password: postgres

## PostgreSQL Setup

1. Make sure PostgreSQL is installed and running
2. Create a database named `onlinenotebook`
3. Update the password in your `.env` file to match your PostgreSQL password
4. Run the database migration script

## Running the Application

```bash
cd backend
npm install
npm start
```
