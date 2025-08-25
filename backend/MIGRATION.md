# Database Migration Guide

This guide explains how to migrate your existing hostel management system to support multi-user functionality.

## What Changed

The system has been updated to support multiple users with isolated data. Each user now has their own set of:
- Rooms
- Trainees
- Inventory items
- Reports and dashboard data

## Migration Steps

### 1. Backup Your Database (IMPORTANT!)
Before running any migration, make sure to backup your existing database:

```bash
# For MongoDB
mongodump --db hostel_management --out ./backup
```

### 2. Run the Migration Script
Navigate to the backend directory and run:

```bash
cd "New folder/Backend"
npm run migrate
```

This script will:
- Create a default admin user if none exists
- Assign all existing rooms, trainees, and inventory to the admin user
- Ensure data integrity during the transition

### 3. Verify Migration
After running the migration:
1. Start the backend server: `npm run dev`
2. Login with the admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. Verify that all your existing data is visible and functional

## New Features

### User Isolation
- Each user can only see and modify their own data
- No cross-user data access or interference
- Secure multi-tenant architecture

### Fixed Issues
1. **Bed Color Updates**: Room bed colors now properly update after allotment
2. **View Buttons**: Trainee and amenity view buttons now work correctly
3. **Checkout Functionality**: Properly moves trainees from staying to checked out
4. **Room Deletion**: Delete button on rooms page now functions properly
5. **Room Status Updates**: Rooms are properly marked as vacant when trainees check out

## Default Credentials

After migration, you can login with:
- **Username**: `admin`
- **Password**: `admin123`

## Creating New Users

New users can register through the registration page. Each new user will get:
- Their own isolated database space
- Default room and inventory setup
- Complete separation from other users' data

## Troubleshooting

### Migration Fails
If the migration script fails:
1. Check your MongoDB connection
2. Ensure you have proper permissions
3. Restore from backup if needed
4. Contact support with error details

### Data Missing After Migration
If data appears missing:
1. Verify you're logged in with the correct user
2. Check that the migration completed successfully
3. Restore from backup if necessary

### Performance Issues
If you experience performance issues:
1. Ensure proper database indexing
2. Monitor database query performance
3. Consider database optimization

## Support

If you encounter any issues during migration:
1. Check the console logs for error messages
2. Verify your environment configuration
3. Ensure all dependencies are properly installed
4. Contact technical support with detailed error information

## Post-Migration Checklist

- [ ] Migration script completed successfully
- [ ] Can login with admin credentials
- [ ] All existing data is visible
- [ ] Room allotment works correctly
- [ ] Checkout functionality works
- [ ] View buttons function properly
- [ ] Delete operations work as expected
- [ ] New user registration creates isolated data