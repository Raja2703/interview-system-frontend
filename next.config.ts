import type { NextConfig } from "next";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // 👇 Tell Next.js: "I know what I'm doing"
  turbopack: {},

  webpack: (config, { isServer }) => {
    // 1️⃣ Allow monaco-editor to import global CSS
    const oneOfRule = config.module.rules.find(
      (rule: any) => rule.oneOf
    );

    if (oneOfRule) {
      const cssRule = oneOfRule.oneOf.find(
        (r: any) =>
          r.issuer &&
          r.issuer.include &&
          r.issuer.include.includes("_app")
      );

      if (cssRule) {
        cssRule.issuer.include = [
          cssRule.issuer.include,
          /[\\/]node_modules[\\/]monaco-editor[\\/]/
        ];
      }
    }

    // 2️⃣ Monaco Web Workers (client-side only)
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: [
            "json",
            "markdown",
            "css",
            "typescript",
            "javascript",
            "html",
            "graphql",
            "python",
            "scss",
            "yaml"
          ],
          filename: "static/[name].worker.js"
        })
      );
    }

    return config;
  }
};

export default nextConfig;
