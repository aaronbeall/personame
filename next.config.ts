import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: process.env.PERSONAME_E2E === '1' ? '.next-e2e' : '.next',
  turbopack: { root: process.cwd() }
}

export default nextConfig
