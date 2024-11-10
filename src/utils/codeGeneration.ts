// src/utils/codeGeneration.ts

import { v4 as uuidv4 } from 'uuid';

// ฟังก์ชันสำหรับสร้างโค๊ดใหม่
export function generateCode(): string {
  // สร้างโค๊ดสั้น ๆ จาก UUID และแปลงเป็นตัวพิมพ์ใหญ่เพื่อความสวยงาม
  return uuidv4().split('-')[0].toUpperCase();
}
