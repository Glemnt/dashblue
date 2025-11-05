import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface AnalysisSkeletonProps {
  isTVMode?: boolean;
}

const AnalysisSkeleton = ({ isTVMode = false }: AnalysisSkeletonProps) => {
  const cardPadding = isTVMode ? 'p-8' : 'p-6';
  const spacing = isTVMode ? 'space-y-8' : 'space-y-4';
  
  return (
    <div className={spacing}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className={`${isTVMode ? 'h-12 w-96' : 'h-8 w-64'}`} />
        <Skeleton className={`${isTVMode ? 'h-12 w-32' : 'h-8 w-24'}`} />
      </div>

      {/* Status cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className={cardPadding}>
              <Skeleton className={`${isTVMode ? 'h-12 w-12' : 'h-8 w-8'} rounded-full mb-4`} />
              <Skeleton className={`${isTVMode ? 'h-6 w-32' : 'h-4 w-24'} mb-2`} />
              <Skeleton className={`${isTVMode ? 'h-12 w-full' : 'h-8 w-full'}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Large cards skeleton */}
      <div className={spacing}>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className={cardPadding}>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className={`${isTVMode ? 'h-10 w-48' : 'h-6 w-32'}`} />
                <Skeleton className={`${isTVMode ? 'h-10 w-10' : 'h-6 w-6'}`} />
              </div>
              <Skeleton className={`${isTVMode ? 'h-8 w-full' : 'h-6 w-full'} mb-3`} />
              <Skeleton className={`${isTVMode ? 'h-6 w-3/4' : 'h-4 w-2/3'} mb-2`} />
              <Skeleton className={`${isTVMode ? 'h-6 w-2/3' : 'h-4 w-1/2'}`} />
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Skeleton className={`${isTVMode ? 'h-20' : 'h-16'}`} />
                <Skeleton className={`${isTVMode ? 'h-20' : 'h-16'}`} />
                <Skeleton className={`${isTVMode ? 'h-20' : 'h-16'}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalysisSkeleton;
