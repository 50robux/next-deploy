// src/app/api/get-session-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie');
  const cookies = cookieHeader?.split('; ').reduce((acc, current) => {
    const [name, ...rest] = current.split('=');
    acc[name] = rest.join('=');
    return acc;
  }, {} as Record<string, string>);

  const sessionCode = req.cookies.get('session_code')?.value || null;

  let remainingUsages = null;

  if (sessionCode) {
    const codeData = await prisma.code.findUnique({
      where: { code: sessionCode },
    });

    if (codeData) {
      remainingUsages = codeData.maxUsage - codeData.usages;
      if (remainingUsages < 0) remainingUsages = 0;
    }
  }

  return NextResponse.json({ code: sessionCode, remainingUsages });
}
