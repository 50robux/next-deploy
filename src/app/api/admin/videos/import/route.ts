import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
    const isAuthenticated = await verifyAdmin(req);

    if (!isAuthenticated) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { videos } = await req.json();

    try {
        // Validate and process the data
        const videoData = videos.map((video: any) => ({
            title: video.title,
            description: video.description || null,
            price: parseFloat(video.price),
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
        }));

        // Insert data into the database
        await prisma.video.createMany({
            data: videoData,
            skipDuplicates: true,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Error importing videos' });
    }
}
