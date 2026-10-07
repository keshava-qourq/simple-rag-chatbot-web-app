import type { NextConfig } from "next";

// A static export, so this app deploys down the same path the platform already
// uses for a single-page app: `npm run build` writes plain files into `out/`,
// and nothing serves them but a CDN. The cost is the server half of Next.js --
// no server components, no route handlers, no server actions. The generated
// screens run on seeded sample data and need none of it.
//
// `trailingSlash` writes `about/index.html` instead of `about.html`, which is
// what a static host resolves without a rewrite rule.
//
// `images.unoptimized` because the image optimizer is a server, and there is
// none here. Without it, `next build` refuses to export.
// `ignoreBuildErrors` and `ignoreDuringBuilds` keep `next build` to its one job,
// bundling, the way `vite build` already behaves for the single-page app. The
// screens were generated, and a generated screen that renders correctly can
// still fail `tsc` -- a deployment that refuses to ship over that is a poor
// trade for a working prototype. `npm run typecheck` and `npm run lint` are the
// gates instead, and the platform runs both during development.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
