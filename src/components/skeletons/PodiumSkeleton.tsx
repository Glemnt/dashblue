import { Skeleton } from '@/components/ui/skeleton';

interface PodiumSkeletonProps {
  isTVMode?: boolean;
}

const PodiumSkeleton = ({ isTVMode = false }: PodiumSkeletonProps) => {
  return (
    <div className={`grid grid-cols-3 items-end ${isTVMode ? 'gap-4' : 'gap-8'}`}>
      {/* 2nd Place */}
      <div className="animate-pulse" style={{ animationDelay: '100ms' }}>
        <div className={`bg-[#151E35]/80 rounded-2xl border border-white/10 ${
          isTVMode ? 'p-4 h-64' : 'p-8 h-80'
        } flex flex-col items-center justify-between`}>
          <div className="text-center w-full">
            <Skeleton className={`${isTVMode ? 'w-16 h-16' : 'w-24 h-24'} rounded-full mx-auto mb-4 bg-white/10`} />
            <Skeleton className={`h-6 w-32 mx-auto mb-2 bg-white/10`} />
            <Skeleton className={`h-4 w-24 mx-auto bg-white/10`} />
          </div>
          <div className="w-full">
            <Skeleton className={`h-8 w-full mb-2 bg-white/10`} />
            <Skeleton className={`h-4 w-20 mx-auto bg-white/10`} />
          </div>
        </div>
      </div>

      {/* 1st Place */}
      <div className="animate-pulse">
        <div className={`bg-gradient-to-b from-[#FFB800]/20 to-[#151E35] rounded-2xl border-2 border-[#FFB800] ${
          isTVMode ? 'p-6 h-80' : 'p-12 h-96'
        } flex flex-col items-center justify-between`}>
          <div className="text-center w-full">
            <div className={`${isTVMode ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>👑</div>
            <Skeleton className={`${isTVMode ? 'w-20 h-20' : 'w-32 h-32'} rounded-full mx-auto mb-4 bg-white/20`} />
            <Skeleton className={`h-8 w-40 mx-auto mb-2 bg-white/20`} />
            <Skeleton className={`h-5 w-28 mx-auto bg-white/20`} />
          </div>
          <div className="w-full">
            <Skeleton className={`h-10 w-full mb-2 bg-white/20`} />
            <Skeleton className={`h-5 w-24 mx-auto bg-white/20`} />
          </div>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="animate-pulse" style={{ animationDelay: '200ms' }}>
        <div className={`bg-[#151E35]/60 rounded-2xl border border-white/10 ${
          isTVMode ? 'p-3 h-56' : 'p-6 h-72'
        } flex flex-col items-center justify-between`}>
          <div className="text-center w-full">
            <Skeleton className={`${isTVMode ? 'w-14 h-14' : 'w-20 h-20'} rounded-full mx-auto mb-3 bg-white/10`} />
            <Skeleton className={`h-5 w-28 mx-auto mb-2 bg-white/10`} />
            <Skeleton className={`h-4 w-20 mx-auto bg-white/10`} />
          </div>
          <div className="w-full">
            <Skeleton className={`h-7 w-full mb-2 bg-white/10`} />
            <Skeleton className={`h-4 w-16 mx-auto bg-white/10`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodiumSkeleton;
