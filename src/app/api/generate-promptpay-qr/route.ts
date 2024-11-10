// src/app/api/generate-promptpay-qr/route.ts

import { NextResponse } from 'next/server';
import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  const body = await req.json();
  const { amount } = body;

  try {
    const mobileNumber = '0925658872'; // หมายเลข PromptPay ของคุณ
    const payload = generatePayload(mobileNumber, { amount: parseFloat(amount) });
    const qrCodeImage = await QRCode.toDataURL(payload);

    return NextResponse.json({ qrCodeImage });
  } catch (error) {
    console.error('Generate PromptPay QR error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
