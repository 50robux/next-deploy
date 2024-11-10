import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',  // ดำสนิทแบบ OLED
      paper: '#1A1A1A',    // เข้มกว่าเดิมเล็กน้อย
    },
    primary: {
      main: '#147CE5',     // สีฟ้าที่นุ่มนวลกว่า
      light: '#3D94E6',
      dark: '#0E5BAB',
    },
    secondary: {
      main: '#48A9E6',     // สีฟ้าอ่อนที่ดูสบายตา
      light: '#7BC1EC',
      dark: '#3486B8',
    },
    error: {
      main: '#FF3B30',     // สีแดงสดแบบ iOS
      light: '#FF6961',    // สีแดงอ่อน
      dark: '#D63125',     // สีแดงเข้ม
    },
    warning: {
      main: '#E6A043',     // สีส้มที่นุ่มนวลกว่า
      light: '#ECB671',
      dark: '#B87F34',
    },
    info: {
      main: '#48B8E6',     // สีฟ้าอ่อนที่สบายตา
      light: '#71C7EC',
      dark: '#3892B8',
    },
    success: {
      main: '#34C759',     // สีเขียวแบบ iOS ที่สบายตา
      light: '#5DD47B',
      dark: '#289F46',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1A1A1A',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#147CE5',
          '&:hover': {
            backgroundColor: '#0E5BAB',
          },
        },
        containedError: {  // เพิ่มสไตล์สำหรับปุ่มสีแดง
          backgroundColor: '#FF3B30',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#D63125',
          },
        },
        outlinedError: {   // เพิ่มสไตล์สำหรับปุ่มขอบสีแดง
          borderColor: '#FF3B30',
          color: '#FF3B30',
          '&:hover': {
            backgroundColor: 'rgba(255, 59, 48, 0.08)',
            borderColor: '#FF3B30',
          },
        },
        outlinedSecondary: {
          borderColor: '#48A9E6',
          color: '#48A9E6',
          '&:hover': {
            backgroundColor: 'rgba(72, 169, 230, 0.08)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: '#1A1A1A',
          boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          bottom: 24,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
        },
      },
    },
    // เพิ่มสไตล์สำหรับ Alert components
    MuiAlert: {
      styleOverrides: {
        standardError: {
          backgroundColor: 'rgba(255, 59, 48, 0.12)',
          color: '#FF3B30',
        },
        outlinedError: {
          borderColor: '#FF3B30',
          color: '#FF3B30',
        },
      },
    },
  },
});

export default theme;