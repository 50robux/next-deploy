'use client';

import { ReactNode, useEffect, useState, useContext, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import {
    Button,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Container,
    AppBar,
    Toolbar,
    Fade,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { NotificationContext } from '../contexts/NotificationContext';
import { usePathname } from 'next/navigation';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
    const [sessionCode, setSessionCode] = useState<string | null>(null);
    const [remainingUsages, setRemainingUsages] = useState<number | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { showNotification } = useContext(NotificationContext);
    const notificationShown = useRef(false);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    useEffect(() => {
        if (isAdminPage) return; // Skip for admin pages

        // Check notifications
        const notifications = [
            {
                key: 'showSuccessNotification',
                message: 'ยกเลิกรหัสโค๊ดเรียบร้อยแล้ว'
            },
            {
                key: 'showCodeSuccessNotification',
                message: 'กรอกรหัสโค๊ดสำเร็จ'
            },
            {
                key: 'showPaymentSuccessNotification',
                message: 'ชำระเงินสำเร็จ'
            }
        ];

        notifications.forEach(({ key, message }) => {
            const notification = sessionStorage.getItem(key);
            if (notification) {
                showNotification(message, 'success');
                sessionStorage.removeItem(key);
            }
        });

        // Fetch session code
        const fetchSessionCode = async () => {
            try {
                const response = await fetch('/api/get-session-code', {
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.code) {
                    setSessionCode(data.code);
                    setRemainingUsages(data.remainingUsages);

                    const notificationShown = sessionStorage.getItem('notificationShown');
                    if (!notificationShown) {
                        if (data.remainingUsages <= 1 && data.remainingUsages > 0) {
                            showNotification(
                                'การใช้งานโค้ดของคุณใกล้จะหมดแล้ว กรุณาซื้อโค้ดเพิ่มเพื่อปลดล็อควิดีโอเพิ่มเติม',
                                'warning'
                            );
                            sessionStorage.setItem('notificationShown', 'true');
                        } else if (data.remainingUsages === 0) {
                            showNotification(
                                'โค้ดของคุณไม่สามารถปลดล็อควิดีโอได้อีกแล้ว กรุณาซื้อโค้ดใหม่เพื่อปลดล็อควิดีโอเพิ่มเติม',
                                'error'
                            );
                            sessionStorage.setItem('notificationShown', 'true');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching session code:', error);
                showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
            }
        };

        fetchSessionCode();
    }, [showNotification, isAdminPage]);

    const handleCancelCode = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmCancel = async () => {
        try {
            const response = await fetch('/api/cancel-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success) {
                setSessionCode(null);
                setRemainingUsages(null);
                sessionStorage.setItem('showSuccessNotification', 'true');
                setShowConfirmDialog(false);
                window.location.reload();
            } else {
                showNotification('เกิดข้อผิดพลาดในการยกเลิกรหัสโค๊ด', 'error');
            }
        } catch (error) {
            console.error('Error canceling code:', error);
            showNotification('เกิดข้อผิดพลาดในการยกเลิกรหัสโค๊ด', 'error');
        }
    };

    const handleCloseDialog = () => {
        setShowConfirmDialog(false);
        // Focus กลับไปที่ main content
        if (mainContentRef.current) {
            mainContentRef.current.focus();
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {!isAdminPage && sessionCode && (
                <AppBar
                    position="fixed"
                    color="primary"
                    elevation={0}
                    component="nav"
                    role="navigation"
                >
                    <Toolbar
                        sx={{
                            minHeight: { xs: '56px', sm: '64px' },
                            px: { xs: 1, sm: 2 }
                        }}
                    >
                        <Container
                            maxWidth="lg"
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: { xs: 1, sm: 2 }
                            }}
                        >
                            <Typography
                                variant="body1"
                                component="div"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                <span>
                                    รหัสโค๊ด: <strong>{sessionCode}</strong>
                                </span>
                                <span>|</span>
                                <span>
                                    ปลดล็อคเหลือ: <strong>{remainingUsages}</strong>
                                </span>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    onClick={handleCancelCode}
                                    aria-label="ยกเลิกรหัสโค๊ด"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        padding: {
                                            xs: '4px 8px',
                                            sm: '6px 16px'
                                        },
                                        minWidth: { xs: '120px', sm: '140px' },
                                        fontSize: {
                                            xs: '0.75rem',
                                            sm: '0.875rem'
                                        },
                                        boxShadow: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: { xs: 0.5, sm: 1 },
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                            boxShadow: 'none',
                                        },
                                    }}
                                >
                                    <CancelIcon sx={{
                                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                                    }} />
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontSize: {
                                                xs: '0.75rem',
                                                sm: '0.875rem'
                                            }
                                        }}
                                    >
                                        ยกเลิกรหัสโค๊ด
                                    </Typography>
                                </Button>
                            </Box>
                        </Container>
                    </Toolbar>
                </AppBar>
            )}

            <Box
                ref={mainContentRef}
                component="main"
                tabIndex={-1}
                role="main"
                sx={{
                    paddingTop: !isAdminPage && sessionCode ? { xs: '56px', sm: '64px' } : 0,
                    minHeight: '100vh',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    outline: 'none', // ลบ outline เมื่อได้รับ focus
                }}
            >
                {children}
            </Box>

            {!isAdminPage && (
                <Dialog
                    open={showConfirmDialog}
                    onClose={handleCloseDialog}
                    TransitionComponent={Fade}
                    aria-labelledby="confirm-dialog-title"
                    aria-describedby="confirm-dialog-description"
                    keepMounted={false}
                    disablePortal
                    sx={{
                        '& .MuiDialog-paper': {
                            width: { xs: '90%', sm: 'auto' },
                            m: { xs: 2, sm: 3 }
                        }
                    }}
                >
                    <DialogTitle id="confirm-dialog-title" sx={{
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}>
                        ยืนยันการยกเลิกรหัสโค๊ด
                    </DialogTitle>
                    <DialogContent>
                        <Typography
                            id="confirm-dialog-description"
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            คุณต้องการยกเลิกรหัสโค๊ดนี้ใช่หรือไม่?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{
                        padding: { xs: 2, sm: 3 }
                    }}>
                        <Button
                            onClick={handleCloseDialog}
                            color="primary"
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleConfirmCancel}
                            color="error"
                            variant="contained"
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            ยืนยันการยกเลิกรหัสโค๊ด
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </ThemeProvider>
    );
}
