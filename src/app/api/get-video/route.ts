// src/app/api/get-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, message: 'ไม่มีไอดีวิดีโอ' }, { status: 400 });
    }

    const videoId = parseInt(id);
    if (isNaN(videoId)) {
        return NextResponse.json({ success: false, message: 'ไอดีวิดีโอไม่ถูกต้อง' }, { status: 400 });
    }

    try {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              videoUrl: true,
              thumbnailUrl: true, // เพิ่ม thumbnailUrl
            },
          });

        if (!video) {
            return NextResponse.json({ success: false, message: 'ไม่พบวิดีโอ' }, { status: 404 });
        }

        // ดึง session_code จากคุกกี้
        const sessionCode = req.cookies.get('session_code')?.value || null;

        let isUnlocked = false;

        if (sessionCode) {
            const codeData = await prisma.code.findUnique({
                where: { code: sessionCode },
            });

            if (codeData) {
                // ตรวจสอบว่าโค๊ดนี้ได้ปลดล็อควิดีโอนี้หรือไม่
                const codeUsage = await prisma.codeUsage.findFirst({
                    where: {
                        codeId: codeData.id,
                        videoId: videoId,
                    },
                });
                isUnlocked = !!codeUsage;
            }
        }

        return NextResponse.json({ success: true, video, isUnlocked });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลวิดีโอ' }, { status: 500 });
    }
}
