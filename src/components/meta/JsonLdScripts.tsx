import { dikiMetadata } from '@/constants';

const JsonLdScripts = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': dikiMetadata.title,
            'url': dikiMetadata.url,
            'logo': `${ dikiMetadata.url }/logo.png`,
            'sameAs': [
              'https://github.com/dxwiki/diki',
            ],
          }),
        }}
      />
    </>
  );
};

export default JsonLdScripts;