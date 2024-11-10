import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/utils/hash';
import * as jose from 'jose';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    return NextResponse.json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const isPasswordValid = await comparePassword(password, admin.password);

  if (!isPasswordValid) {
    return NextResponse.json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new jose.SignJWT({ adminId: admin.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);

  const response = NextResponse.json({ success: true });

  response.cookies.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
