'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Box,
    Grid,
} from '@mui/material';

export default function EditVideoPage() {
    const [video, setVideo] = useState<any>(null);
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        fetch(`/api/admin/videos/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setVideo(data.video);
                } else {
                    alert('เกิดข้อผิดพลาดในการดึงข้อมูลวิดีโอ');
                }
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch(`/api/admin/videos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(video),
        });

        const data = await res.json();

        if (data.success) {
            router.push('/admin/videos');
        } else {
            alert('เกิดข้อผิดพลาดในการแก้ไขวิดีโอ');
        }
    };

    if (!video) return <div>กำลังโหลด...</div>;

    return (
        <Container maxWidth="md">
            <Box mt={4}>
                <Paper elevation={3} sx={{ padding: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        แก้ไขวิดีโอ
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="ชื่อวิดีโอ"
                                    variant="outlined"
                                    fullWidth
                                    value={video.title}
                                    onChange={(e) => setVideo({ ...video, title: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="คำอธิบาย"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    value={video.description}
                                    onChange={(e) => setVideo({ ...video, description: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="ราคา"
                                    variant="outlined"
                                    fullWidth
                                    type="number"
                                    value={video.price}
                                    onChange={(e) => setVideo({ ...video, price: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Video URL"
                                    variant="outlined"
                                    fullWidth
                                    value={video.videoUrl}
                                    onChange={(e) => setVideo({ ...video, videoUrl: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Thumbnail URL"
                                    variant="outlined"
                                    fullWidth
                                    value={video.thumbnailUrl}
                                    onChange={(e) => setVideo({ ...video, thumbnailUrl: e.target.value })}
                                />
                            </Grid>
                            {video.thumbnailUrl && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">ตัวอย่างภาพ Thumbnail:</Typography>
                                    <img src={video.thumbnailUrl} alt="Thumbnail Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary">
                                    บันทึกการแก้ไข
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}
