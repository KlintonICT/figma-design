import { useOthers, useSelf } from '@liveblocks/react/suspense';
import { useMemo } from 'react';

import { generateRandomName } from '@/lib/utils';

import Avatar from './Avatar';
import styles from './index.module.css';

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  const memoizedUsers = useMemo(
    () => (
      <div className='flex items-center justify-center gap-1 py-2'>
        <div className='flex pl-3'>
          {currentUser && (
            <Avatar
              otherStyles='border-[3px] border-primary-green'
              name='You'
            />
          )}

          {users.slice(0, 3).map(({ connectionId }) => {
            return (
              <Avatar
                key={connectionId}
                name={generateRandomName()}
                otherStyles='-ml-3'
              />
            );
          })}

          {hasMoreUsers && (
            <div className={styles.more}>+{users.length - 3}</div>
          )}
        </div>
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users.length]
  );

  return memoizedUsers;
};

export default ActiveUsers;
