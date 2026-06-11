import Card from './ui/Card';

export default function ComingSoonPage({ label }) {
  return (
    <div className="flex items-center justify-center mt-24">
      <Card className="max-w-sm w-full text-center">
        <p className="text-[15px] font-semibold text-[#111111] mb-2">{label}</p>
        <p className="text-[13px] text-[#888888]">Coming in the next iteration</p>
      </Card>
    </div>
  );
}
