import { Skeleton } from '@/components/ui/skeleton';

interface DetailCardSkeletonProps {
  delay?: number;
}

const DetailCardSkeleton = ({ delay = 0 }: DetailCardSkeletonProps) => {
  return (
    <div 
      className="bg-white rounded-2xl border-l-8 border-gray-300 p-8 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full bg-gray-200" />
          <div>
            <Skeleton className="h-8 w-40 mb-2 bg-gray-200" />
            <Skeleton className="h-6 w-24 bg-gray-200" />
          </div>
        </div>
        
        {/* Right: Value */}
        <div className="text-right">
          <Skeleton className="h-4 w-32 mb-2 bg-gray-200" />
          <Skeleton className="h-10 w-40 mb-1 bg-gray-200" />
          <Skeleton className="h-4 w-24 bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default DetailCardSkeleton;
