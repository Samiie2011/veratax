import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonicalUrl = 'https://veratax.vn', 
  ogImage = 'https://veratax.vn/og-image.jpg' 
}) => {
  const fullTitle = `${title} | Veratax - Tư vấn Pháp lý, Kế toán & Thuế`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CÔNG TY TNHH VERATAX",
    "image": ogImage,
    "@id": "https://veratax.vn",
    "url": "https://veratax.vn",
    "telephone": "0901234567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Số 123 Đường ABC",
      "addressLocality": "Quận 1",
      "addressRegion": "TP. Hồ Chí Minh",
      "postalCode": "700000",
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 10.762622,
      "longitude": 106.660172
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "08:00",
      "closes": "17:30"
    },
    "sameAs": [
      "https://www.facebook.com/veratax.vn",
      "https://zalo.me/0901234567"
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;
