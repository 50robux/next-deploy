import { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error('JWT verification failed in verifyAdmin:', error);
    return false;
  }
}
