'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/projects';

// ↓ only loaded on the client; avoids “window is not defined”
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

const AUTO_SCROLL_MS = 10_000;
const FADE_MS = 1_000;

interface Props {
  projects: Project[];
}

export default function ProjectCarousel({ projects }: Props) {
  const count = projects.length;
  const [idx, setIdx] = useState(0);
  const [showCtrls, setShowCtrls] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ───────── helpers ───────── */

  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);
  const prev = useCallback(
    () => setIdx((i) => (i - 1 + count) % count),
    [count],
  );

  /* ───────── auto‑scroll ───────── */

  useEffect(() => {
    if (count < 2) return; // only when >1 slide
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(next, AUTO_SCROLL_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [idx, next, count]);

  /* ───────── controls fade logic ───────── */

  const reveal = () => {
    setShowCtrls(true);
    setTimeout(() => setShowCtrls(false), FADE_MS);
  };

  /* ───────── render ───────── */

  const { slug, imageUrl, videoUrl, title } = projects[idx];

  return (
    <div
      onMouseMove={reveal}
      className="relative w-full max-w-screen-lg aspect-video mx-auto"
    >
      <Link
        href={`/projects/${slug}`}
        className="block h-full w-full focus:outline-none"
      >
        {videoUrl ? (
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            controls={false}
            playing={false}
          />
        ) : (
          imageUrl && (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover rounded-md"
              sizes="(max-width:1024px) 100vw, 1024px"
            />
          )
        )}
      </Link>

      {/* arrows – hidden when only one slide */}
      {count > 1 && (
        <>
          <CarouselArrow
            direction="left"
            onClick={() => {
              prev();
              reveal();
            }}
            visible={showCtrls}
          />
          <CarouselArrow
            direction="right"
            onClick={() => {
              next();
              reveal();
            }}
            visible={showCtrls}
          />
        </>
      )}
    </div>
  );
}

/* ───────── internal arrow component ───────── */

function CarouselArrow({
  direction,
  onClick,
  visible,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  visible: boolean;
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  const side = direction === 'left' ? 'left-2' : 'right-2';

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 ${side} rounded-full transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
