-- Online Notebook Database Setup Script
-- Run this script in PostgreSQL to create the database

-- Create database
CREATE DATABASE online_notebook;

-- Connect to the database
\c online_notebook;

-- The application will automatically create tables using Sequelize migrations
-- when you start the server for the first time

-- To verify database connection, you can run:
-- SELECT version();

-- Notes:
-- 1. Make sure PostgreSQL is running before running this script
-- 2. The default user is 'postgres' with password 'root' (as configured in .env)
-- 3. Tables will be auto-created by Sequelize ORM when server starts
-- 4. Run 'node scripts/createAdmin.js' to create admin user
-- 5. Run 'node scripts/seedData.js' to populate sample data

