# Online Notebook - Model Updates Summary

## Overview
This document summarizes the major model updates made to improve database relationships and data integrity.

## Changes Made

### 1. User Model Updates
- **Removed**: `collegeName` (string field)
- **Removed**: `department` (string field)  
- **Added**: `collegeId` (UUID foreign key to Colleges table)
- **Added**: `departmentId` (UUID foreign key to Departments table)

### 2. Model Relationships Enhanced
- User → College (belongsTo)
- User → Department (belongsTo)
- College → Users (hasMany)
- Department → Users (hasMany)
- All relationships include proper aliases for easy querying

### 3. Backend API Updates
- **Auth Routes**: Updated registration and login to work with foreign keys
- **Admin Routes**: Enhanced to include college and department information
- **Validation**: Added validation for college and department existence

### 4. Frontend Updates
- **Register.vue**: Changed to dropdown selects for college and department
- **Profile.vue**: Updated to display college and department names from relationships
- **Admin.vue**: Updated to show college and department information
- **Upload.vue**: Already had proper dropdown structure (no changes needed)

### 5. Seeding Scripts
- **createAdmin.js**: Updated to create system college and department for admin
- **seedData.js**: Already properly structured (no changes needed)
- **migrateUserData.js**: New script to migrate existing user data

## Migration Instructions

### For Existing Installations

1. **Run the migration script**:
   ```bash
   cd backend
   npm run migrate-users
   ```

2. **Update your database** (if needed):
   ```bash
   # The migration script will handle creating colleges and departments
   # from existing user data
   ```

3. **Restart your application**:
   ```bash
   npm run dev
   ```

### For New Installations

1. **Seed the database**:
   ```bash
   cd backend
   npm run seed
   ```

2. **Create admin user**:
   ```bash
   npm run create-admin
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

## Benefits of These Changes

### 1. Data Integrity
- Foreign key constraints prevent invalid college/department references
- No more duplicate college names in the database
- Consistent department names across users

### 2. Better Performance
- Efficient joins instead of string matching
- Proper indexing on foreign keys
- Reduced data redundancy

### 3. Improved User Experience
- Dropdown selections prevent typos
- Consistent college and department names
- Better data validation

### 4. Easier Maintenance
- Single source of truth for college and department data
- Easy to add new colleges and departments
- Simplified data management

## API Changes

### Registration Endpoint
**Before**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "collegeName": "ABC College",
  "department": "Computer Science"
}
```

**After**:
```json
{
  "name": "John Doe", 
  "email": "john@example.com",
  "password": "password123",
  "collegeId": "uuid-here",
  "departmentId": "uuid-here"
}
```

### Login Response
**Before**:
```json
{
  "user": {
    "collegeName": "ABC College",
    "department": "Computer Science"
  }
}
```

**After**:
```json
{
  "user": {
    "college": {
      "id": "uuid",
      "name": "ABC College",
      "location": "City",
      "type": "Engineering"
    },
    "department": {
      "id": "uuid", 
      "name": "Computer Science",
      "code": "CSE"
    }
  }
}
```

## Database Schema

### Updated User Table
```sql
CREATE TABLE "Users" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "email" VARCHAR UNIQUE NOT NULL,
  "password" VARCHAR NOT NULL,
  "phone" VARCHAR,
  "collegeId" UUID REFERENCES "Colleges"("id"),
  "departmentId" UUID REFERENCES "Departments"("id"),
  "year" VARCHAR,
  "rollNumber" VARCHAR,
  "role" VARCHAR DEFAULT 'user',
  "isApproved" BOOLEAN DEFAULT false,
  "approvedBy" UUID,
  "approvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Ensure database is running and accessible
2. **Frontend shows "N/A"**: Check that college and department data is properly seeded
3. **Registration fails**: Verify college and department IDs exist in database

### Rollback Instructions

If you need to rollback these changes:

1. Restore the old User model with `collegeName` and `department` fields
2. Update API routes to use string fields
3. Update frontend components to use text inputs
4. Run a reverse migration script (if needed)

## Support

For issues or questions about these updates, please check:
1. Database connection and permissions
2. API endpoint responses
3. Frontend console for errors
4. Backend logs for detailed error messages
