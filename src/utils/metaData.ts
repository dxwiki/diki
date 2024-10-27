import dayjs from 'dayjs';
import readingTime from 'reading-time';

const formatDate = (date: string): string => {
  return dayjs(date).format('YY.MM.DD');
};

const getReadingTime = (term: any) => {
  const allTextContent = `
    ${ term.description.full }
    ${ term.difficulty.description }
    ${ term.relevance.analyst.description }
    ${ term.relevance.engineer.description }
    ${ term.relevance.scientist.description }
    ${ term.usecase.example }
    ${ term.usecase.description }
    ${ term.references.tutorials.map((t: any) => t.title).join(' ') }
    ${ term.references.books.map((b: any) => b.title).join(' ') }
    ${ term.references.academic.map((a: any) => a.title).join(' ') }
    ${ term.references.opensource.map((o: any) => o.name).join(' ') }
  `;

  const stats = readingTime(allTextContent);
  const minutes = Math.ceil(stats.minutes);
  return `${ minutes }분`;
};

export { formatDate, getReadingTime };