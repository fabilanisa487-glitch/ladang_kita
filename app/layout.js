import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  title: { default: 'Ladang Kita | Hasil Tani Segar', template: '%s | Ladang Kita' },
  description: 'Belanja hasil panen segar langsung dari petani lokal Indonesia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}