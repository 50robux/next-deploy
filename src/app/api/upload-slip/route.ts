// src/app/api/upload-slip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { PAYMENT_CONFIG, ERROR_MESSAGES } from '@/config/payment';
import axios from 'axios';
import { generateCode } from '@/utils/codeGeneration';

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const slip = data.get('slip') as File;
        const selectedOption = parseInt(data.get('selectedOption') as string) || 1;
        const videoId = parseInt(data.get('videoId') as string);
        const maxUsage = selectedOption;

        // Log ข้อมูลที่ได้รับจาก form
        console.log('ข้อมูลที่ได้รับจาก form:', {
            slipName: slip?.name,
            slipSize: slip?.size,
            slipType: slip?.type,
            selectedOption,
            videoId,
            maxUsage,
            expectedAmount: selectedOption * PAYMENT_CONFIG.PRICE_PER_VIDEO
        });

        if (!slip || !videoId) {
            console.error('ข้อมูลไม่ครบ:', { slip: !!slip, videoId });
            return NextResponse.json({ 
                success: false, 
                message: ERROR_MESSAGES.MISSING_DATA 
            });
        }

        const expectedAmount = selectedOption * PAYMENT_CONFIG.PRICE_PER_VIDEO;

        // แปลงไฟล์สลิปเป็น Base64
        const slipArrayBuffer = await slip.arrayBuffer();
        const slipBase64 = Buffer.from(slipArrayBuffer).toString('base64');
        const slipHash = crypto.createHash('sha256').update(slipBase64).digest('hex');

        console.log('ข้อมูลสลิป:', {
            slipHash: slipHash.substring(0, 10) + '...', // แสดงแค่บางส่วนเพื่อความปลอดภัย
            base64Length: slipBase64.length
        });

        // ตรวจสอบสลิปซ้ำ
        const existingPayment = await prisma.payment.findFirst({
            where: { slipHash: slipHash }
        });

        if (existingPayment) {
            console.error('พบสลิปซ้ำ:', {
                slipHash: slipHash.substring(0, 10) + '...',
                existingPaymentId: existingPayment.id,
                paymentDate: existingPayment.createdAt
            });
            return NextResponse.json({
                success: false,
                message: ERROR_MESSAGES.DUPLICATE_SLIP
            });
        }

        // เพิ่ม log ก่อนเรียก API
        console.log('กำลังเรียก EasySlip API...');

        // ตรวจสอบสลิป
        const verificationResult = await verifySlipWithEasySlip(slipBase64);

        // Log ผลการตรวจสอบ
        console.log('ผลการตรวจสอบสลิป:', {
            success: verificationResult.success,
            data: verificationResult.data ? {
                amount: verificationResult.data.amount,
                date: verificationResult.data.date,
                receiver: verificationResult.data.receiver,
                sender: verificationResult.data.sender,
                // เพิ่มข้อมูลอื่นๆ ที่ต้องการตรวจสอบ
            } : 'ไม่มีข้อมูล'
        });

        if (!verificationResult.success) {
            return NextResponse.json({ 
                success: false, 
                message: ERROR_MESSAGES.GENERIC 
            });
        }

        // ตรวจสอบจำนวนเงินและเวลา
        const amountInSlip = parseFloat(verificationResult.data.amount.amount);
        const slipDateTime = new Date(verificationResult.data.date);
        const currentTime = new Date();
        const hoursDifference = (currentTime.getTime() - slipDateTime.getTime()) / (1000 * 60 * 60);

        console.log('ตรวจสอบจำนวนเงินและเวลา:', {
            expectedAmount,
            amountInSlip,
            difference: Math.abs(amountInSlip - expectedAmount),
            slipDateTime,
            currentTime,
            hoursDifference
        });

        if (Math.abs(amountInSlip - expectedAmount) > 0.01) {
            console.error('จำนวนเงินไม่ตรง:', {
                expected: expectedAmount,
                received: amountInSlip,
                difference: Math.abs(amountInSlip - expectedAmount)
            });
            return NextResponse.json({
                success: false,
                message: ERROR_MESSAGES.INVALID_AMOUNT
            });
        }

        // ตรวจสอบเวลาว่าสลิปยังไม่หมดอายุ
        if (hoursDifference > PAYMENT_CONFIG.SLIP_EXPIRATION_HOURS) {
            console.error('สลิปหมดอายุ:', {
                slipDateTime,
                currentTime,
                hoursDifference
            });
            return NextResponse.json({
                success: false,
                message: ERROR_MESSAGES.EXPIRED_SLIP
            });
        }

        // สร้างหรือดึงข้อมูล Code ที่เกี่ยวข้อง
        let code = await prisma.code.findFirst({
            where: { maxUsage: selectedOption, usages: { lt: selectedOption } }
        });

        if (!code) {
            // หากไม่มี Code ที่ตรงเงื่อนไข ให้สร้างใหม่
            code = await prisma.code.create({
                data: {
                    code: generateCode(),
                    maxUsage: selectedOption,
                    usages: 0,
                }
            });
        }

        // บันทึกข้อมูลการชำระเงิน
        const payment = await prisma.payment.create({
            data: {
                codeId: code.id,
                verificationData: verificationResult.data,
                slipHash: slipHash,
                amount: expectedAmount,
                status: 'COMPLETED' // เปลี่ยนจาก 'PENDING' เป็น 'COMPLETED'
            }
        });

        // เพิ่มการใช้งาน Code
        await prisma.codeUsage.create({
            data: {
                codeId: code.id,
                videoId: videoId,
            }
        });

        // เพิ่มการนับการใช้งาน
        await prisma.code.update({
            where: { id: code.id },
            data: { usages: { increment: 1 } }
        });

        // สร้าง response และตั้งค่า session_code ในคุกกี้
        const response = NextResponse.json({
            success: true,
            message: 'การชำระเงินสำเร็จ',
            code: code.code,
            shouldReload: true  // เพิ่ม flag สำหรับบอกว่าควร reload หน้า
            });
            
            response.cookies.set('session_code', code.code, {
            httpOnly: false,
            sameSite: 'lax',
            path: '/',
            maxAge: PAYMENT_CONFIG.COOKIE_MAX_AGE,
            });
            
            return response;

    } catch (error) {
        console.error('การประมวลผลการชำระเงินผิดพลาด:', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        return NextResponse.json({
            success: false,
            message: ERROR_MESSAGES.GENERIC
        });
    }
}

async function verifySlipWithEasySlip(slipImageBase64: string) {
    try {
        // ตรวจสอบค่า configuration ที่จำเป็น
        if (!PAYMENT_CONFIG.VALID_ACCOUNT.promptPayNumber) {
            console.error('ไม่พบการกำหนดค่าเลขพร้อมเพย์');
            return { success: false };
        }

        console.log('กำลังส่งข้อมูลไปยัง EasySlip...');
        
        const response = await axios.post(
            'https://developer.easyslip.com/api/v1/verify',
            { image: slipImageBase64 },
            {
                headers: {
                    Authorization: `Bearer ${process.env.EASYSPLIP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('การตอบกลับจาก EasySlip:', {
            status: response.data.status,
            hasData: !!response.data.data,
            responseData: response.data
        });

        if (response.data.status === 200 && response.data.data) {
            const receiverInfo = response.data.data.receiver?.account?.name;
            
            console.log('ข้อมูลผู้รับเงิน:', {
                receiverInfo,
                expectedReceiver: PAYMENT_CONFIG.VALID_ACCOUNT.accountName,
                receiverProxy: response.data.data.receiver?.account?.proxy
            });

            if (!receiverInfo) {
                console.error('ไม่พบข้อมูลผู้รับเงิน');
                return { success: false };
            }

            const isValidReceiver = 
                receiverInfo.th === PAYMENT_CONFIG.VALID_ACCOUNT.accountName.th ||
                receiverInfo.en === PAYMENT_CONFIG.VALID_ACCOUNT.accountName.en;

            console.log('ผลการตรวจสอบผู้รับเงิน:', {
                isValid: isValidReceiver,
                received: receiverInfo,
                expected: PAYMENT_CONFIG.VALID_ACCOUNT.accountName
            });

            if (!isValidReceiver) {
                console.error('ชื่อบัญชีผู้รับเงินไม่ถูกต้อง');
                return { success: false };
            }

            // ตรวจสอบเลขพร้อมเพย์
            const receiverProxy = response.data.data.receiver?.account?.proxy;
            if (receiverProxy?.account) {
                // แปลง format xxx-xxx-8872 เป็น 0925658872
                const receivedNumber = receiverProxy.account.replace(/-/g, '').replace(/xxx/g, '0925');
                
                console.log('ตรวจสอบเลขพร้อมเพย์:', {
                    expected: PAYMENT_CONFIG.VALID_ACCOUNT.promptPayNumber,
                    received: receivedNumber
                });

                // ตรวจสอบว่าลงท้ายด้วยเลขเดียวกันหรือไม่
                const expectedLast4Digits = PAYMENT_CONFIG.VALID_ACCOUNT.promptPayNumber.slice(-4);
                const receivedLast4Digits = receivedNumber.slice(-4);

                if (expectedLast4Digits !== receivedLast4Digits) {
                    console.error('เลขพร้อมเพย์ไม่ถูกต้อง');
                    return { success: false };
                }
            } else {
                console.error('ไม่พบเลขพร้อมเพย์ในข้อมูลผู้รับเงิน');
                return { success: false };
            }

            return { success: true, data: response.data.data };
        }

        console.error('การตรวจสอบไม่ผ่าน:', response.data);
        return { success: false };
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการตรวจสอบสลิป:', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        return { success: false };
    }
}
