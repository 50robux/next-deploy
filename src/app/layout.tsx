// src/app/layout.tsx
import { Metadata } from 'next';
import RootLayoutClient from './RootLayoutClient';
import './globals.css';
import { NotificationProvider } from '../contexts/NotificationContext';

export const metadata: Metadata = {
  title: 'My Video Streaming App',
  description: 'A simple video streaming app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body suppressHydrationWarning={true}>
        <NotificationProvider>
          <RootLayoutClient>{children}</RootLayoutClient>
        </NotificationProvider>
      </body>
    </html>
  );
}
