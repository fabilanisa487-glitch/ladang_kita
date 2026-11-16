import { MessageCircle } from 'lucide-react';

const message = 'Halo Ladang Kita, saya ingin bertanya tentang produk.';
const phone = '6281234567890';
const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

export default function WhatsAppButton() {
  return (
    <a
      className="whatsapp-button"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tanya Ladang Kita lewat WhatsApp"
      title="Tanya lewat WhatsApp"
    >
      <MessageCircle size={21} />
    </a>
  );
}