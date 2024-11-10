// src/config/payment.ts

interface PaymentConfig {
    VALID_ACCOUNT: {
        promptPayNumber: string;
        accountName: {
            th: string;
            en: string;
        };
    };
    PRICE_PER_VIDEO: number;
    SLIP_EXPIRATION_HOURS: number;
    COOKIE_MAX_AGE: number;
}

// ตรวจสอบค่าที่จำเป็นต้องมี
if (!process.env.PROMPTPAY_NUMBER) {
    throw new Error('PROMPTPAY_NUMBER is not defined in environment variables');
}
if (!process.env.ACCOUNT_NAME_TH) {
    throw new Error('ACCOUNT_NAME_TH is not defined in environment variables');
}
if (!process.env.ACCOUNT_NAME_EN) {
    throw new Error('ACCOUNT_NAME_EN is not defined in environment variables');
}
if (!process.env.PRICE_PER_VIDEO) {
    throw new Error('PRICE_PER_VIDEO is not defined in environment variables');
}
if (!process.env.SLIP_EXPIRATION_HOURS) {
    throw new Error('SLIP_EXPIRATION_HOURS is not defined in environment variables');
}
if (!process.env.COOKIE_MAX_AGE) {
    throw new Error('COOKIE_MAX_AGE is not defined in environment variables');
}

export const PAYMENT_CONFIG: PaymentConfig = {
    VALID_ACCOUNT: {
        promptPayNumber: process.env.PROMPTPAY_NUMBER,
        accountName: {
            th: process.env.ACCOUNT_NAME_TH,
            en: process.env.ACCOUNT_NAME_EN
        }
    },
    PRICE_PER_VIDEO: Number(process.env.PRICE_PER_VIDEO) || 9,
    SLIP_EXPIRATION_HOURS: Number(process.env.SLIP_EXPIRATION_HOURS) || 24,
    COOKIE_MAX_AGE: Number(process.env.COOKIE_MAX_AGE) || 604800, // 7 days
};

export const ERROR_MESSAGES = {
    GENERIC: 'สลิปไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
    MISSING_DATA: 'ข้อมูลไม่ครบถ้วน',
    DUPLICATE_SLIP: 'สลิปนี้เคยถูกใช้แล้ว',
    INVALID_AMOUNT: 'จำนวนเงินไม่ถูกต้อง',
    EXPIRED_SLIP: 'สลิปหมดอายุ',
    INVALID_RECEIVER: 'ข้อมูลผู้รับเงินไม่ถูกต้อง'
};
