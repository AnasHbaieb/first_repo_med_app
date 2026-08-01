import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Med CRM',
  description: 'Medical CRM Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
