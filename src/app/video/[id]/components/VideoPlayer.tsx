import React, { useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Hls from 'hls.js';

interface VideoPlayerProps {
    videoUrl: string;
    onEnd: () => void;
    isUnlocked: boolean;
}

const StyledVideo = styled('video')(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
}));

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ videoUrl, onEnd, isUnlocked }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Initialize Hls.js
        if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(videoUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS.js error:', data);
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
        } else {
            console.error('เบราว์เซอร์นี้ไม่รองรับ HLS');
        }

        return () => {
            // Cleanup Hls.js
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // ฟังก์ชันเพื่อป้องกันการ seek
        const preventSeeking = () => {
            if (!isUnlocked && video.currentTime > 0) {
                video.currentTime = 0;
            }
        };

        // ฟังก์ชัน handleTimeUpdate
        const handleTimeUpdate = () => {
            if (!isUnlocked && video.currentTime >= 5) {
                video.pause();
                video.currentTime = 0;
                video.removeEventListener('timeupdate', handleTimeUpdate);
                onEnd();
            }
        };

        video.addEventListener('seeking', preventSeeking);
        video.addEventListener('timeupdate', handleTimeUpdate);

        // ตั้งค่า audio และ controls ตาม isUnlocked
        if (!isUnlocked) {
            video.muted = true;
            video.controls = false;
        } else {
            video.muted = false;
            video.controls = true;
        }

        // เริ่มเล่นวิดีโอ
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('เกิดข้อผิดพลาดในการเล่นวิดีโอ:', error);
                }
            });
        }

        return () => {
            video.removeEventListener('seeking', preventSeeking);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [isUnlocked, onEnd]);

    return (
        <StyledVideo
            ref={videoRef}
        />
    );
});

export default VideoPlayer;
