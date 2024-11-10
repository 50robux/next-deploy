'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { NotificationContext } from '../../../../contexts/NotificationContext';

interface PaymentPopupProps {
    onSuccess: (code: string) => void;
    onCancel: () => void;
    videoId: number;
}

const PaymentPopup: React.FC<PaymentPopupProps> = ({ onSuccess, onCancel, videoId }) => {
    const [selectedOption, setSelectedOption] = useState<number>(1);
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const { showNotification } = useContext(NotificationContext);

    const pricePerVideo = 9;

    useEffect(() => {
        generateQRCode();
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [selectedOption]);

    const generateQRCode = async () => {
        try {
            const response = await fetch('/api/generate-promptpay-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: selectedOption * pricePerVideo }),
            });
            const data = await response.json();
            if (data.qrCodeImage) {
                setQrCodeUrl(data.qrCodeImage);
            } else {
                showNotification('ไม่สามารถสร้าง QR Code ได้', 'error');
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            showNotification('เกิดข้อผิดพลาดในการสร้าง QR Code', 'error');
        }
    };

    const handleUpload = async () => {
        if (!slipFile) {
            showNotification('กรุณาอัปโหลดสลิปการชำระเงิน', 'error');
            return;
        }

        setIsVerifying(true);
        const formData = new FormData();
        formData.append('slip', slipFile);
        formData.append('selectedOption', selectedOption.toString());
        formData.append('videoId', videoId.toString());

        try {
            const res = await fetch('/api/upload-slip', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                // เก็บข้อมูลใน localStorage
                localStorage.setItem('payment_notification', JSON.stringify({
                    message: 'ชำระเงินสำเร็จ',
                    severity: 'success',
                    timestamp: Date.now()
                }));

                onSuccess(data.code);
                window.location.reload();
            } else {
                showNotification(data.message || 'สลิปไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง', 'error');
            }
        } catch (error) {
            console.error('Error uploading slip:', error);
            showNotification('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
                return;
            }
            setSlipFile(file);
            setSelectedFileName(file.name);

            const newPreviewUrl = URL.createObjectURL(file);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(newPreviewUrl);
        }
    };

    return (
        <Dialog
            open={true}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown={isVerifying}
            onBackdropClick={(e) => {
                if (isVerifying) {
                    e.preventDefault();
                }
            }}
        >
            <DialogTitle>
                ชำระเงิน {selectedOption * pricePerVideo} บาท
                <IconButton
                    aria-label="close"
                    onClick={onCancel}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                    disabled={isVerifying}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="video-select-label">จำนวนวิดีโอ</InputLabel>
                    <Select
                        labelId="video-select-label"
                        value={selectedOption}
                        label="จำนวนวิดีโอ"
                        onChange={(e) => setSelectedOption(Number(e.target.value))}
                        disabled={isVerifying}
                    >
                        <MenuItem value={1}>1 วิดีโอ ({pricePerVideo} บาท)</MenuItem>
                        <MenuItem value={5}>5 วิดีโอ ({pricePerVideo * 5} บาท)</MenuItem>
                        <MenuItem value={10}>10 วิดีโอ ({pricePerVideo * 10} บาท)</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ my: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        โปรดสแกนคิวอาร์โค้ดเพื่อชำระเงิน
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        {qrCodeUrl ? (
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        ) : (
                            <CircularProgress />
                        )}
                    </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="upload-slip"
                        type="file"
                        onChange={handleFileChange}
                        disabled={isVerifying}
                    />

                    <label htmlFor="upload-slip">
                        <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            startIcon={<CloudUploadIcon />}
                            disabled={isVerifying}
                        >
                            {selectedFileName || 'อัปโหลดสลิปการโอนเงิน'}
                        </Button>
                    </label>

                    {previewUrl && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <img
                                src={previewUrl}
                                alt="slip preview"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                            />
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleUpload}
                    variant="contained"
                    color="primary"
                    disabled={isVerifying || !slipFile}
                    fullWidth
                    sx={{
                        transition: 'background-color 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                    }}
                >
                    {isVerifying ? (
                        <>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            กำลังตรวจสอบ...
                        </>
                    ) : (
                        'ยืนยันการชำระเงิน'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentPopup;