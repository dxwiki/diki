interface CardComponentProps {
  score: number;
  description: string;
  title: string;
  subtitle: string;
  className?: string;
}

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
    <div className={`group rounded-lg border overflow-hidden flex flex-col relative ${ className }
      transition-transform duration-300 backdrop-blur-xl bg-white/5
      border-gray1`}
    >
      <div className="p-2.5 lg:p-4 flex flex-col gap-2 opacity-90 flex-1 relative z-10">
        <div className="flex justify-between items-center">
          <span className="flex items-center font-semibold">
            <span className='sm:hidden lg:block mr-1 text-primary'>{tag}{' | '}</span>
            <span className='text-primary'>{subtitle}</span>
          </span>
          <span className={`text-${ levelColors[score as keyof typeof levelColors] } text-xs border border-${ levelColors[score as keyof typeof levelColors] } rounded-full px-1.5 py-0.5`}>{relevance}</span>
        </div>
        <div className="card-description text-sub text-sm font-semibold">{description}</div>
      </div>
    </div>
  );
};

export default RelevanceCard;
