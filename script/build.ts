import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import path from "path";

// server deps to bundle
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "postgres",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server bundles...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  // 1. Standard build for Node/Docker
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
    alias: {
      "@shared": path.resolve(process.cwd(), "server/shared"),
    }
  });

  // 2. Vercel Bundle - OVERWRITING api/index.js
  console.log("Generating Vercel Fat Bundle...");
  await esbuild({
    entryPoints: ["api/index.ts"],
    platform: "node",
    bundle: true,
    format: "esm", // Vercel likes ESM for modern Node
    outfile: "api/index.js",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.VERCEL": '"1"',
    },
    minify: false,
    external: ["fsevents", "canvas"],
    logLevel: "info",
    banner: {
      js: `import { createRequire } from "module";
const require = createRequire(import.meta.url);`,
    },
    alias: {
      "@shared": path.resolve(process.cwd(), "server/shared"),
    }
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
