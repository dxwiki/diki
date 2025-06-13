import { dikiMetadata } from '@/constants';

interface JsonLdSchemaProps {
  id: string;
  schema: Record<string, unknown>;
}

export default function JsonLdSchema({ id, schema }: JsonLdSchemaProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// 웹사이트 스키마 생성 함수 : 랜딩페이지
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': dikiMetadata.title,
    'url': dikiMetadata.url,
    'description': dikiMetadata.description,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${ dikiMetadata.url }/posts?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// 조직 스키마 생성 함수 : 랜딩페이지
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': dikiMetadata.title,
    'url': dikiMetadata.url,
    'logo': `${ dikiMetadata.url }/logo.png`,
    'sameAs': [
      'https://github.com/dxwiki/diki',
    ],
  };
}

// 콜렉션 페이지 스키마 생성 함수 : posts 페이지
export function generateCollectionPageSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': name,
    'description': description,
    'url': url,
    'publisher': {
      '@type': 'Organization',
      'name': dikiMetadata.title,
      'logo': {
        '@type': 'ImageObject',
        'url': `${ dikiMetadata.url }/logo.png`,
      },
    },
  };
}

// 문의 페이지 스키마 생성 함수 : contact 페이지
export function generateContactPageSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': name,
    'description': description,
    'url': url,
    'publisher': {
      '@type': 'Organization',
      'name': dikiMetadata.title,
      'logo': {
        '@type': 'ImageObject',
        'url': `${ dikiMetadata.url }/logo.png`,
      },
    },
  };
}

// 아티클 스키마 생성 함수 : posts/[slug] 페이지
export function generateArticleSchema(
  headline: string,
  description: string,
  url: string,
  author: string = '',
  datePublished: string = '',
  dateModified: string = '',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': headline,
    'description': description,
    'author': {
      '@type': 'Person',
      'name': author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': dikiMetadata.title,
      'logo': {
        '@type': 'ImageObject',
        'url': `${ dikiMetadata.url }/logo.png`,
      },
    },
    'datePublished': datePublished,
    'dateModified': dateModified || datePublished,
    'url': url,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

// 프로필 페이지 스키마 생성 함수 : profiles/[slug] 페이지
export function generatePersonSchema(
  name: string,
  description: string,
  url: string,
  image?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': name,
    'description': description,
    'url': url,
    ...(image && {
      'image': image,
    }),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}