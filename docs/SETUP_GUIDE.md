# Quick Setup Guide for Online Notebook

This guide will help you get the application running in just a few minutes.

## Prerequisites Check

Make sure you have these installed:
```bash
node --version    # Should be v14 or higher
npm --version     # Should be v6 or higher
psql --version    # PostgreSQL should be installed
```

## Step-by-Step Setup

### 1. Database Setup

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE online_notebook;
```

Or if you prefer command line:
```bash
psql -U postgres
CREATE DATABASE online_notebook;
\q
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Create Admin User

```bash
node scripts/createAdmin.js
```

This creates an admin account with:
- Email: `admin@onlinenotebook.com`
- Password: `admin123`

### 4. Seed Sample Data (Optional but Recommended)

```bash
node scripts/seedData.js
```

This adds:
- 3 sample colleges
- 8 departments
- 19 subjects

### 5. Start the Application

**Option A: Development Mode (Recommended for development)**

Open TWO terminal windows:

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run serve
```

Then open: http://localhost:8080

**Option B: Production Mode**

```bash
npm run build
npm start
```

Then open: http://localhost:5000

## First Steps After Setup

### 1. Login as Admin
- Go to http://localhost:8080/login
- Email: `admin@onlinenotebook.com`
- Password: `admin123`
- **Change password immediately!**

### 2. Test User Registration
- Open new incognito window
- Register a test user
- Go back to admin account
- Approve the user from Admin Dashboard

### 3. Upload a Test Note
- Login as the approved user
- Click "Upload" in navigation
- Fill in details and upload a PDF
- Browse notes to see it

### 4. Test Comments
- View the uploaded note
- Add a comment
- See real-time updates

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Make sure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Change PORT in `.env` file
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### Module Not Found
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# For frontend
cd client
rm -rf node_modules
npm install
cd ..
```

### Vue Compilation Error

**Solution:**
```bash
cd client
npm install @vue/cli-service --save-dev
npm run serve
```

## Default Ports

- Backend API: `http://localhost:5000`
- Frontend Dev: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Environment Variables

The `.env` file in root directory contains:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=online_notebook
DB_PORT=5432

JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
```

**For Production:**
- Change `JWT_SECRET` to a strong random string
- Set `NODE_ENV=production`
- Use strong database password

## Testing the Application

### Test User Flow:
1. ✓ Register new user
2. ✓ Admin approves user
3. ✓ User logs in
4. ✓ User uploads note
5. ✓ User browses notes
6. ✓ User downloads note
7. ✓ User adds comment

### Test Admin Flow:
1. ✓ Admin logs in
2. ✓ View dashboard statistics
3. ✓ Approve/reject users
4. ✓ View all users
5. ✓ Delete inappropriate content

## File Upload Testing

Supported formats:
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- PowerPoint (`.ppt`, `.pptx`)
- Text (`.txt`)

Maximum size: 10MB

## Common Commands

```bash
# Start backend in development
npm run dev

# Start frontend in development
cd client && npm run serve

# Build frontend for production
npm run build

# Start production server
npm start

# Create admin user
node scripts/createAdmin.js

# Seed database
node scripts/seedData.js
```

## Need Help?

- Check `README.md` for detailed documentation
- Review API endpoints in the README
- Check browser console for frontend errors
- Check terminal for backend errors
- Ensure database is running

## Next Steps

1. Customize the college/department data for your needs
2. Update branding and styling in Vue components
3. Add more subjects to the database
4. Configure email notifications (optional)
5. Set up proper hosting for production

---

**Happy Coding! 🚀**

