import { Pressable, StyleSheet, View } from 'react-native';
import {
  APP_PRIVACY_CONTACT,
  APP_PRIVACY_EFFECTIVE_DATE,
  APP_PRIVACY_INTRO,
  APP_PRIVACY_SECTIONS,
  APP_PRIVACY_TITLE,
} from '@diki/core';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { openWeb } from '@/lib/links';
import { font, spacing, useThemeColors } from '@/theme';

// 웹 /privacy/app 과 같은 문구를 앱 안에서 바로 보여준다
export default function PrivacyScreen() {
  const colors = useThemeColors();
  return (
    <Screen>
      <View style={styles.head}>
        <Text
          accessibilityRole="header"
          style={styles.title}
        >
          {APP_PRIVACY_TITLE}
        </Text>
        <Text variant="caption">{`시행일: ${ APP_PRIVACY_EFFECTIVE_DATE }`}</Text>
      </View>
      <Text
        selectable
        style={[styles.body, { color: colors['text-secondary'] }]}
      >
        {APP_PRIVACY_INTRO}
      </Text>
      {APP_PRIVACY_SECTIONS.map((section) => (
        <View
          key={section.title}
          style={styles.section}
        >
          <Text
            accessibilityRole="header"
            style={styles.sectionTitle}
          >
            {section.title}
          </Text>
          {section.body.map((paragraph) => (
            <Text
              key={paragraph}
              selectable
              style={[styles.body, { color: colors['text-secondary'] }]}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
      <View style={styles.section}>
        <Text
          accessibilityRole="header"
          style={styles.sectionTitle}
        >
          {APP_PRIVACY_CONTACT.title}
        </Text>
        <Text style={[styles.body, { color: colors['text-secondary'] }]}>{APP_PRIVACY_CONTACT.owner}</Text>
        <Pressable
          accessibilityRole="link"
          accessibilityHint="시스템 브라우저에서 문의하기 페이지를 엽니다"
          hitSlop={8}
          onPress={() => {
            void openWeb('/contact');
          }}
        >
          <Text style={[styles.link, { color: colors.primary }]}>{'문의하기'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    gap: spacing.xs,
  },
  title: {
    fontSize: font.title2,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: font.headline,
    fontWeight: '700',
  },
  body: {
    fontSize: font.body,
    lineHeight: 23,
  },
  link: {
    fontSize: font.body,
    fontWeight: '600',
  },
});
