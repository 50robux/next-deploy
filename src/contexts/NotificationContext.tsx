'use client';

import React, { createContext, useState, ReactNode, useCallback, useRef, forwardRef } from 'react';
import { Snackbar, Alert, AlertColor, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertProps } from '@mui/material/Alert';

interface NotificationContextType {
    showNotification: (message: string, severity: AlertColor) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
    showNotification: () => { },
});

const CustomAlert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
    <Alert ref={ref} {...props} />
));

const MotionAlert = motion(CustomAlert);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');
    const lastNotification = useRef<{ message: string; timestamp: number }>({
        message: '',
        timestamp: 0,
    });

    const showNotification = useCallback(
        (message: string, severity: AlertColor) => {
            const currentTime = Date.now();
            if (message === lastNotification.current.message &&
                currentTime - lastNotification.current.timestamp < 2000) {
                return;
            }

            lastNotification.current = {
                message,
                timestamp: currentTime,
            };

            setMessage(message);
            setSeverity(severity);
            setOpen(true);
        },
        []
    );

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const getAlertStyles = (severity: AlertColor) => {
        const severityColors = {
            success: {
                background: '#10B981',
                color: '#FFFFFF',
            },
            error: {
                background: '#EF4444',
                color: '#FFFFFF',
            },
            warning: {
                background: '#F59E0B',
                color: '#FFFFFF',
            },
            info: {
                background: '#3B82F6',
                color: '#FFFFFF',
            },
        };

        return {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 16px',
            borderRadius: '12px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.875rem',
            fontWeight: 500,
            width: 'fit-content',
            maxWidth: { xs: '85vw', sm: '380px' },
            ...severityColors[severity],
            '& .MuiAlert-icon': {
                marginRight: '8px',
                padding: 0,
                opacity: 0.9,
                alignItems: 'center',
            },
            '& .MuiAlert-message': {
                padding: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            '& .MuiAlert-action': {
                marginLeft: '12px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
            },
            '& .MuiIconButton-root': {
                color: 'inherit',
                padding: '4px',
                opacity: 0.8,
                '&:hover': {
                    opacity: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
            },
        };
    };

    const getIcon = (severity: AlertColor) => {
        const iconProps = { style: { fontSize: 20 } };
        switch (severity) {
            case 'success':
                return <CheckCircleIcon {...iconProps} />;
            case 'error':
                return <ErrorIcon {...iconProps} />;
            case 'warning':
                return <WarningIcon {...iconProps} />;
            case 'info':
                return <InfoIcon {...iconProps} />;
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <AnimatePresence>
                {open && (
                    <Snackbar
                        open={open}
                        autoHideDuration={2500}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{
                            mt: { xs: 2, sm: 3 },
                            mr: { xs: 2, sm: 3 },
                            '& .MuiSnackbarContent-root': {
                                padding: 0,
                                minWidth: 'auto',
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        <MotionAlert
                            onClose={handleClose}
                            severity={severity}
                            variant="filled"
                            sx={getAlertStyles(severity)}
                            initial={{ opacity: 0, y: -20, x: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, x: 40, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 35,
                                mass: 0.5
                            }}
                            icon={getIcon(severity)}
                            action={
                                <IconButton
                                    size="small"
                                    aria-label="close"
                                    onClick={handleClose}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            {message}
                        </MotionAlert>
                    </Snackbar>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};