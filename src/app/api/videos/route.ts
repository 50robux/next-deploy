// src/app/api/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // แปลงข้อมูลให้เป็นรูปแบบที่ปลอดภัยสำหรับ JSON
    const formattedVideos = videos.map(video => ({
      ...video,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      price: video.price.toString() // แปลง Decimal เป็น string
    }));

    return NextResponse.json({ success: true, videos: formattedVideos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error fetching videos' }, { status: 500 });
  }
}
