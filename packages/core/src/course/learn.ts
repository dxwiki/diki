import { StageDefinition } from './types';

export const learnStages: StageDefinition[] = [
  {
    id: 'beginner',
    label: '입문',
    description: '데이터와 AI 분야의 큰 그림과 기본 용어를 이해합니다',
    phases: [
      {
        id: 'ai-big-picture',
        title: 'AI와 머신러닝의 큰 그림',
        steps: ['artificial-intelligence', 'machine-learning', 'supervised-learning', 'unsupervised-learning', 'deep-learning', 'neural-network'],
      },
      {
        id: 'data-and-evaluation',
        title: '데이터 표현과 평가 첫걸음',
        steps: ['tensor', 'tokenization', 'exploratory-data-analysis', 'data-visualization', 'confusion-matrix', 'precision-and-recall', 'model-evaluation-metrics'],
      },
    ],
  },
  {
    id: 'basic',
    label: '기초',
    description: '주요 알고리즘과 도구의 원리를 설명할 수 있습니다',
    phases: [
      {
        id: 'ml-techniques',
        title: '지도·비지도 학습 기법',
        steps: ['classification', 'regression', 'clustering', 'k-means-clustering', 'dimensionality-reduction', 'principal-component-analysis'],
      },
      {
        id: 'how-models-learn',
        title: '모델이 배우는 방식',
        steps: ['weight', 'bias', 'activation-function', 'forward-propagation', 'loss-function', 'learning-rate', 'hyperparameter'],
      },
      {
        id: 'generalization',
        title: '일반화와 검증',
        steps: ['underfitting', 'overfitting', 'cross-validation', 'regularization', 'feature-engineering', 'one-hot-encoding', 'data-leakage', 'ensemble-learning'],
      },
      {
        id: 'text-and-image',
        title: '텍스트·이미지 데이터 다루기',
        steps: ['natural-language-processing', 'morphological-analysis', 'part-of-speech-tagging', 'sentiment-analysis', 'image-processing', 'computer-vision'],
      },
      {
        id: 'tools-and-services',
        title: '개발 도구와 서비스 기초',
        steps: ['pytorch', 'tensorflow', 'application-programming-interface', 'representational-state-transfer-api', 'database', 'latency', 'caching'],
      },
    ],
  },
  {
    id: 'intermediate',
    label: '중급',
    description: '개념 간 관계를 파악하고 적절한 기법을 선택할 수 있습니다',
    phases: [
      {
        id: 'deep-learning-training',
        title: '딥러닝 학습 심화',
        steps: ['layer', 'gradient-descent', 'backward-propagation', 'automatic-differentiation', 'optimization', 'batch-normalization'],
      },
      {
        id: 'deep-learning-architectures',
        title: '딥러닝 아키텍처',
        steps: ['convolutional-neural-network', 'recurrent-neural-network', 'autoencoder', 'embedding', 'transformer', 'transfer-learning'],
      },
      {
        id: 'language-and-speech',
        title: '자연어·음성 처리 응용',
        steps: ['named-entity-recognition', 'natural-language-understanding', 'natural-language-generation', 'machine-translation', 'audio-processing', 'speech-recognition'],
      },
      {
        id: 'applied-ai',
        title: '응용 AI와 실험',
        steps: ['data-mining', 'recommender-system', 'object-detection', 'reinforcement-learning', 'robotics', 'ab-testing'],
      },
      {
        id: 'data-infrastructure',
        title: '데이터 인프라',
        steps: ['big-data', 'data-governance', 'etl', 'data-pipeline', 'data-lake', 'data-mart', 'business-intelligence', 'load-balancing'],
      },
    ],
  },
  {
    id: 'advanced',
    label: '고급',
    description: '여러 개념을 조합해 복잡한 문제의 해결 방안을 설계할 수 있습니다',
    phases: [
      {
        id: 'generative-ai',
        title: '생성형 AI와 LLM',
        steps: ['attention-mechanism', 'large-language-models', 'fine-tuning', 'vector-database', 'retrieval-augmented-generation', 'generative-adversarial-network', 'diffusion-model'],
      },
      {
        id: 'advanced-perception',
        title: '고급 인식 과제',
        steps: ['syntactic-analysis', 'vision-transformer', 'image-segmentation', 'scene-understanding'],
      },
      {
        id: 'ml-systems',
        title: 'ML 시스템 운영',
        steps: ['data-warehouse', 'data-lineage', 'mlops', 'feature-store', 'model-serving', 'quantization', 'data-drift'],
      },
    ],
  },
  {
    id: 'master',
    label: '마스터',
    description: '개념을 직무와 연결해 판단하고 트레이드오프를 설명할 수 있습니다',
    phases: [
      {
        id: 'data-roles',
        title: '데이터 직무로 연결하기',
        steps: ['data-analyst', 'data-engineer', 'data-scientist'],
      },
    ],
  },
];
