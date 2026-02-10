import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';
import CollegeKnowledge from '../models/CollegeKnowledge';
import { getPineconeIndex, ensureIndexExists } from '../lib/pinecone';
import { TaskType } from "@google/generative-ai";

dotenv.config();

// Sample college knowledge data
const knowledgeData = [
    {
        category: 'syllabus',
        title: 'First Year Engineering Syllabus Overview',
        content: `First Year Engineering Curriculum:

Semester 1:
- Engineering Mathematics I: Calculus, Linear Algebra, Differential Equations
- Engineering Physics: Mechanics, Thermodynamics, Wave Motion
- Engineering Chemistry: Physical Chemistry, Organic Chemistry, Inorganic Chemistry
- Engineering Graphics: Technical Drawing, CAD Basics
- Programming Fundamentals: C Programming, Data Structures Basics
- Communication Skills: Technical Writing, Presentation Skills

Semester 2:
- Engineering Mathematics II: Complex Analysis, Probability and Statistics
- Engineering Mechanics: Statics, Dynamics, Strength of Materials
- Electrical and Electronics Engineering: Circuit Theory, Digital Electronics
- Environmental Science: Ecology, Environmental Management
- Workshop Practice: Manufacturing Processes, Safety
- Professional Ethics: Engineering Ethics, Social Responsibility

Each subject has theory (3-4 credits) and practical (1-2 credits) components. Students must complete all subjects to progress to second year.`,
        metadata: { year: '1', semester: 'Both' },
    },
    {
        category: 'attendance',
        title: 'College Attendance Policy',
        content: `Attendance Requirements:

Minimum Attendance: Students must maintain at least 75% attendance in each subject to be eligible to appear for end-semester examinations.

Calculation: Attendance = (Classes Attended / Total Classes Conducted) × 100

Consequences of Low Attendance:
- Below 75%: Student is not eligible for end-semester exams
- Between 65-75%: Condonation may be granted with valid medical certificates or other approved reasons
- Below 65%: No condonation allowed; student must repeat the semester

Medical Leave: 
- Must be reported within 3 days with valid medical certificate
- Long-term medical issues require doctor's certificate and HOD approval
- Medical leave is counted separately and does not affect attendance percentage if properly documented

Special Cases:
- Representing college in sports/cultural events: Attendance marked present with prior approval
- Industrial visits and educational tours: Counted as present
- Emergency situations: Case-by-case basis with proper documentation

Attendance is monitored weekly and students below 80% receive warnings via email and parent notification.`,
        metadata: {},
    },
    {
        category: 'exams',
        title: 'Examination Rules and Regulations',
        content: `Examination Rules:

Types of Examinations:
1. Continuous Internal Assessment (CIA):
   - CIA 1: Week 6-7 (15 marks)
   - CIA 2: Week 12-13 (15 marks)
   - CIA 3: Week 16-17 (15 marks)
   - Best 2 out of 3 CIAs considered
   - Assignments/Quizzes: 5 marks

2. End Semester Examination (ESE):
   - Conducted after 18 weeks
   - Weightage: 60 marks
   - Duration: 3 hours
   - Minimum passing: 24/60 (40%)

Total Marks: 100 (40 internal + 60 external)
Passing Criteria: Minimum 40% overall AND minimum 40% in ESE

Exam Hall Rules:
- Students must carry ID card and hall ticket
- Entry allowed up to 15 minutes after exam starts
- No mobile phones, smartwatches, or electronic devices
- Use of unfair means results in cancellation of that subject
- Students must write answers in black/blue pen only
- Rough work must be done on answer sheets only

Revaluation:
- Students can apply for revaluation within 1 week of results
- Fee: ₹500 per subject
- Only answer scripts are rechecked, not re-evaluated
- Grade can increase, decrease, or remain same

Supplementary Exams:
- Conducted for failed students
- Usually held 2 months after main exams
- Maximum 4 subjects allowed in supplementary
- Same syllabus and pattern as regular exams`,
        metadata: {},
    },
    {
        category: 'cgpa',
        title: 'CGPA Calculation Method',
        content: `CGPA (Cumulative Grade Point Average) Calculation:

Grade System:
- O (Outstanding): 10 grade points (90-100%)
- A+ (Excellent): 9 grade points (80-89%)
- A (Very Good): 8 grade points (70-79%)
- B+ (Good): 7 grade points (60-69%)
- B (Above Average): 6 grade points (50-59%)
- C (Average): 5 grade points (40-49%)
- F (Fail): 0 grade points (Below 40%)

Calculation Formula:

1. Credit Points for a subject = Grade Points × Credits of that subject

2. SGPA (Semester Grade Point Average) = 
   Sum of (Grade Points × Credits) for all subjects / Total Credits in that semester

3. CGPA = 
   Sum of (SGPA × Total Credits in each semester) / Total Credits of all semesters

Example:
Subject 1: Grade A (8 points) × 4 credits = 32 credit points
Subject 2: Grade B+ (7 points) × 3 credits = 21 credit points
Subject 3: Grade O (10 points) × 3 credits = 30 credit points
Total: 83 credit points / 10 total credits = 8.3 SGPA

Percentage Conversion:
Approximate Percentage = (CGPA - 0.75) × 10

Classification:
- First Class with Distinction: CGPA ≥ 7.5
- First Class: CGPA ≥ 6.0
- Second Class: CGPA ≥ 5.0
- Pass Class: CGPA ≥ 4.0

Note: Some subjects may have different credit weightage. Always verify credits from your curriculum.`,
        metadata: {},
    },
    {
        category: 'scholarship',
        title: 'Scholarship Opportunities and Eligibility',
        content: `Scholarship Programs:

1. Merit-Based Scholarships:

Merit Scholarship:
- Eligibility: CGPA ≥ 8.5 in previous semester
- Amount: ₹25,000 per semester
- Renewable: Yes, subject to maintaining CGPA
- Application: Automatic, no application needed

Topper Scholarship:
- Eligibility: Top 3 students in each department
- Amount: ₹50,000 per year
- Additional benefits: Certificate, book allowance
- Selection: Based on annual CGPA

2. Need-Based Scholarships:

Economically Weaker Section (EWS) Scholarship:
- Eligibility: Family income < ₹2.5 lakhs/year
- Amount: Up to 50% fee waiver
- Documents required: Income certificate, caste certificate (if applicable)
- Application deadline: Within 1 month of admission

3. Government Scholarships:

Central Sector Scheme:
- Eligibility: Based on 12th marks and family income
- Amount: ₹10,000-₹20,000 per year
- Apply through: National Scholarship Portal (NSP)

State Government Scholarship:
- Varies by state
- SC/ST/OBC students may get additional benefits
- Apply through respective state portals

4. Sports/Cultural Excellence:

Sports Scholarship:
- Eligibility: National/State level participation
- Amount: ₹15,000-₹30,000 per year
- Proof required: Certificates from recognized bodies

Cultural Excellence:
- For students with exceptional talent in arts/music
- Amount: ₹10,000 per year
- Selection through college cultural committee

5. Research Scholarships (for final year students):

Innovation Grant:
- Eligibility: Working on innovative project
- Amount: Up to ₹1,00,000 for project
- Application: Through project proposal submission

Application Process:
1. Check eligibility criteria
2. Collect required documents
3. Fill online application form
4. Submit to scholarship cell before deadline
5. Attend verification if called
6. Results announced within 1 month

Important Dates:
- Merit scholarships: Auto-processed after each semester results
- Need-based: June-July (1st round), December (2nd round)
- Government schemes: Consult NSP portal

Contact: scholarship@college.edu | Extension: 1234`,
        metadata: {},
    },
    {
        category: 'general',
        title: 'Academic Calendar and Important Information',
        content: `Academic Calendar:

Semester Duration: 18-20 weeks

Typical Schedule:
- Week 1-5: Regular classes
- Week 6-7: CIA 1 (Internal Assessment 1)
- Week 8-11: Regular classes
- Week 12-13: CIA 2 (Internal Assessment 2)
- Week 14-15: Regular classes
- Week 16-17: CIA 3 (Internal Assessment 3)
- Week 18: Model exams/Revision
- Week 19-21: End Semester Examinations

Breaks:
- Mid-semester break: 1 week (during festival season)
- Winter break: 2-3 weeks (December-January)
- Summer break: 6-8 weeks (May-June)

Important Contacts:
- Academic Office: academics@college.edu
- Examination Cell: exams@college.edu
- Admission Office: admissions@college.edu
- Placement Cell: placements@college.edu
- Student Counseling: counseling@college.edu

Library Hours:
- Monday to Friday: 8:00 AM - 8:00 PM
- Saturday: 9:00 AM - 5:00 PM
- Sunday: Closed
- Exam period: Extended hours (8:00 AM - 10:00 PM)

Hostel Information:
- Separate hostels for boys and girls
- Mess facilities available
- WiFi connectivity 24/7
- Visiting hours for parents: 10:00 AM - 6:00 PM

Transport:
- College buses available from major city points
- Routes and timings posted on notice board
- Students must carry ID card while boarding`,
        metadata: {},
    },
];

async function seedKnowledge() {
    try {
        console.log('🚀 Starting knowledge base seeding process...\n');

        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Ensure Pinecone index exists
        console.log('🔧 Ensuring Pinecone index exists...');
        await ensureIndexExists();
        console.log('✅ Pinecone index ready\n');

        // Clear existing knowledge from MongoDB
        console.log('🧹 Clearing existing knowledge from MongoDB...');
        await CollegeKnowledge.deleteMany({});
        console.log('✅ Cleared existing knowledge\n');

        // Insert knowledge into MongoDB
        console.log('💾 Inserting knowledge into MongoDB...');
        const insertedDocs = await CollegeKnowledge.insertMany(knowledgeData);
        console.log(`✅ Inserted ${insertedDocs.length} knowledge documents\n`);

        // Prepare documents for Pinecone
        console.log('📝 Preparing documents for vectorization...');
        const documents = insertedDocs.map(
            (doc) =>
                new Document({
                    pageContent: `${doc.title}\n\n${doc.content}`,
                    metadata: {
                        id: doc._id.toString(),
                        category: doc.category,
                        title: doc.title,
                        ...doc.metadata,
                    },
                })
        );
        console.log(`✅ Prepared ${documents.length} documents\n`);

        // Initialize embeddings
        console.log('🤖 Initializing OpenAI embeddings...');
        const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY or DEEPSEEK_API_KEY is required');
        }

        const embeddings = new OpenAIEmbeddings({
            apiKey,
            modelName: 'sentence-transformers/all-minilm-l6-v2', // or openai/text-embedding-3-small
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
            },
        });
        console.log('✅ Embeddings model initialized\n');

        // Get Pinecone index
        console.log('📊 Getting Pinecone index...');
        const pineconeIndex = await getPineconeIndex();
        console.log('✅ Pinecone index obtained\n');

        // Upload to Pinecone
        console.log('⬆️  Uploading vectors to Pinecone...');
        console.log('   This may take a few minutes...\n');

        await PineconeStore.fromDocuments(documents, embeddings, {
            pineconeIndex,
            namespace: 'college-knowledge',
        });

        console.log('✅ Successfully uploaded vectors to Pinecone\n');

        console.log('🎉 Knowledge base seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - MongoDB documents: ${insertedDocs.length}`);
        console.log(`   - Pinecone vectors: ${documents.length}`);
        console.log(`   - Categories: ${[...new Set(insertedDocs.map(d => d.category))].join(', ')}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding knowledge base:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Run the seeding function
seedKnowledge();
