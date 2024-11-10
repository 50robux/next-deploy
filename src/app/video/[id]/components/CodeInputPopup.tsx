import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock'; // เพิ่มไอคอน Lock

interface CodeInputPopupProps {
    onSubmit: (code: string) => void;
    onRequestPayment: () => void;
    onClose: () => void;
    isReplacing?: boolean;
}

const CodeInputPopup: React.FC<CodeInputPopupProps> = ({
    onSubmit,
    onRequestPayment,
    onClose,
    isReplacing = false,
}) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (code.trim() === '') {
            setError('กรุณากรอกรหัสโค๊ด');
            return;
        }
        onSubmit(code.trim());
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs" TransitionComponent={Fade}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LockIcon sx={{ marginRight: 1 }} /> {/* เพิ่มไอคอน Lock */}
                    <Typography variant="h6" component="div">
                        {isReplacing ? 'เปลี่ยนรหัสโค๊ดเพื่อปลดล็อควิดีโอ' : 'กรุณากรอกรหัสโค๊ดเพื่อปลดล็อควิดีโอ'}
                    </Typography>
                </div>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {isReplacing && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        คุณกำลังเปลี่ยนรหัสโค๊ดจากโค๊ดเดิมเป็นโค๊ดใหม่
                    </Typography>
                )}
                <TextField
                    autoFocus
                    margin="dense"
                    label="รหัสโค๊ด"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value);
                        if (error) setError('');
                    }}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    sx={{
                        padding: '6px 16px',
                        borderRadius: '4px',
                        transition: 'background-color 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'primary.dark', // เปลี่ยนแค่สีเมื่อ hover
                        },
                    }}
                >
                    ยืนยัน
                </Button>
                <Button
                    onClick={onRequestPayment}
                    variant="contained"
                    color="error"
                    sx={{
                        padding: '6px 16px',
                        borderRadius: (theme) => theme.shape.borderRadius,
                        color: 'text.primary',
                        boxShadow: (theme) => theme.shadows[4],
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                            '0%': {
                                transform: 'scale(1)',
                            },
                            '50%': {
                                transform: 'scale(1.05)',
                            },
                            '100%': {
                                transform: 'scale(1)',
                            },
                        },
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.error.dark,
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    ยังไม่มีโค๊ด
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CodeInputPopup;
