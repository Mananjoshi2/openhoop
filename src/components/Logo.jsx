import BallIcon from './BallIcon';

export default function Logo({ size = 'text-2xl' }) {
  return (
    <div className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${size}`}>
      <BallIcon className="h-7 w-7 text-orange-500 drop-shadow" />
      <span className="text-white">Open</span>
      <span className="text-orange-500">Hoop</span>
    </div>
  );
}
