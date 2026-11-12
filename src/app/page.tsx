import { env } from '@/config/env';

export default function HomePage() {
  return <h1 className="text-2xl font-semibold">{env.storeName}</h1>;
}
