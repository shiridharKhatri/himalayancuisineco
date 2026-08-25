import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://himalayancuisineco.com";
  
  const routes = [
    "",
    "/menu",
    "/our-story",
    "/gift-cards",
    "/catering",
    "/events",
    "/reservations",
    "/contact",
    "/careers",
    "/rewards",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
