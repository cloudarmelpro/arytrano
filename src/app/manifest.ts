import type { MetadataRoute } from 'next'

/**
 * Web App Manifest (E-T13 PWA basics). Lets Madagascar visitors
 * install AryTrano on Android home screens — important on a market
 * where Chrome/Android dominates and PWA install is friction-free.
 *
 * Icons : we currently ship a single `/favicon.ico` so the manifest
 * points at our standard logo PNG at multiple sizes. Add proper
 * 192x192 + 512x512 maskable icons when we have brand assets ready.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AryTrano — Logement étudiant Madagascar',
    short_name: 'AryTrano',
    description:
      'Trouve ton logement étudiant à Madagascar — annonces vérifiées, contact direct propriétaire.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    // Matches the primary brand color used in the city landing
    // headers + OG images.
    theme_color: '#191970',
    lang: 'fr-MG',
    categories: ['lifestyle', 'business'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/images/arytrano.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
