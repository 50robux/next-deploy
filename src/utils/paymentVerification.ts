// src/utils/paymentVerification.ts

import { Prisma } from '@prisma/client';

export type VerificationData = Prisma.JsonObject;

// ฟังก์ชันจำลองการตรวจสอบสลิป
export async function verifyPaymentSlip(slipFile: File): Promise<VerificationData | null> {
  // จำลองข้อมูลการตรวจสอบ
  const verificationData: VerificationData = {
    payload: '...จำลองข้อมูล...',
    transRef: '1234567890',
    date: new Date().toISOString(),
    countryCode: 'TH',
    amount: {
      amount: 1000,
      local: {
        amount: 1000,
        currency: '764',
      },
    },
    fee: 0,
    ref1: '',
    ref2: '',
    ref3: '',
    sender: {
      bank: {
        id: '004',
        name: 'ธนาคารกสิกรไทย',
        short: 'KBANK',
      },
      account: {
        name: {
          th: 'นาย ตัวอย่าง',
          en: 'Mr. Example',
        },
        bank: {
          type: 'BANKAC',
          account: 'xxx-x-x1234-x',
        },
      },
    },
    receiver: {
      bank: {
        id: '002',
        name: 'ธนาคารกรุงเทพ',
        short: 'BBL',
      },
      account: {
        name: {
          th: 'นาย ตัวอย่าง',
          en: 'Mr. Example',
        },
        bank: {
          type: 'BANKAC',
          account: 'xxx-x-x5678-x',
        },
      },
    },
  };

  return verificationData;
}
