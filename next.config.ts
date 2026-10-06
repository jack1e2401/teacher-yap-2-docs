import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const nextConfig = (phase: string): NextConfig => ({
  // Dev hot reload must never overwrite files used by next build / next start.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  outputFileTracingIncludes: { '/api/knowledge-base': ['./knowledge-base/lessons/**/*'] },
});
export default nextConfig;
