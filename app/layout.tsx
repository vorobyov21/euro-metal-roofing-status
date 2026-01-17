import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Euro Metal Roofing - Project Tracker',
  description: 'Track your roofing project progress with Euro Metal Roofing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
