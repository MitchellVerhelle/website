import { projects } from '@/lib/projects';
import ProjectCarousel from '@/components/project-carousel';

export default function HomePage() {
  return (
    <main className="space-y-32">
      {/* Carousel */}
      <section id="projects">
        <ProjectCarousel projects={projects} />
      </section>

      {/* About */}
      <section
        id="about"
        className="max-w-3xl mx-auto space-y-4 px-6 text-center"
      >
        <h2 className="text-3xl font-semibold">About me</h2>
        <p>
          Short bio here ...{' '}
          <a href="/about" className="underline">
            read more
          </a>
          .
        </p>
      </section>
    </main>
  );
}
