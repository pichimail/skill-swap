import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Skill Swap', short_name: 'Skill Swap', description: 'Peer-to-peer skill exchange with realtime sessions and AI learning roadmaps',
    start_url: '/', display: 'standalone', background_color: '#050505', theme_color: '#f5dc18',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
