import Image from 'next/image';

import styles from './Avatar.module.css';

const Avatar = ({
  otherStyles,
  name,
}: {
  otherStyles: string;
  name: string;
}) => {
  return (
    <div
      className={`${styles.avatar} ${otherStyles} h-9 w-9`}
      data-tooltip={name}
    >
      <Image
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(
          Math.random() * 30
        )}.png`}
        className={styles.avatar_picture}
        alt={name}
        fill
      />
    </div>
  );
};

export default Avatar;
