'use client';

import dynamic from 'next/dynamic';

// load GameCanvas only in the browser
const GameCanvas = dynamic(() => import('@/components/game-canvas'), {
  ssr: false,
  loading: () => <p>Loading…</p>,
});

export default function GameWrapper() {
  return <GameCanvas onInteract={() => alert('Pressed E!')} />;
}
