'use client';

import DatePicker, { DatePickerProps } from 'react-datepicker';
// 원본 라이브러리 CSS를 먼저 임포트한 후 커스텀 스타일 적용
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@/app/style/datepicker.module.css';

const BaseDatePicker = (props: DatePickerProps) => {
  return (
    <div className={styles.datepickerWrapper}>
      <DatePicker {...props} />
    </div>
  );
};

export default BaseDatePicker;