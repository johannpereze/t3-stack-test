import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";

export function SkeletonPost() {
  return (
    <Card>
      <CardContent className="flex gap-4 p-3">
        <div className="flex w-fit items-center space-x-4 px-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="w-fit min-w-[200px] space-y-2">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
