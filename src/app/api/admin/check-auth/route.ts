import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    // สร้าง secret key จาก JWT_SECRET
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // ตรวจสอบ token
    await jose.jwtVerify(token, secret);
    
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ authenticated: false });
  }
}
