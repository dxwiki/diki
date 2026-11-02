import { InterviewContent, RoleDefinition } from './types';

export const interviewRoles: RoleDefinition[] = [
  {
    id: 'ds',
    label: 'DS',
    fullLabel: '데이터 과학자',
    description: 'ML/DL 알고리즘 원리, 모델 선택·평가, 실험 설계',
    phases: [
      {
        id: 'ml-fundamentals',
        title: 'ML 기초 개념',
        steps: ['machine-learning', 'supervised-learning', 'unsupervised-learning', 'classification', 'regression', 'confusion-matrix', 'precision-and-recall', 'model-evaluation-metrics'],
      },
      {
        id: 'generalization',
        title: '일반화와 모델 검증',
        steps: ['underfitting', 'overfitting', 'cross-validation', 'regularization', 'hyperparameter', 'feature-engineering', 'data-leakage', 'ensemble-learning'],
      },
      {
        id: 'optimization',
        title: '학습과 최적화',
        steps: ['loss-function', 'gradient-descent', 'learning-rate', 'activation-function', 'backward-propagation', 'batch-normalization'],
      },
      {
        id: 'architectures',
        title: '딥러닝 구조',
        steps: ['convolutional-neural-network', 'recurrent-neural-network', 'embedding', 'attention-mechanism', 'transformer', 'transfer-learning'],
      },
      {
        id: 'applications',
        title: '응용 분야와 실험',
        steps: ['natural-language-processing', 'computer-vision', 'recommender-system', 'reinforcement-learning', 'ab-testing', 'principal-component-analysis'],
      },
      {
        id: 'generative-models',
        title: '생성 모델과 LLM',
        steps: ['large-language-models', 'fine-tuning', 'retrieval-augmented-generation', 'autoencoder', 'generative-adversarial-network', 'diffusion-model'],
      },
      {
        id: 'data-and-operations',
        title: '데이터 준비와 모델 운영',
        steps: ['one-hot-encoding', 'data-visualization', 'big-data', 'data-drift', 'quantization'],
      },
    ],
  },
  {
    id: 'de',
    label: 'DE',
    fullLabel: '데이터 엔지니어',
    description: '데이터 파이프라인, 저장소, 인프라 설계',
    phases: [
      {
        id: 'service-basics',
        title: '서비스와 API 기초',
        steps: ['data-engineer', 'application-programming-interface', 'representational-state-transfer-api', 'latency', 'caching', 'load-balancing'],
      },
      {
        id: 'storage',
        title: '데이터 저장소',
        steps: ['database', 'data-warehouse', 'data-lake', 'data-mart', 'business-intelligence', 'vector-database', 'data-governance', 'data-lineage'],
      },
      {
        id: 'pipelines',
        title: '파이프라인과 실험 인프라',
        steps: ['big-data', 'etl', 'data-pipeline', 'feature-store', 'data-leakage', 'ab-testing', 'recommender-system'],
      },
      {
        id: 'ml-systems',
        title: 'ML 시스템 운영',
        steps: ['mlops', 'model-serving', 'quantization', 'data-drift', 'pytorch', 'large-language-models', 'retrieval-augmented-generation'],
      },
    ],
  },
  {
    id: 'da',
    label: 'DA',
    fullLabel: '데이터 분석가',
    description: '데이터 탐색, 지표 해석, 분석 결과 전달',
    phases: [
      {
        id: 'analysis-basics',
        title: '분석 기초',
        steps: ['data-analyst', 'exploratory-data-analysis', 'data-visualization', 'business-intelligence', 'data-mining', 'clustering', 'k-means-clustering'],
      },
      {
        id: 'metrics-and-experiments',
        title: '지표와 실험',
        steps: ['confusion-matrix', 'precision-and-recall', 'model-evaluation-metrics', 'classification', 'regression', 'ab-testing'],
      },
      {
        id: 'modeling-for-analysis',
        title: '분석을 위한 모델링',
        steps: ['machine-learning', 'feature-engineering', 'principal-component-analysis', 'cross-validation', 'sentiment-analysis', 'recommender-system'],
      },
      {
        id: 'data-infrastructure',
        title: '데이터 인프라 이해',
        steps: ['database', 'data-warehouse', 'data-mart', 'data-pipeline', 'data-governance', 'data-lineage', 'data-engineer'],
      },
    ],
  },
];

export const curatedQuestions: Record<string, Omit<InterviewContent, 'curated'>> = {
  'ds:overfitting': {
    question: '과대적합이 왜 문제인지, 어떻게 감지하고 방지하는지 설명해 주세요.',
    items: [
      { label: '정의', detail: '학습 데이터에는 성능이 좋지만 새 데이터에는 일반화되지 않는 상태임을 설명했는가' },
      { label: '감지 방법', detail: '학습/검증 손실 비교, 교차 검증 등 감지 방법을 설명했는가' },
      { label: '방지 방법', detail: '정칙화, 드롭아웃, 데이터 증강, 조기 종료 중 2가지 이상을 설명했는가' },
      { label: '실무 맥락', detail: '실제 서비스에서 왜 중요한지 언급했는가' },
    ],
    sampleAnswer: '과대적합은 모델이 학습 데이터의 패턴뿐 아니라 노이즈까지 학습해서, 새로운 데이터에 대해 성능이 떨어지는 현상입니다. 학습 손실은 계속 줄어드는데 검증 손실이 증가하기 시작하면 과대적합을 의심합니다. 교차 검증으로 여러 분할에서 일관된 성능이 나오는지도 확인합니다. 방지 방법으로는 L1/L2 정칙화로 가중치를 제약하거나, 드롭아웃으로 학습 시 일부 뉴런을 비활성화하거나, 데이터 증강으로 학습 데이터의 다양성을 높이는 방법이 있습니다. 실무에서는 학습 데이터에서만 좋은 모델은 실제 서비스에서 신뢰할 수 없기 때문에 과대적합 관리가 중요합니다.',
    commonMisses: ['감지 방법 없이 방지 방법만 나열', '"데이터를 늘리면 된다"만 언급하고 정칙화 기법 누락', '검증 데이터의 역할 미언급'],
    followUps: ['드롭아웃은 어떻게 과대적합을 줄이나요?', '조기 종료의 기준은 어떻게 정하나요?', '데이터가 적을 때 과대적합을 방지하는 방법은?'],
  },
  'de:caching': {
    question: '캐싱 전략(Cache-Aside, Write-Through 등)의 차이를 설명해 주세요.',
    items: [
      { label: 'Cache-Aside', detail: '애플리케이션이 캐시를 확인하고 없으면 DB를 조회해 캐시에 저장하는 흐름을 설명했는가' },
      { label: '쓰기 전략', detail: 'Write-Through와 Write-Behind의 차이를 설명했는가' },
      { label: '트레이드오프', detail: '각 전략의 장단점이나 적합한 상황을 언급했는가' },
      { label: '무효화', detail: 'TTL, 이벤트 기반 등 캐시 무효화 전략을 언급했는가' },
    ],
    sampleAnswer: 'Cache-Aside는 애플리케이션이 먼저 캐시를 확인하고, 캐시 미스 시 데이터베이스에서 조회한 뒤 결과를 캐시에 저장하는 방식입니다. 읽기가 많은 워크로드에 적합합니다. Write-Through는 쓰기 시 캐시와 데이터베이스를 동시에 갱신해서 일관성이 높지만 쓰기 지연 시간이 늘어납니다. Write-Behind는 캐시만 먼저 갱신하고 DB 반영을 비동기로 처리해서 쓰기 성능이 좋지만, 장애 시 데이터 유실 위험이 있습니다. 무효화 전략으로는 TTL을 설정하거나, 데이터 변경 이벤트에 따라 캐시를 삭제하는 방법이 있습니다.',
    commonMisses: ['전략 이름만 나열하고 동작 방식 미설명', '캐시 일관성 문제 미언급', '쓰기 전략 간 트레이드오프 미설명'],
    followUps: ['캐시 스탬피드란 무엇이고 어떻게 방지하나요?', '분산 환경에서 캐시 일관성을 유지하는 방법은?'],
  },
  'da:exploratory-data-analysis': {
    question: 'EDA를 수행하는 과정과 각 단계에서 확인하는 내용을 설명해 주세요.',
    items: [
      { label: '목적', detail: '데이터 이해, 패턴 발견, 가설 수립 등 EDA의 목적을 설명했는가' },
      { label: '단계', detail: '데이터 구조 확인 → 기초 통계 → 분포 확인 → 관계 탐색 순서로 설명했는가' },
      { label: '확인 내용', detail: '결측치, 이상치, 상관관계 등 구체적인 확인 항목을 언급했는가' },
      { label: '시각화', detail: '히스토그램, 박스플롯, 산점도 등 시각화 방법을 언급했는가' },
    ],
    sampleAnswer: 'EDA는 데이터의 특성을 파악하고 분석 방향을 설정하기 위한 탐색 과정입니다. 먼저 데이터의 행·열 수, 변수 타입, 결측치 비율을 확인합니다. 다음으로 평균, 중앙값, 표준편차 같은 기초 통계량을 계산합니다. 히스토그램이나 박스플롯으로 각 변수의 분포를 시각화하고, 이상치를 확인합니다. 마지막으로 산점도나 상관 행렬로 변수 간 관계를 탐색합니다. 이 과정에서 데이터 품질 문제를 발견하거나 분석 가설을 세울 수 있습니다.',
    commonMisses: ['순서 없이 "히스토그램을 그린다" 같은 단편적 답변', '결측치·이상치 처리 미언급', 'EDA의 목적(가설 수립, 방향 설정) 미언급'],
    followUps: ['이상치를 발견했을 때 어떻게 처리하나요?', '범주형 변수와 연속형 변수의 EDA 방법은 어떻게 다른가요?'],
  },
};
