import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardSkeletonProps {
  isTVMode?: boolean;
  delay?: number;
}

const MetricCardSkeleton = ({ isTVMode = false, delay = 0 }: MetricCardSkeletonProps) => {
  return (
    <div 
      className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-6' : 'p-12'} animate-pulse`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon skeleton */}
      <div className={`${isTVMode ? 'mb-4' : 'mb-8'}`}>
        <Skeleton className={`rounded-2xl ${isTVMode ? 'w-14 h-14' : 'w-20 h-20'} bg-white/10`} />
      </div>
      
      {/* Title skeleton */}
      <Skeleton className={`${isTVMode ? 'h-3 mb-2' : 'h-4 mb-4'} w-32 bg-white/10`} />
      
      {/* Value skeleton */}
      <Skeleton className={`${isTVMode ? 'h-10 mb-2' : 'h-16 mb-4'} w-full bg-white/20`} />
      
      {/* Subtitle skeleton */}
      <Skeleton className={`${isTVMode ? 'h-3' : 'h-4'} w-24 bg-white/10`} />
    </div>
  );
};

export default MetricCardSkeleton;
