// src/app/api/admin/videos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const isAuthenticated = await verifyAdmin(req);

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const videoId = parseInt(params.id);
  if (isNaN(videoId)) {
    return NextResponse.json({ success: false, message: 'Invalid video ID' }, { status: 400 });
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error fetching video' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const isAuthenticated = await verifyAdmin(req);

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const videoId = parseInt(params.id);
  if (isNaN(videoId)) {
    return NextResponse.json({ success: false, message: 'Invalid video ID' }, { status: 400 });
  }

  const { title, description, price, videoUrl, thumbnailUrl } = await req.json();

  if (!title || !price || !videoUrl || !thumbnailUrl) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        title,
        description,
        price: parseFloat(price),
        videoUrl,
        thumbnailUrl,
      },
    });

    return NextResponse.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error updating video' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAuthenticated = await verifyAdmin(req);

  if (!isAuthenticated) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const videoId = parseInt(params.id);
  if (isNaN(videoId)) {
    return NextResponse.json({ success: false, message: 'Invalid video ID' }, { status: 400 });
  }

  try {
    // ตรวจสอบว่ามีวิดีโอนี้อยู่จริงหรือไม่
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { codeUsages: true }
    });

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
    }

    // ลบข้อมูลที่เกี่ยวข้องใน CodeUsage ก่อน
    await prisma.codeUsage.deleteMany({
      where: {
        videoId: videoId,
      },
    });

    // จากนั้นจึงลบวิดีโอ
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