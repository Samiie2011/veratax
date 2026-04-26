import React from 'react';

interface SchemaProps {
  type: 'Organization' | 'Service' | 'FAQPage' | 'Article';
  data: any;
}

export default function SchemaMarkup({ type, data }: SchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
