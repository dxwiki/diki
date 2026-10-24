import ComingSoon from '@/components/ui/ComingSoon';

export default function LearnScreen() {
  return (
    <ComingSoon
      title={'학습'}
      description={'학습 코스는 웹에서 먼저 이용할 수 있어요.'}
      webPath={'/learn'}
      webLabel={'웹에서 학습 열기'}
    />
  );
}
