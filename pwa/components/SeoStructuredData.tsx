import React from 'react';
import schemaData from '../public/schema.json';

export default function SeoStructuredData() {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}