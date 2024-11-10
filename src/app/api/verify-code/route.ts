// src/app/api/verify-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { code, videoId } = await req.json();

  const codeData = await prisma.code.findUnique({
    where: { code },
  });

  if (!codeData) {
    return NextResponse.json({ success: false, message: 'รหัสโค๊ดไม่ถูกต้อง' });
  }

  if (codeData.usages >= codeData.maxUsage) {
    return NextResponse.json({ success: false, message: 'โค๊ดนี้ถูกใช้งานครบแล้ว' });
  }

  // อัปเดตการใช้งานโค๊ด
  const updatedCode = await prisma.code.update({
    where: { code },
    data: { usages: { increment: 1 } },
  });

  // สร้างบันทึกการใช้งานโค๊ดกับวิดีโอ
  await prisma.codeUsage.create({
    data: {
      codeId: codeData.id,
      videoId: videoId,
    },
  });

  const remainingUsages = updatedCode.maxUsage - updatedCode.usages;

  // บันทึกโค๊ดในคุกกี้
  const response = NextResponse.json({ success: true, remainingUsages });
  response.cookies.set('session_code', code, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 สัปดาห์
  });

  return response;
}
