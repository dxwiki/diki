import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { getDetailSections, type DetailSection, type TermData } from '@diki/core';
import Screen from '@/components/ui/Screen';
import { spacing } from '@/theme';
import ArticleWebView from './ArticleWebView';
import DetailHeader from './DetailHeader';
import DifficultySection from './DifficultySection';
import PrevNextSection from './PrevNextSection';
import RecommendationsSection from './RecommendationsSection';
import ReferencesSection from './ReferencesSection';
import RelatedTermsSection from './RelatedTermsSection';
import RelevanceSection from './RelevanceSection';
import SectionBlock from './SectionBlock';
import UsecaseSection from './UsecaseSection';
import { useDetailLinks, type DetailLinks } from './useDetailLinks';

interface TermDetailProps {
  term: TermData;
  terms: TermData[];
}

const renderSection = (section: DetailSection, links: DetailLinks) => {
  switch (section.type) {
    case 'header':
      return (
        <DetailHeader
          title={section.title}
          shortDescription={section.shortDescription}
          tags={section.tags}
          onPressTag={links.openSlug}
        />
      );
    case 'difficulty':
      return (
        <DifficultySection
          level={section.level}
          description={section.description}
        />
      );
    case 'description':
      return (
        <SectionBlock title="개념">
          <ArticleWebView content={section.content} />
        </SectionBlock>
      );
    case 'relatedTerms':
      return (
        <RelatedTermsSection
          items={section.items}
          onPressTerm={links.openSlug}
        />
      );
    case 'relevance':
      return <RelevanceSection items={section.items} />;
    case 'usecase':
      return (
        <UsecaseSection
          industries={section.industries}
          description={section.description}
          example={section.example}
        />
      );
    case 'references':
      return (
        <ReferencesSection
          references={section.references}
          onOpenLink={links.openHref}
        />
      );
    case 'prevNext':
      return (
        <PrevNextSection
          prev={section.prev}
          next={section.next}
          onPressTerm={links.openTerm}
        />
      );
    case 'recommendations':
      return (
        <RecommendationsSection
          terms={section.terms}
          onPressTerm={links.openTerm}
        />
      );
    default:
      return null;
  }
};

// getDetailSections 순서대로 그리고 빈 섹션은 core 가 이미 뺐다 (광고 없음)
const GROUPED_WITH_PREVIOUS = new Set<DetailSection['type']>(['difficulty']);

export default function TermDetail({ term, terms }: TermDetailProps) {
  const links = useDetailLinks();
  const groups = useMemo(() => {
    const result: DetailSection[][] = [];
    getDetailSections(term, terms).forEach((section) => {
      const last = result[result.length - 1];
      if (last && GROUPED_WITH_PREVIOUS.has(section.type)) last.push(section);
      else result.push([section]);
    });
    return result;
  }, [term, terms]);
  return (
    <Screen divided>
      {groups.map((sections) => (
        <View
          key={sections[0].type}
          style={styles.group}
        >
          {sections.map((section) => (
            <View key={section.type}>{renderSection(section, links)}</View>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.gutter,
    paddingVertical: spacing.lg,
  },
});
