import RelevanceCard from '@/components/ui/RelevanceCard';
import { Relevance } from '@/types';

interface RelevanceSectionProps {
  analyst: Relevance['analyst'];
  engineer: Relevance['engineer'];
  scientist: Relevance['scientist'];
}

export default function RelevanceSection({ analyst, engineer, scientist }: RelevanceSectionProps) {
  return (
    <section className='group-section relative bg-cover bg-center size-full'>
      <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-section-title transition-opacity">
          {'#'}
        </span>
        {'직무 연관도'}
      </h2>

      <div className="grid items-stretch grid-rows-3 sm:grid-rows-1 sm:grid-cols-3 gap-3">
        {analyst && (
          <RelevanceCard
            title="데이터 분석가"
            subtitle="Data Analyst"
            score={analyst.score ?? 0}
            description={analyst.description ?? ''}
          />
        )}
        {scientist && (
          <RelevanceCard
            title="데이터 과학자"
            subtitle="Data Scientist"
            score={scientist.score ?? 0}
            description={scientist.description ?? ''}
          />
        )}
        {engineer && (
          <RelevanceCard
            title="데이터 엔지니어"
            subtitle="Data Engineer"
            score={engineer.score ?? 0}
            description={engineer.description ?? ''}
          />
        )}
      </div>
    </section>
  );
}
