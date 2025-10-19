# Online Notebook - Student Resource Hub

A collaborative platform for BTech and Degree students to share and access educational resources. Built with Node.js, Vue.js, Sequelize ORM, and PostgreSQL.

## Features

- **User Authentication & Authorization**: Secure registration and login with JWT
- **Admin Approval System**: All registrations require admin approval to maintain quality
- **File Upload & Management**: Upload PDFs, DOC, DOCX, PPT, PPTX files (max 10MB)
- **Smart Filtering**: Filter notes by college, department, and subject
- **Comments System**: Registered users can comment on notes
- **Download Tracking**: Track download counts for each note
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Admin Dashboard**: Manage users, view statistics, approve/reject registrations

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL Database
- Sequelize ORM
- JWT Authentication
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- Vue.js 3
- Vuex for state management
- Vue Router for navigation
- Axios for API calls
- Font Awesome icons
- CSS3 with responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd OnlineNoteBook
```

### 2. Setup PostgreSQL Database

Create a database in PostgreSQL:

```sql
CREATE DATABASE online_notebook;
```

Or use the default credentials in `.env` file (user: postgres, password: root)

### 3. Install Backend Dependencies

```bash
npm install
```

### 4. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 5. Configure Environment Variables

The `.env` file is already configured with default values:

```
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

**Note**: Change `JWT_SECRET` in production!

### 6. Create Initial Admin User

Run the setup script to create an admin user:

```bash
node scripts/createAdmin.js
```

**Default Admin Credentials:**
- Email: admin@onlinenotebook.com
- Password: admin123

**IMPORTANT**: Change the admin password after first login!

### 7. Seed Sample Data (Optional)

To add sample colleges, departments, and subjects:

```bash
node scripts/seedData.js
```

## Running the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
npm run dev
```

**Terminal 2 - Frontend Development Server:**
```bash
cd client
npm run serve
```

- Backend will run on: http://localhost:5000
- Frontend will run on: http://localhost:8080

### Production Mode

Build the frontend:
```bash
npm run build
```

Start the server:
```bash
npm start
```

Access the application at: http://localhost:5000

## Usage Guide

### For Students

1. **Register**: Create an account with your college and department details
2. **Wait for Approval**: Admin will review and approve your registration
3. **Browse Notes**: View and download notes without logging in
4. **Upload Notes**: Once approved, upload your study materials
5. **Comment**: Engage in discussions on notes
6. **Filter**: Use filters to find specific notes by college/department/subject

### For Admins

1. **Login**: Use admin credentials
2. **Dashboard**: View platform statistics
3. **Approve Users**: Review and approve/reject user registrations
4. **Monitor**: Keep track of notes, comments, and downloads
5. **Manage**: Delete inappropriate content if needed

## Project Structure

```
OnlineNoteBook/
├── client/                  # Vue.js frontend
│   ├── public/
│   └── src/
│       ├── assets/         # CSS and static files
│       ├── components/     # Reusable components
│       ├── views/          # Page components
│       ├── router/         # Vue Router config
│       ├── store/          # Vuex store
│       └── App.vue
├── config/                 # Configuration files
│   └── database.js
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication middleware
│   └── upload.js          # File upload configuration
├── models/                # Sequelize models
│   ├── index.js
│   ├── User.js
│   ├── Note.js
│   ├── Comment.js
│   ├── College.js
│   ├── Department.js
│   └── Subject.js
├── routes/                # API routes
│   ├── auth.js
│   ├── users.js
│   ├── notes.js
│   ├── comments.js
│   ├── admin.js
│   ├── colleges.js
│   ├── departments.js
│   └── subjects.js
├── scripts/               # Utility scripts
│   ├── createAdmin.js
│   └── seedData.js
├── uploads/               # Uploaded files directory
├── server.js              # Express server
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - Get all notes (with filters)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Upload note (auth required)
- `DELETE /api/notes/:id` - Delete note (auth required)
- `GET /api/notes/:id/download` - Download note file

### Comments
- `POST /api/comments` - Add comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)

### Admin
- `GET /api/admin/pending-users` - Get pending approvals
- `PUT /api/admin/approve-user/:id` - Approve user
- `DELETE /api/admin/reject-user/:id` - Reject user
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get dashboard statistics

### Reference Data
- `GET /api/colleges` - Get all colleges
- `GET /api/departments` - Get departments (by college)
- `GET /api/subjects` - Get subjects (by department)

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes with middleware
- Admin-only endpoints
- File type and size validation
- SQL injection protection (Sequelize ORM)
- XSS protection with Content Security Policy

## File Upload Configuration

- Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT
- Maximum file size: 10MB
- Files stored in `/uploads` directory

## Database Schema

- **Users**: Authentication and profile information
- **Notes**: Uploaded documents with metadata
- **Comments**: User comments on notes
- **Colleges**: College information
- **Departments**: Department data linked to colleges
- **Subjects**: Subject data linked to departments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@onlinenotebook.com or create an issue in the repository.

## Acknowledgments

- Font Awesome for icons
- Vue.js community
- Express.js community
- PostgreSQL team

---

**Built with ❤️ for students, by students**

