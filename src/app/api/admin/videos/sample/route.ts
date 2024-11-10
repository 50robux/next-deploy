// src/app/api/admin/videos/sample/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
    const isAuthenticated = await verifyAdmin(req);

    if (!isAuthenticated) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sampleData = [
        ['title', 'description', 'price', 'videoUrl', 'thumbnailUrl'],
        ['ตัวอย่างวิดีโอ 1', 'คำอธิบายวิดีโอ 1', '100', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg'],
        ['ตัวอย่างวิดีโอ 2', 'คำอธิบายวิดีโอ 2', '200', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg'],
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    
    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=sample_videos.csv'
        }
    });
}
