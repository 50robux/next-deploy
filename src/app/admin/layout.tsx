'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../../theme'; // Import the created theme
import { Box, AppBar, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Reset showLogoutConfirm when pathname changes
    useEffect(() => {
        setShowLogoutConfirm(false);
    }, [pathname]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/admin/check-auth');
                const data = await res.json();

                setIsAuthenticated(data.authenticated);

                if (!data.authenticated && pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
                else if (data.authenticated && pathname === '/admin/login') {
                    router.push('/admin/videos');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                if (pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            }
        };

        checkAuth();
    }, [pathname]);

    const handleLogout = async () => {
        if (!showLogoutConfirm) {
            setShowLogoutConfirm(true);
            return;
        }

        try {
            const res = await fetch('/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (data.success) {
                setShowLogoutConfirm(false); // Reset state before logout
                setIsAuthenticated(false);
                router.push('/admin/login');
            } else {
                console.error('\x1b[31m[ERROR] Logout failed\x1b[0m');
            }
        } catch (error) {
            console.error('\x1b[31m[ERROR] System error during logout\x1b[0m');
        }
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    if (isAuthenticated === null) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box className="min-h-screen bg-black text-green-400 font-mono text-sm flex items-center justify-center">
                    <div className="animate-pulse">
                        [SYSTEM] Verifying credentials...
                    </div>
                </Box>
            </ThemeProvider>
        );
    }

    if (pathname === '/admin/login') {
        return <ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider>;
    }

    if (isAuthenticated) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box className="min-h-screen bg-black text-green-400 font-mono text-sm">
                    <AppBar position="static" color="primary">
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                [NEXUS-OS]
                            </Typography>
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                user: admin
                            </Typography>
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                path: {pathname}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                logout
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <main className="mt-2">
                        {children}
                    </main>

                    {/* Logout confirmation dialog */}
                    <Dialog
                        open={showLogoutConfirm}
                        onClose={handleCancelLogout}
                    >
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogContent>
                            <Typography>Are you sure you want to log out?</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCancelLogout} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleLogout} color="primary" autoFocus>
                                Logout
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </ThemeProvider>
        );
    }

    return null;
}