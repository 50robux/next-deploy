// src/app/api/cancel-code/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.cookies.set('session_code', '', {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // ทำให้คุกกี้หมดอายุ
  });
  
  return response;
}
