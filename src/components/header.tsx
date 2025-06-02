'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-background/80 backdrop-blur px-6 py-3">
      {/* logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/next.svg" alt="logo" width={32} height={32} />
        <span className="font-semibold">MV</span>
      </Link>

      <nav className="hidden md:flex items-center gap-4">
        {['about', 'projects', 'contact'].map((p) => (
          <Link
            key={p}
            href={`/${p}`}
            className="text-sm font-medium capitalize"
          >
            {p}
          </Link>
        ))}
        <Button asChild size="sm" variant="outline">
          <a
            href="https://github.com/MitchellVerhelle"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </Button>
      </nav>
    </header>
  );
}
