import RadarChart from '@/components/GLRadarChart';
import Stars from '@/components/ui/Stars';

interface RelevanceSectionProps {
  analyst: {
    score: number;
    description: string;
  };
  engineer: {
    score: number;
    description: string;
  };
  scientist: {
    score: number;
    description: string;
  };
}

const RelevanceElement = ({ title, score, description }: { title: string, score: number, description: string }) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center bg-background-secondary rounded-[16px_16px_0_0] px-4 py-1 ">
        <strong className='text-bold'>{title}</strong>
        <Stars rating={score} size={12} />
      </div>
      <span className="border border-extreme-light rounded-[0_0_16px_16px] px-4 py-2">{description}</span>
    </div>
  );
};

const RelevanceSection = ({ analyst, engineer, scientist }: RelevanceSectionProps) => {
  return (
    <section className="group">
      <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
        {'직무 연관도'}
      </h2>
      <div className='w-full flex justify-center items-center'>
        <RadarChart
          targetData={[analyst.score,scientist.score,engineer.score]}
          labelData={['Analyst', 'Scientist', 'Engineer']}
          init
        />
      </div>
      <div className='grid lg:grid-cols-3 gap-4'>
        <RelevanceElement title="Analyst" score={analyst.score} description={analyst.description} />
        <RelevanceElement title="Engineer" score={engineer.score} description={engineer.description} />
        <RelevanceElement title="Scientist" score={scientist.score} description={scientist.description} />
      </div>
      {/* <div className='block sm:flex items-start gap-10'>
        <div className='w-[100vw-8px] sm:w-[300px] flex justify-center items-center sm:mb-0 sm:mr-2'>
          <RadarChart
            className="mt-6"
            targetData={[analyst.score,scientist.score,engineer.score]}
            labelData={['Analyst', 'Scientist', 'Engineer']}
            init
          />
        </div>
        <div className='grid grid-cols-[1fr_3fr] h-full mt-4'>
          <span className="text-main text-center sm:m-0">{'직무'}</span>
          <span className="text-main pl-4 sm:m-0">{'설명'}</span>

          <div className="grid grid-rows-3">
            <h3 className="text-center self-center m-0">{'Analyst'}</h3>
            <h3 className="text-center self-center m-0">{'Engineer'}</h3>
            <h3 className="text-center self-center m-0">{'Scientist'}</h3>
          </div>

          <div className="pl-3 grid grid-rows-3">
            <span className="self-center p-1">{analyst.description}</span>
            <span className="self-center p-1">{engineer.description}</span>
            <span className="self-center p-1">{scientist.description}</span>
          </div>

        </div>
      </div> */}
    </section>
  );
};

export default RelevanceSection;