import type { Metadata } from 'next';
import { Karla } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Architax',
  description: 'An interactive, beautifully crafted replica of the Architax home team workspace dashboard.',
  icons: {
    icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIzNCAzNCAxMzIgMTMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMCwxMDApIHJvdGF0ZSgtOCkiPgogICAgPCEtLSBUb3AtbGVmdCAtLT4KICAgIDxyZWN0IHg9Ii01NiIgeT0iLTU2IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHJ4PSIxMiIgZmlsbD0iIzNGNzJFNiIvPgogICAgPCEtLSBUb3AtcmlnaHQgLS0+CiAgICA8cmVjdCB4PSI2IiB5PSItNTYiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcng9IjEyIiBmaWxsPSIjMERDNUI0Ii8+CiAgICA8IS0tIEJvdHRvbS1sZWZ0IC0tPgogICAgPHJlY3QgeD0iLTU2IiB5PSI2IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHJ4PSIxMiIgZmlsbD0iI0ZGNjM1NSIvPgogICAgPCEtLSBCb3R0b20tcmlnaHQgLS0+CiAgICA8cmVjdCB4PSI2IiB5PSI2IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHJ4PSIxMiIgZmlsbD0iIzdDNUNGQyIvPgogIDwvZz4KICA8IS0tIENlbnRlciBjb25uZWN0b3IgZG90IC0tPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={karla.className}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
