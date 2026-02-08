import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PreRegisteredUser from '@/models/PreRegisteredUser';
import { getUserFromRequest } from '@/lib/auth';

interface CSVRow {
    name: string;
    email: string;
    department: string;
    year?: string;
    registrationId?: string;
    subject?: string;
    yearsTaught?: string;
}

interface UploadResult {
    success: boolean;
    totalRows: number;
    successCount: number;
    errors: { row: number; email: string; error: string }[];
    created: { name: string; email: string }[];
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const user = await getUserFromRequest(request);
        if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const role = formData.get('role') as 'STUDENT' | 'TEACHER';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!role || (role !== 'STUDENT' && role !== 'TEACHER')) {
            return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
        }

        // Read file content
        const text = await file.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);

        if (lines.length < 2) {
            return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
        }

        // Parse CSV (simple implementation, assumes no commas in values or proper escaping)
        const headers = lines[0].split(',').map(h => h.trim());
        const rows: CSVRow[] = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        const result: UploadResult = {
            success: true,
            totalRows: rows.length,
            successCount: 0,
            errors: [],
            created: []
        };

        // Process each row
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // +2 because of header row and 0-index

            try {
                // Validate common fields
                if (!row.name || !row.email || !row.department) {
                    result.errors.push({
                        row: rowNumber,
                        email: row.email || 'unknown',
                        error: 'Missing required fields (name, email, department)'
                    });
                    continue;
                }

                // Check if already exists
                const existing = await PreRegisteredUser.findOne({
                    email: row.email.toLowerCase()
                });

                if (existing) {
                    result.errors.push({
                        row: rowNumber,
                        email: row.email,
                        error: 'Email already pre-registered'
                    });
                    continue;
                }

                // Role-specific validation and creation
                if (role === 'STUDENT') {
                    if (!row.year) {
                        result.errors.push({
                            row: rowNumber,
                            email: row.email,
                            error: 'Missing required field: year'
                        });
                        continue;
                    }

                    const year = parseInt(row.year);
                    if (isNaN(year) || year < 1 || year > 4) {
                        result.errors.push({
                            row: rowNumber,
                            email: row.email,
                            error: 'Year must be between 1 and 4'
                        });
                        continue;
                    }

                    await PreRegisteredUser.create({
                        name: row.name,
                        email: row.email.toLowerCase(),
                        role: 'STUDENT',
                        department: row.department,
                        year,
                        registrationId: row.registrationId || undefined,
                        isRegistered: false,
                        createdBy: user.userId,
                    });

                    result.successCount++;
                    result.created.push({ name: row.name, email: row.email });

                } else if (role === 'TEACHER') {
                    if (!row.subject || !row.yearsTaught) {
                        result.errors.push({
                            row: rowNumber,
                            email: row.email,
                            error: 'Missing required fields: subject, yearsTaught'
                        });
                        continue;
                    }

                    // Parse yearsTaught (e.g., "1,2,3" or "1;2;3")
                    const yearsTaughtStr = row.yearsTaught.replace(/;/g, ',');
                    const yearsTaught = yearsTaughtStr.split(',')
                        .map(y => parseInt(y.trim()))
                        .filter(y => !isNaN(y));

                    if (yearsTaught.length === 0 || !yearsTaught.every(y => y >= 1 && y <= 4)) {
                        result.errors.push({
                            row: rowNumber,
                            email: row.email,
                            error: 'yearsTaught must be comma-separated numbers between 1 and 4'
                        });
                        continue;
                    }

                    await PreRegisteredUser.create({
                        name: row.name,
                        email: row.email.toLowerCase(),
                        role: 'TEACHER',
                        department: row.department,
                        subject: row.subject,
                        yearsTaught,
                        isRegistered: false,
                        createdBy: user.userId,
                    });

                    result.successCount++;
                    result.created.push({ name: row.name, email: row.email });
                }

            } catch (error: any) {
                result.errors.push({
                    row: rowNumber,
                    email: row.email,
                    error: error.message || 'Failed to create entry'
                });
            }
        }

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('Bulk upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process CSV upload: ' + error.message },
            { status: 500 }
        );
    }
}
