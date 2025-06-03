import GameWrapper from '@/components/game-wrapper';

export default function PlayPage() {
  return (
    <section className="flex justify-center items-center min-h-screen bg-neutral-900">
      <div className="border border-neutral-700 shadow-lg">
        <GameWrapper />
      </div>
    </section>
  );
}
