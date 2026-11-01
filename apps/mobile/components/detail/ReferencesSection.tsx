import { Pressable, StyleSheet, View } from 'react-native';
import type { References } from '@diki/core';
import Text from '@/components/ui/Text';
import { font, hairline, spacing, useThemeColors } from '@/theme';
import SectionBlock from './SectionBlock';

interface ReferenceRow {
  title: string;
  details: string[];
  link: string;
}

interface ReferenceGroup {
  label: string;
  rows: ReferenceRow[];
}

const join = (parts: (string | undefined | null)[]): string[] => parts.filter((part): part is string => !!part && part.trim() !== '');

const toGroups = (references: References): ReferenceGroup[] => [
  {
    label: '튜토리얼',
    rows: (references.tutorials ?? []).map((item) => ({
      title: item.title ?? '',
      details: join([item.platform ? `플랫폼: ${ item.platform }` : null]),
      link: item.external_link ?? '',
    })),
  },
  {
    label: '참고서적',
    rows: (references.books ?? []).map((item) => ({
      title: item.title ?? '',
      details: join([
        item.authors?.length ? `저자: ${ item.authors.join(', ') }` : null,
        item.publisher,
        item.year,
        item.isbn ? `ISBN ${ item.isbn }` : null,
      ]),
      link: item.external_link ?? '',
    })),
  },
  {
    label: '연구논문',
    rows: (references.academic ?? []).map((item) => ({
      title: item.title ?? '',
      details: join([
        item.authors?.length ? `저자: ${ item.authors.join(', ') }` : null,
        item.year,
        item.doi ? `DOI ${ item.doi }` : null,
      ]),
      link: item.external_link ?? '',
    })),
  },
  {
    label: '오픈소스',
    rows: (references.opensource ?? []).map((item) => ({
      title: item.name ?? '',
      details: join([item.license ? `라이선스: ${ item.license }` : null, item.description]),
      link: item.external_link ?? '',
    })),
  },
].filter((group) => group.rows.length > 0);

const hasLink = (link: string): boolean => link.trim() !== '' && link.trim() !== '#';

interface ReferencesSectionProps {
  references: References;
  onOpenLink: (href: string)=> void;
}

export default function ReferencesSection({ references, onOpenLink }: ReferencesSectionProps) {
  const colors = useThemeColors();
  const groups = toGroups(references);
  if (groups.length === 0) return null;
  return (
    <SectionBlock title="참고 자료">
      {groups.map((group) => (
        <View
          key={group.label}
          style={styles.group}
        >
          <Text style={[styles.groupLabel, { color: colors.primary }]}>{group.label}</Text>
          {group.rows.map((row, index) => (
            <Pressable
              key={`${ group.label }-${ index }`}
              accessibilityRole={hasLink(row.link) ? 'link' : undefined}
              accessibilityHint={hasLink(row.link) ? '시스템 브라우저에서 엽니다' : undefined}
              disabled={!hasLink(row.link)}
              onPress={() => onOpenLink(row.link.trim())}
              style={({ pressed }) => [styles.row, { borderBottomColor: colors.line }, pressed && styles.pressed]}
            >
              <Text style={styles.rowTitle}>{row.title}</Text>
              {row.details.map((detail, detailIndex) => (
                <Text
                  key={detailIndex}
                  variant="caption"
                >
                  {detail}
                </Text>
              ))}
              {hasLink(row.link) ? <Text style={[styles.more, { color: colors.accent }]}>{'바로가기 →'}</Text> : null}
            </Pressable>
          ))}
        </View>
      ))}
    </SectionBlock>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    fontSize: font.body,
    fontWeight: '700',
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: hairline,
    gap: spacing.xs,
  },
  rowTitle: {
    fontWeight: '600',
  },
  more: {
    fontSize: font.footnote,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
