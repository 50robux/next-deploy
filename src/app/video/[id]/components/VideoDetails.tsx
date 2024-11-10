import React from 'react';
import { Typography, Box, Button } from '@mui/material';

interface VideoDetailsProps {
    title: string;
    description: string;
    price: number;
    isUnlocked: boolean;
    sessionCode: string | null;
    handleOpenUnlockPopup: () => void;
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ title, description, price, isUnlocked, sessionCode, handleOpenUnlockPopup }) => {
    return (
        <Box sx={{ padding: 2, marginBottom: 3 }}>
            <Typography variant="h4" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body1" gutterBottom color="text.secondary">
                {description}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
                ราคา: {price} บาท
            </Typography>

            {!isUnlocked && (
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleOpenUnlockPopup}
                    sx={{
                        marginTop: 2,
                        padding: '10px 20px',
                        borderRadius: (theme) => theme.shape.borderRadius,
                        boxShadow: (theme) => theme.shadows[4],
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.secondary.dark,
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    ปลดล็อค
                </Button>
            )}
        </Box>
    );
};

export default VideoDetails;
