import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const email = 'admin@edutrack.edu';
        const existingAdmin = await mongoose.connection.db?.collection('users').findOne({ email });

        if (existingAdmin) {
            console.log('Admin account already exists');
            process.exit(0);
        }

        const password = 'adminPassword123'; // User should change this
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const adminUser = {
            name: 'System Administrator',
            email,
            passwordHash,
            role: 'ADMIN',
            department: 'Computer Science & Engineering', // Must match DEPARTMENTS array
            bio: 'System administrator for EduTrack',
            skills: [],
            careerGoals: [],
            hobbies: [],
            isVerified: true,
            isLegacyUser: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await mongoose.connection.db?.collection('users').insertOne(adminUser);

        console.log('-----------------------------------');
        console.log('Admin account created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
        console.log('PLEASE CHANGE YOUR PASSWORD AFTER FIRST LOGIN');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin();
