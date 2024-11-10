'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  CircularProgress,
  Box,
  Typography,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { NotificationContext } from '../contexts/NotificationContext';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    // ดึงข้อมูลวิดีโอแรกจากฐานข้อมูลผ่าน Public API
    fetch('/api/videos')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.videos && data.videos.length > 0) {
          // นำทางไปยังวิดีโอแรกที่พบ
          router.push(`/video/${data.videos[0].id}`);
        } else {
          // ถ้าไม่มีวิดีโอ แสดงข้อความหรือนำทางไปหน้าอื่น
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching videos:', error);
        showNotification('เกิดข้อผิดพลาดในการดึงข้อมูลวิดีโอ', 'error');
        setIsLoading(false);
      });
  }, [router, showNotification]);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
          }}
        >
          <CircularProgress size={60} color="primary" />
          <Typography variant="h6" color="text.secondary">
            กำลังโหลด...
          </Typography>
        </Box>
      </Container>
    );
  }

  // ถ้าไม่มีวิดีโอในระบบ
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
          textAlign: 'center',
          padding: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          ไม่พบวิดีโอในระบบ
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          กรุณาลองใหม่อีกครั้งในภายหลัง หรือดูวิดีโออื่น ๆ
        </Typography>
        <Button variant="contained" color="primary" component={Link} href="/">
          กลับไปหน้าหลัก
        </Button>
      </Box>
    </Container>
  );
}
