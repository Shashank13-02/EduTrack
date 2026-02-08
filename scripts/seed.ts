import dotenv from 'dotenv';
dotenv.config();

import { seedData } from '../lib/seed-data';

async function main() {
    try {
        await seedData();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();
