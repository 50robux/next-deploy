'use client';

import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import VideoPlayer from './components/VideoPlayer';
import CodeInputPopup from './components/CodeInputPopup';
import PaymentPopup from './components/PaymentPopup';
import UnlockConfirmationPopup from './components/UnlockConfirmationPopup';
import OtherVideos from './components/OtherVideos';
import VideoDetails from './components/VideoDetails';
import { Box, Container, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { NotificationContext } from '../../../contexts/NotificationContext';

interface VideoProps {
    params: { id: string };
}

export default function VideoPage({ params }: VideoProps) {
    const [video, setVideo] = useState<any>(null);
    const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [sessionCode, setSessionCode] = useState<string | null>(null);
    const [remainingUsages, setRemainingUsages] = useState<number | null>(null);
    const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);
    const [pendingCode, setPendingCode] = useState<string | null>(null);
    const [showUnlockConfirmation, setShowUnlockConfirmation] = useState(false);
    const [hasUserOpenedPopup, setHasUserOpenedPopup] = useState(false);

    const hasPopupBeenShownRef = useRef(false);
    const router = useRouter();
    const { showNotification } = useContext(NotificationContext);

    useEffect(() => {
        fetch(`/api/get-video?id=${params.id}`, {
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setVideo(data.video);
                    setIsUnlocked(data.isUnlocked);
                } else {
                    showNotification(data.message, 'error');
                }
            });

        fetch('/api/get-session-code', {
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.code) {
                    setSessionCode(data.code);
                    setRemainingUsages(data.remainingUsages);
                }
            });
    }, [params.id, showNotification]);

    const handleVideoEnd = useCallback(() => {
        if (!isUnlocked && !hasPopupBeenShownRef.current && !hasUserOpenedPopup) {
            if (sessionCode) {
                setShowUnlockConfirmation(true);
            } else {
                setShowCodeInput(true);
            }
            hasPopupBeenShownRef.current = true;
        }
    }, [isUnlocked, sessionCode, hasUserOpenedPopup]);

    const handleOpenUnlockPopup = useCallback(() => {
        if (sessionCode) {
            setShowUnlockConfirmation(true);
        } else {
            setShowCodeInput(true);
        }
        setHasUserOpenedPopup(true);
    }, [sessionCode]);

    const handleUnlockConfirm = useCallback(async () => {
        if (!video || !sessionCode) return;

        try {
            const res = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: sessionCode, videoId: video.id }),
            });
            const data = await res.json();
            if (data.success) {
                setRemainingUsages(data.remainingUsages);
                setIsUnlocked(true);
                setShowUnlockConfirmation(false);
                window.location.reload();
            } else {
                showNotification(data.message, 'error');
                setShowUnlockConfirmation(false);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('เกิดข้อผิดพลาดในการปลดล็อควิดีโอ', 'error');
        }
    }, [video, sessionCode, showNotification]);

    const handleRequestPurchase = useCallback(() => {
        setShowPayment(true);
        setShowUnlockConfirmation(false);
    }, []);

    const handleCodeSubmit = useCallback(
        async (code: string) => {
            if (!video) {
                showNotification('ข้อมูลวิดีโอยังไม่ได้รับ กรุณาลองใหม่อีกครั้ง', 'error');
                return;
            }

            try {
                const res = await fetch('/api/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, videoId: video.id }),
                });
                const data = await res.json();
                if (data.success) {
                    setSessionCode(code);
                    setRemainingUsages(data.remainingUsages);
                    setIsUnlocked(true);
                    setShowCodeInput(false);
                    // ตั้งค่าสถานะใน sessionStorage
                    sessionStorage.setItem('showCodeSuccessNotification', 'true');
                    window.location.reload();
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('เกิดข้อผิดพลาดในการตรวจสอบโค้ด', 'error');
            }
        },
        [video, showNotification]
    );

    const handlePaymentSuccess = useCallback(
        (code: string) => {
            setSessionCode(code);
            setShowPayment(false);
            setShowCodeInput(false);
            setIsUnlocked(true);
            // ตั้งค่าสถานะใน sessionStorage
            sessionStorage.setItem('showPaymentSuccessNotification', 'true');
            window.location.reload();
        },
        []
    );

    const handleRequestPayment = useCallback(() => {
        setShowPayment(true);
        setShowCodeInput(false);
    }, []);

    const handleCloseCodeInput = useCallback(() => {
        setShowCodeInput(false);
    }, []);

    const handleOpenCodeInput = useCallback(() => {
        if (sessionCode) {
            setShowReplaceConfirmation(true);
        } else {
            setShowCodeInput(true);
            hasPopupBeenShownRef.current = true;
        }
    }, [sessionCode]);

    const confirmReplaceCode = () => {
        setShowReplaceConfirmation(false);
        setPendingCode('replace');
        setShowCodeInput(true);
    };

    const cancelReplaceCode = () => {
        setShowReplaceConfirmation(false);
    };

    if (!video) {
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

    return (
        <Container maxWidth="md">
            <Box mt={4}>
                <VideoDetails
                    title={video.title}
                    description={video.description}
                    price={video.price}
                    isUnlocked={isUnlocked}
                    sessionCode={sessionCode}
                    handleOpenUnlockPopup={handleOpenUnlockPopup}
                />

                <VideoPlayer videoUrl={video.videoUrl} onEnd={handleVideoEnd} isUnlocked={isUnlocked} />

                {showCodeInput && (
                    <CodeInputPopup
                        onSubmit={handleCodeSubmit}
                        onRequestPayment={handleRequestPayment}
                        onClose={handleCloseCodeInput}
                        isReplacing={pendingCode === 'replace'}
                    />
                )}

                {showPayment && (
                    <PaymentPopup
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => {
                            setShowPayment(false);
                            setShowCodeInput(false);
                        }}
                        videoId={video.id}
                    />
                )}

                {showUnlockConfirmation && (
                    <UnlockConfirmationPopup
                        onConfirm={handleUnlockConfirm}
                        onRequestPurchase={handleRequestPurchase}
                        onClose={() => setShowUnlockConfirmation(false)}
                        remainingUsages={remainingUsages}
                    />
                )}
            </Box>

            <Box mt={6} mb={4}>
                <OtherVideos currentVideoId={video.id} />
            </Box>

            <Dialog open={showReplaceConfirmation} onClose={cancelReplaceCode} TransitionComponent={Fade}>
                <DialogTitle>ยืนยันการเปลี่ยนแปลงรหัสโค๊ด</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณกำลังมีรหัสโค๊ดที่ใช้งานอยู่ ท่านต้องการที่จะเปลี่ยนรหัสโค๊ดใหม่แทนรหัสเดิมหรือไม่?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelReplaceCode} variant="outlined" color="secondary">
                        ยกเลิก
                    </Button>
                    <Button onClick={confirmReplaceCode} variant="contained" color="primary">
                        ยืนยัน
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
