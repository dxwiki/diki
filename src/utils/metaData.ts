import dayjs from 'dayjs';

const formatDate = (date: string): string => {
  return dayjs(date).format('YY.MM.DD');
};

export { formatDate };