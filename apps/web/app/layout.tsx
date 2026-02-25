import "./globals.css";
import Header from './_components/header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, overflow: 'hidden' }}>
        <Header />
        {children}
      </body>
    </html>
  );
}
