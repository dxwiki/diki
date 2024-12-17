// import RadarChart from '@/components/GLRadarChart';
import { Relevance } from '@/types';
import DACanvas from '@/components/particleCanvas/DACanvas';
import DECanvas from '@/components/particleCanvas/DECanvas';
import DSCanvas from '@/components/particleCanvas/DSCanvas';

interface RelevanceSectionProps {
  analyst: Relevance['analyst'];
  engineer: Relevance['engineer'];
  scientist: Relevance['scientist'];
}

const RelevanceSection = ({ analyst, engineer, scientist }: RelevanceSectionProps) => {
  const nullRelevance
    = !analyst?.description && !engineer?.description && !scientist?.description
    && !analyst?.score && !engineer?.score && !scientist?.score;
  if(nullRelevance) return null;

  return (
    <section className="group">
      <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
        {'직무 연관도'}
      </h2>
      <div className='grid justify-center md:justify-between items-center md:grid-cols-3 gap-3'>
        {
          analyst && (
            <DACanvas title="데이터 분석가" score={analyst.score ?? 0} description={analyst.description ?? ''} />
          )
        }
        {
          engineer && (
            <DECanvas title="데이터 엔지니어" score={engineer.score ?? 0} description={engineer.description ?? ''} />
          )
        }
        {
          scientist && (
            <DSCanvas title="데이터 과학자" score={scientist.score ?? 0} description={scientist.description ?? ''} />
          )
        }
      </div>
      {/* <div className='w-full flex justify-center items-center'>
          <RadarChart
            targetData={[analyst.score,scientist.score,engineer.score]}
            labelData={['Analyst', 'Scientist', 'Engineer']}
            init
          />
        </div> */}
    </section>
  );
};

export default RelevanceSection;