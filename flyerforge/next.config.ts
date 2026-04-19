import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sharp", "satori"],
  // Next's output tracer doesn't always pick up the AI SDKs from route files.
  // Force them into the standalone bundle so Hostinger / other hosts ship.
  outputFileTracingIncludes: {
    "/api/ai/copy": ["./node_modules/@anthropic-ai/**/*"],
    "/api/ai/recommend": ["./node_modules/@anthropic-ai/**/*"],
    "/api/ai/image": ["./node_modules/openai/**/*"],
  },
};

export default nextConfig;
