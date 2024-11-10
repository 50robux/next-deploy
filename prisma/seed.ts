import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  // Add sample videos
  await prisma.video.createMany({
    data: [
      {
        title: 'วิดีโอตัวอย่าง 1',
        description: 'นี่คือวิดีโอตัวอย่างสำหรับการทดสอบ',
        price: 9.0,
        videoUrl: 'https://e2.deah.live/video1/playlist.m3u8',
        thumbnailUrl: 'https://via.placeholder.com/300x200.png?text=Thumbnail+1',
      },
      {
        title: 'วิดีโอตัวอย่าง 2',
        description: 'นี่คือวิดีโอตัวอย่างสำหรับการทดสอบ',
        price: 9.0,
        videoUrl: 'https://e2.deah.live/video2/playlist.m3u8',
        thumbnailUrl: 'https://via.placeholder.com/300x200.png?text=Thumbnail+2',
      },
      // Add more videos as needed...
    ],
    skipDuplicates: true,
  });

  // Check if an admin already exists
  const existingAdmin = await prisma.admin.findFirst({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('124312Y');

    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });

    console.log('สร้างบัญชี Admin เรียบร้อยแล้ว 🛡️');
  }

  console.log('เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
