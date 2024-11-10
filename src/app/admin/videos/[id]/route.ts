// src/app/api/admin/videos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบการยืนยันตัวตน
    const isAuthenticated = await verifyAdmin(req);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // แปลง id จาก string เป็น number
    const videoId = parseInt(params.id);
    if (isNaN(videoId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid video ID' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีวิดีโอนี้อยู่จริงหรือไม่
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { codeUsages: true }
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    // ลบข้อมูลที่เกี่ยวข้องใน CodeUsage ก่อน
    await prisma.codeUsage.deleteMany({
      where: {
        videoId: videoId,
      },
    });

    // ลบวิดีโอ
    await prisma.video.delete({
      where: {
        id: videoId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Video and related data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error deleting video',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// สำหรับการดึงข้อมูลวิดีโอเดียว (ถ้าต้องการ)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAdmin(req);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const videoId = parseInt(params.id);
    if (isNaN(videoId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        codeUsages: true
      }
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    // แปลงข้อมูลให้ปลอดภัยสำหรับ JSON
    const formattedVideo = {
      ...video,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      price: video.price.toString(),
    };

    return NextResponse.json({ success: true, video: formattedVideo });

  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching video',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
