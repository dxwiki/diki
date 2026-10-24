import ComingSoon from '@/components/ui/ComingSoon';

export default function InterviewScreen() {
  return (
    <ComingSoon
      title={'면접'}
      description={'면접 준비는 웹에서 먼저 이용할 수 있어요.'}
      webPath={'/interview'}
      webLabel={'웹에서 면접 열기'}
    />
  );
}
