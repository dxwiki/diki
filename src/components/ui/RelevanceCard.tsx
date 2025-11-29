'use client';
import styled from '@emotion/styled';

interface CardComponentProps {
  score: number;
  description: string;
  title: string;
  subtitle: string;
  className?: string;
}

const CardContainer = styled.div`
  container-type: inline-size;
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @container (max-width: 200px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const HideOnSmall = styled.span`
  display: contents;

  @container (max-width: 220px) {
    display: none;
  }
`;

const levelColors = {
  1: 'level-1',
  2: 'level-2',
  3: 'level-3',
  4: 'level-4',
  5: 'level-5',
} as const;

const RelevanceCard = ({
  score,
  description,
  title,
  subtitle,
  className,
}: CardComponentProps) => {
  let tag = '';
  let relevance = '';

  switch (title) {
    case '데이터 분석가':
      tag = 'DA';
      break;
    case '데이터 엔지니어':
      tag = 'DE';
      break;
    case '데이터 과학자':
      tag = 'DS';
      break;
  }

  switch (score) {
    case 1:
      relevance = '희박';
      break;
    case 2:
      relevance = '낮음';
      break;
    case 3:
      relevance = '보통';
      break;
    case 4:
      relevance = '높음';
      break;
    case 5:
      relevance = '밀접';
      break;
  }

  return (
    <CardContainer
      className={`group rounded-lg border overflow-hidden flex flex-col relative ${ className }
        transition-transform duration-300 backdrop-blur-xl bg-white/5 border-gray1
      `}
    >
      <div className="p-2.5 lg:p-4 flex flex-col gap-2 opacity-90 flex-1 relative z-10">
        <FlexRow>
          <span className="flex items-center font-semibold gap-1">
            <HideOnSmall>
              <span className='sm:hidden lg:block text-primary'>{tag}</span>
              <div className='bg-secondary w-0.5 h-4' />
            </HideOnSmall>
            <span className='text-primary'>{subtitle}</span>
          </span>
          <span className={`text-${ levelColors[score as keyof typeof levelColors] } text-xs 
          border border-${ levelColors[score as keyof typeof levelColors] } rounded-full px-1.5 py-0.5`}
          >
            {relevance}
          </span>
        </FlexRow>
        <div className="card-description text-sub text-sm font-semibold">{description}</div>
      </div>
    </CardContainer>
  );
};

export default RelevanceCard;
