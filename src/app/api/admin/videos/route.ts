// src/app/api/admin/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

// GET method: Admin only
export async function GET(req: NextRequest) {
  const isAuthenticated = await verifyAdmin(req);

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // แปลงข้อมูลให้เป็นรูปแบบที่ปลอดภัยสำหรับ JSON
    const formattedVideos = videos.map(video => ({
      ...video,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      price: video.price.toString(), // แปลง Decimal เป็น string
    }));

    return NextResponse.json({ success: true, videos: formattedVideos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error fetching videos' }, { status: 500 });
  }
}

// POST method: Admin only
export async function POST(req: NextRequest) {
  const isAuthenticated = await verifyAdmin(req);

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, price, videoUrl, thumbnailUrl } = await req.json();

  try {
    await prisma.video.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        videoUrl,
        thumbnailUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error creating video' }, { status: 500 });
  }
}
