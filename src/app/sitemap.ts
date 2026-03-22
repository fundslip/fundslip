import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fundslip.xyz";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/generate`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/verify`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
