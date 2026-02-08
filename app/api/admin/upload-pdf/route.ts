// ensure Node runtime so server-only npm packages work as expected
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import CollegeKnowledge from '@/models/CollegeKnowledge';
import { getPineconeIndex } from '@/lib/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Auth check
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let formData;
        try {
            formData = await request.formData();
        } catch (parseError: any) {
            console.error('FormData parse error:', parseError);
            return NextResponse.json({
                error: 'Failed to parse form data. Ensure you are sending multipart/form-data.',
                details: parseError.message
            }, { status: 400 });
        }

        const file = formData.get('file') as File;
        const category = (formData.get('category') as string) || 'general';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert file -> Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // -------------------------
        // Use Node-specific export for backend environments
        // -------------------------
        let PDFParse;
        try {
            // In pdf-parse v2+ (mehmet-kozan), PDFParse is a named export.
            // With serverExternalPackages set in next.config.ts, this will load the Node module directly.
            const pdfModule = await import('pdf-parse');
            PDFParse = (pdfModule as any).PDFParse || (pdfModule as any).default?.PDFParse || (pdfModule as any).default;
        } catch (e) {
            console.error('Error loading pdf-parse:', e);
            throw new Error('Could not load PDF parser (pdf-parse). Ensure it is installed.');
        }

        let text = '';
        if (typeof PDFParse === 'function' && PDFParse.prototype && 'getText' in PDFParse.prototype) {
            // Case 1: Modern class-based API (pdf-parse v2)
            const parser = new (PDFParse as any)({ data: buffer });
            const result = await parser.getText();
            text = (result?.text || '').trim();
        } else if (typeof PDFParse === 'function') {
            // Case 2: Legacy function-based API (or newer default export that is a function)
            const result = await (PDFParse as any)(buffer);
            text = (result?.text || '').trim();
        } else {
            throw new Error('Loaded PDF parser is not a class or function.');
        }

        if (!text) {
            return NextResponse.json(
                { error: 'Could not extract text from PDF (empty content)' },
                { status: 400 }
            );
        }

        // Save extracted text to MongoDB
        const knowledgeDoc = await CollegeKnowledge.create({
            category,
            title: file.name,
            content: text,
            metadata: {
                lastReviewed: new Date(),
            },
            isActive: true,
        });

        // Simple chunking (approx 1000 characters)
        const chunks = text.match(/[\s\S]{1,1000}/g) || [text];

        const documents = chunks.map((chunk: string, i: number) => {
            return new Document({
                pageContent: chunk,
                metadata: {
                    id: `${knowledgeDoc._id}_${i}`,
                    sourceId: knowledgeDoc._id.toString(),
                    category,
                    title: file.name,
                    chunkIndex: i,
                },
            });
        });

        // Embeddings config
        const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
        if (!apiKey) throw new Error('API Key missing');

        const embeddings = new OpenAIEmbeddings({
            apiKey,
            modelName: 'sentence-transformers/all-minilm-l6-v2',
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
            },
        });

        const pineconeIndex = await getPineconeIndex();

        // Upload to Pinecone
        await PineconeStore.fromDocuments(documents, embeddings, {
            pineconeIndex,
            namespace: 'college-knowledge',
        });

        return NextResponse.json({
            success: true,
            message: 'PDF uploaded and processed',
            docId: knowledgeDoc._id,
            chunks: documents.length,
        });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
    }
}
