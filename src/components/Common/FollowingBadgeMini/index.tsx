import { EyeIcon } from '@heroicons/react/20/solid';
// import { BellIcon, ClockIcon, MinusSmallIcon } from '@heroicons/react/24/solid';
// import { MediaStatus } from '@server/constants/media';

interface FollowingBadgeMiniProps {
  is4k?: boolean;
  // Should the badge shrink on mobile to a smaller size? (TitleCard)
  shrink?: boolean;
}

const FollowingBadgeMini = ({
  is4k = false,
  shrink = false,
}: FollowingBadgeMiniProps) => {
  const badgeStyle = [
    `rounded-full bg-opacity-80 shadow-md ${
      shrink ? 'w-4 sm:w-5 border p-0' : 'w-5 ring-1 p-0.5'
    }`,
  ];

  // let indicatorIcon: React.ReactNode;

  // if (following) {
    badgeStyle.push(
      'bg-indigo-500 border-indigo-400 ring-indigo-400 text-indigo-100'
      // 'bg-black-500 border-black-400 ring-black-400 text-indigo-100'
    );
    const indicatorIcon = <EyeIcon />;
  // }

  return (
    <div
      className={`relative inline-flex whitespace-nowrap rounded-full border-gray-700 text-xs font-semibold leading-5 ring-gray-700 ${
        shrink ? '' : 'ring-1'
      }`}
    >
      <div className={badgeStyle.join(' ')}>{indicatorIcon}</div>
      {is4k && <span className="pl-1 pr-2 text-gray-200">4K</span>}
    </div>
  );
};

export default FollowingBadgeMini;
