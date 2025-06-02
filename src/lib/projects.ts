export interface Project {
  slug: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
}

export const projects: Project[] = [
  { slug: 'awesome-project', title: 'Awesome Project', videoUrl: 'https://…' },
  { slug: 'cool-app', title: 'Cool App', imageUrl: '/img/cool-app.png' },
];