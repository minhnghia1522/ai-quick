'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

const CreatedBy = () => {
  const t = useTranslations();
  return (
    <div style={{ fontSize: 12, textAlign: 'center' }}>
      {t('Sidebar.footer.createdBy')}{' '}
      <Link href={'https://github.com/minhnghia22'} className='underline' target='_blank' rel='noopener noreferrer'>
        Lê Minh Nghĩa
      </Link>
    </div>
  );
};

export default CreatedBy;
