import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/login', '/register', '/profile', '/checkout'],
      },
    ],
    sitemap: 'https://starrymoon.in/sitemap.xml',
  }
}
