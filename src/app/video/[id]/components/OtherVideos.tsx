import React, { useEffect, useState } from 'react';
import { Grid, Card, Typography } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

interface Video {
    id: number;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
}

const OtherVideos: React.FC<{ currentVideoId: number }> = ({ currentVideoId }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/get-other-videos?excludeId=${currentVideoId}&limit=10`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setVideos(data.videos);
                } else {
                    console.error('Error fetching other videos:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error fetching other videos:', error);
            })
            .finally(() => setLoading(false));
    }, [currentVideoId]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <div>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                วิดีโออื่นๆ
            </Typography>
            <Grid container spacing={3}>
                {videos.map((video) => (
                    <Grid item xs={6} sm={4} md={3} key={video.id}>
                        <Link href={`/video/${video.id}`} style={{ textDecoration: 'none' }}>
                            <Card sx={{
                                height: '100%',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                                },
                                willChange: 'transform, box-shadow',
                            }}>
                                <div style={{
                                    position: 'relative',
                                    paddingTop: '71.43%', // 5:7 aspect ratio
                                    backgroundColor: '#0a0a0a'
                                }}>
                                    <Image
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        fill
                                        style={{
                                            objectFit: 'cover',
                                        }}
                                        unoptimized
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '100%',
                                        background: 'rgba(0, 0, 0, 0.6)',
                                        color: '#fff',
                                        padding: '8px',
                                        boxSizing: 'border-box',
                                    }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {video.title}
                                        </Typography>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default OtherVideos;
