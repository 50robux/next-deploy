// src/app/api/get-other-videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const excludeIdParam = searchParams.get('excludeId');
  const limitParam = searchParams.get('limit');

  if (!excludeIdParam) {
      return NextResponse.json({ success: false, message: 'ไม่พบรหัสวิดีโอที่ต้องการยกเว้น' }, { status: 400 });
  }

  const excludeId = parseInt(excludeIdParam);
  if (isNaN(excludeId)) {
      return NextResponse.json({ success: false, message: 'รหัสวิดีโอไม่ถูกต้อง' }, { status: 400 });
  }

  const limit = parseInt(limitParam || '24');
  if (isNaN(limit) || limit <= 0) {
      return NextResponse.json({ success: false, message: 'จำนวนวิดีโอที่ต้องการนำเข้าผิดพลาด' }, { status: 400 });
  }

  try {
      const videos = await prisma.video.findMany({
          where: {
              id: {
                  not: excludeId,
              },
          },
          take: limit,
          select: {
              id: true,
              title: true,
              videoUrl: true,
              thumbnailUrl: true,
          },
      });

      // ถ้า thumbnailUrl ไม่มีค่า ให้ใช้ค่าเริ่มต้น
      const defaultThumbnail = 'https://via.placeholder.com/300x200.png?text=No+Thumbnail';
      const videosWithDefaultThumbnail = videos.map((video) => ({
          ...video,
          thumbnailUrl: video.thumbnailUrl || defaultThumbnail,
      }));

      // Remove console.log in production
      if (process.env.NODE_ENV === 'development') {
          console.log('Fetched videos:', videosWithDefaultThumbnail);
      }

      return NextResponse.json({ success: true, videos: videosWithDefaultThumbnail });
  } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}
