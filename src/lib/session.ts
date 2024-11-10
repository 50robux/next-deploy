// src/lib/session.ts

'use server';

import { cookies } from 'next/headers';

export function setSessionCode(code: string) {
  cookies().set('session_code', code, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 สัปดาห์
  });
}

export function getSessionCode() {
  return cookies().get('session_code')?.value || null;
}
