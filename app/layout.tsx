import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ComplainTrack - Raise. Track. Resolve.',
  description: 'Centralized digital platform for student complaint submission, department routing, and transparent resolution tracking.',
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
