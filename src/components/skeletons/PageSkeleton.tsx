import { Skeleton } from '@/components/ui/skeleton';
import MetricCardSkeleton from './MetricCardSkeleton';
import PodiumSkeleton from './PodiumSkeleton';
import DetailCardSkeleton from './DetailCardSkeleton';

interface PageSkeletonProps {
  isTVMode?: boolean;
  type?: 'index' | 'performance' | 'financial' | 'squads';
}

const PageSkeleton = ({ isTVMode = false, type = 'performance' }: PageSkeletonProps) => {
  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Header Skeleton */}
      <header className={`bg-[#0B1120] border-b border-white/5 ${isTVMode ? 'px-16 py-12' : 'px-12 py-8'}`}>
        <div className="flex justify-between items-center">
          <Skeleton className={`${isTVMode ? 'h-16 w-64' : 'h-12 w-48'} bg-white/10`} />
          <div className="flex gap-4">
            <Skeleton className={`${isTVMode ? 'h-16 w-48' : 'h-12 w-36'} bg-white/10`} />
            <Skeleton className={`${isTVMode ? 'h-16 w-32' : 'h-12 w-24'} bg-white/10`} />
          </div>
        </div>
      </header>

      {/* Navigation Skeleton */}
      <div className={`bg-[#0B1120] border-b border-white/5 ${isTVMode ? 'px-16 py-6' : 'px-12 py-4'}`}>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className={`${isTVMode ? 'h-12 w-32' : 'h-10 w-24'} bg-white/10`} />
          ))}
        </div>
      </div>

      {/* Filter Skeleton */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'pt-16 px-16' : 'pt-12 px-12'}`}>
        <div className="flex gap-4 justify-center">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className={`${isTVMode ? 'h-14 w-40' : 'h-12 w-32'} bg-white/10`} />
          ))}
        </div>
      </section>

      {/* Content based on type */}
      {type === 'performance' && (
        <>
          {/* Summary Cards */}
          <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-16' : 'py-20 px-12'}`}>
            <Skeleton className={`${isTVMode ? 'h-12 w-64 mb-8' : 'h-16 w-96 mb-12'} bg-white/10`} />
            <div className={`grid grid-cols-4 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
              {[0, 100, 200, 300].map((delay) => (
                <MetricCardSkeleton key={delay} isTVMode={isTVMode} delay={delay} />
              ))}
            </div>
          </section>

          {/* Podium */}
          <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-16' : 'py-20 px-12'}`}>
            <Skeleton className={`${isTVMode ? 'h-12 w-64 mb-8' : 'h-16 w-96 mb-12'} bg-gray-200`} />
            <PodiumSkeleton isTVMode={isTVMode} />
          </section>

          {/* Detail Cards */}
          <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-16' : 'py-20 px-12'}`}>
            <Skeleton className={`${isTVMode ? 'h-12 w-64 mb-8' : 'h-16 w-96 mb-12'} bg-white/10`} />
            <div className="space-y-6">
              {[0, 100, 200].map((delay) => (
                <DetailCardSkeleton key={delay} delay={delay} />
              ))}
            </div>
          </section>
        </>
      )}

      {type === 'index' && (
        <>
          {/* Meta bars */}
          <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-16' : 'py-20 px-12'}`}>
            <div className="space-y-6">
              {[0, 100, 200].map((delay) => (
                <div key={delay} className="animate-pulse" style={{ animationDelay: `${delay}ms` }}>
                  <Skeleton className="h-6 w-48 mb-4 bg-white/10" />
                  <Skeleton className="h-8 w-full bg-white/10" />
                </div>
              ))}
            </div>
          </section>

          {/* KPI Cards */}
          <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-16' : 'py-20 px-12'}`}>
            <div className={`grid grid-cols-4 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
              {[0, 100, 200, 300].map((delay) => (
                <div key={delay} className="bg-white rounded-2xl p-8 animate-pulse" style={{ animationDelay: `${delay}ms` }}>
                  <Skeleton className="h-12 w-12 rounded-full mb-4 bg-gray-200" />
                  <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {type === 'financial' && (
        <>
          {/* Financial Cards */}
          <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-16' : 'py-20 px-12'}`}>
            <div className={`grid grid-cols-3 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
              {[0, 100, 200, 300, 400, 500].map((delay) => (
                <MetricCardSkeleton key={delay} isTVMode={isTVMode} delay={delay} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PageSkeleton;
