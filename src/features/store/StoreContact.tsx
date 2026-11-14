import type { Schemas } from '@/lib/api';

const platformNames: Record<Schemas['StoreInfo']['socialLinks'][number]['platform'], string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  messenger: 'Messenger',
  viber: 'Viber',
  whatsapp: 'WhatsApp',
  shopee: 'Shopee',
  lazada: 'Lazada',
};

const linkClass = 'text-sm hover:underline';

/** The footer's contact details. Empty fields are left out. */
export function StoreContact({ info }: { info: Schemas['StoreInfo'] }) {
  const address = [info.line1, info.line2, info.barangay, info.city, info.province, info.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      {info.email && (
        <li>
          <a href={`mailto:${info.email}`} className={linkClass}>
            {info.email}
          </a>
        </li>
      )}
      {info.phone && (
        <li>
          {/* Free text, so the link keeps only what a phone can dial. */}
          <a href={`tel:${info.phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
            {info.phone}
          </a>
        </li>
      )}
      {address && <li className="text-sm">{address}</li>}
      {info.businessHours && (
        <li className="text-sm text-muted-foreground">{info.businessHours}</li>
      )}
      {info.socialLinks.map((link) => (
        <li key={link.url}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {link.label ?? platformNames[link.platform]}
          </a>
        </li>
      ))}
    </>
  );
}
