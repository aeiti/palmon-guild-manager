import type { MetadataRoute } from "next";

// VOID is a members-only guild tool — nothing here should be indexed. Disallow
// every crawler across the whole app. (No sitemap: there are no public URLs.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
