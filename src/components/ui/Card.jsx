import clsx from 'clsx';

export default function Card({ children, className }) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm p-6 border border-gray-100', className)}>
      {children}
    </div>
  );
}
