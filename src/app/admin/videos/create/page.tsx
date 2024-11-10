'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Box,
    Grid,
} from '@mui/material';

export default function CreateVideoPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/admin/videos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, price, videoUrl, thumbnailUrl }),
        });

        const data = await res.json();

        if (data.success) {
            router.push('/admin/videos');
        } else {
            alert('เกิดข้อผิดพลาดในการเพิ่มวิดีโอ');
        }
    };

    return (
        <Container maxWidth="md">
            <Box mt={4}>
                <Paper elevation={3} sx={{ padding: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        เพิ่มวิดีโอใหม่
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="ชื่อวิดีโอ"
                                    variant="outlined"
                                    fullWidth
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="คำอธิบาย"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="ราคา"
                                    variant="outlined"
                                    fullWidth
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Video URL"
                                    variant="outlined"
                                    fullWidth
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Thumbnail URL"
                                    variant="outlined"
                                    fullWidth
                                    value={thumbnailUrl}
                                    onChange={(e) => setThumbnailUrl(e.target.value)}
                                />
                            </Grid>
                            {thumbnailUrl && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">ตัวอย่างภาพ Thumbnail:</Typography>
                                    <img src={thumbnailUrl} alt="Thumbnail Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary">
                                    บันทึก
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}
