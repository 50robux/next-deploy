import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface UnlockConfirmationPopupProps {
    onConfirm: () => void;
    onRequestPurchase: () => void;
    onClose: () => void;
    remainingUsages: number | null;
}

const UnlockConfirmationPopup: React.FC<UnlockConfirmationPopupProps> = ({
    onConfirm,
    onRequestPurchase,
    onClose,
    remainingUsages,
}) => {
    const canUnlock = remainingUsages && remainingUsages > 0;

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs" TransitionComponent={Fade}>
            <DialogTitle>
                {canUnlock ? 'ปลดล็อควิดีโอนี้หรือไม่?' : 'ไม่สามารถปลดล็อควิดีโอได้'}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {canUnlock ? (
                    <Typography variant="body1">
                        คุณมีโค้ดที่สามารถปลดล็อควิดีโอนี้ได้ ต้องการปลดล็อควิดีโอนี้หรือไม่?
                    </Typography>
                ) : (
                    <Typography variant="body1">
                        โค้ดของคุณไม่สามารถปลดล็อควิดีโอได้อีกแล้ว กรุณาซื้อโค้ดเพิ่มเพื่อปลดล็อควิดีโอนี้
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                {canUnlock ? (
                    <Button onClick={onConfirm} variant="contained" color="primary">
                        ปลดล็อค
                    </Button>
                ) : (
                    <Button onClick={onRequestPurchase} variant="contained" color="primary">
                        ซื้อโค้ดเพิ่ม
                    </Button>
                )}
                <Button onClick={onClose} variant="outlined" color="secondary">
                    ยกเลิก
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnlockConfirmationPopup;
