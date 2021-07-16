import { Activity } from '@/shared/types/query.types';

export interface ActivityGroup {
  day: string;
  title: string;
  activities: Activity[];
}
