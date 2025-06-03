export interface Project {
  slug: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
}

export const projects: Project[] = [
  { slug: 'dream-catcher', title: 'Dream Catcher', videoUrl: 'https://…' },
  { slug: 'dex-tokenomics', title: 'DEX Tokenomics Simulation', videoUrl: 'https://…' },
  { slug: 'riscv-emulator', title: 'RISC-V Emulator', imageUrl: '/img/cool-app.png' },
  { slug: 'gpu', title: 'GPU Option Pricer', imageUrl: '/img/cool-app.png' },
  { slug: 'extreme-values', title: 'Extreme Value Distributions', imageUrl: '/img/cool-app.png' },
  { slug: 'mcm', title: 'MCM 2024', imageUrl: '/img/cool-app.png' },
  { slug: 'cmcm', title: 'CMCM 2023', imageUrl: '/img/cool-app.png' },
  { slug: 'sport-bet', title: 'BetScout Sports Betting System', imageUrl: '/img/cool-app.png' },
  { slug: 'kaggle', title: 'Kaggle', imageUrl: '/img/cool-app.png' },
];