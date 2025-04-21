import type { Metadata } from 'next';
import Providers from '../components/providers/Providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Sistema ERP',
  description: 'Sistema de Gestión de Recursos Empresariales',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background-light dark:bg-background-dark">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
