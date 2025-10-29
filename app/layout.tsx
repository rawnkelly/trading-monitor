// /app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Make sure Tailwind is imported here

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Algo Mission Control',
    description: 'System Status',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        {/* This sets the black background and white text for the whole app */}
        <body className={`${inter.className} bg-black text-white`}>
        {children}
        </body>
        </html>
    );
}