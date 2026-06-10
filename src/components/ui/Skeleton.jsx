import clsx from 'clsx';

export default function Skeleton({ className }) {
  return (
    <div className={clsx('animate-pulse bg-[#dddddd] rounded-[4px]', className)} />
  );
}
