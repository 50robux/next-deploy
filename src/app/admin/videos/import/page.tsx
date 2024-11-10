// src/app/admin/videos/import/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    Input,
    Alert,
    Grid,
    Link,
    CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import Papa from 'papaparse';

export default function ImportVideosPage() {
    const [file, setFile] = useState<File | null>(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const downloadSample = async () => {
        try {
            const response = await fetch('/api/admin/videos/sample');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sample_videos.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading sample:', error);
            setAlertMessage('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ตัวอย่าง');
            setAlertSeverity('error');
        }
    };

    const handleImport = () => {
        if (!file) {
            setAlertMessage('กรุณาเลือกไฟล์ CSV ที่ต้องการนำเข้า');
            setAlertSeverity('error');
            return;
        }

        setLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                try {
                    const data = results.data;
                    const res = await fetch('/api/admin/videos/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ videos: data }),
                    });

                    const response = await res.json();

                    if (response.success) {
                        setAlertMessage('นำเข้าข้อมูลสำเร็จ');
                        setAlertSeverity('success');
                        setTimeout(() => router.push('/admin/videos'), 2000);
                    } else {
                        setAlertMessage('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
                        setAlertSeverity('error');
                    }
                } catch (error) {
                    setAlertMessage('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
                    setAlertSeverity('error');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    return (
        <Container maxWidth="md">
            <Box mt={4}>
                <Paper elevation={3} sx={{ padding: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        นำเข้าวิดีโอด้วยไฟล์ CSV
                    </Typography>

                    {alertMessage && (
                        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
                            {alertMessage}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={downloadSample}
                                sx={{ mb: 2 }}
                            >
                                ดาวน์โหลดไฟล์ CSV ตัวอย่าง
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                }}
                            >
                                <Input
                                    type="file"
                                    inputProps={{ accept: '.csv' }}
                                    onChange={handleFileChange}
                                    sx={{ display: 'none' }}
                                    id="csv-file-input"
                                />
                                <label htmlFor="csv-file-input">
                                    <Button
                                        component="span"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                    >
                                        เลือกไฟล์ CSV
                                    </Button>
                                </label>
                                {file && (
                                    <Typography sx={{ mt: 2 }}>
                                        ไฟล์ที่เลือก: {file.name}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleImport}
                                disabled={!file || loading}
                                startIcon={loading && <CircularProgress size={20} />}
                                fullWidth
                            >
                                {loading ? 'กำลังนำเข้าข้อมูล...' : 'นำเข้าข้อมูล'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Container>
    );
}
