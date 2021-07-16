import * as React from 'react';
import { Grid } from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import { Activity } from '@/shared/types/query.types';
import { uid } from 'react-uid';

import ActivityListItem from './activity-list-item';
import type { ActivityGroup } from './types';
import { format } from 'date-fns';

interface ActivityListProps {
  data: Activity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ data }) => {
  const items: ActivityGroup[] = React.useMemo(() => {
    const groupByDay = groupBy(data, (d) => d.createdAt.replace(/T(.+)/, ''));
    const sortedDays = Object.keys(groupByDay).sort().reverse();
    const activities: ActivityGroup[] = sortedDays.map((d) => ({
      day: d,
      title: format(new Date(d), 'LLLL do, yyyy'),
      activities: groupByDay[d],
    }));

    return activities;
  }, [data]);
  return (
    <Grid gap={2}>
      {items.map((d) => (
        <ActivityListItem key={uid(d)} data={d} />
      ))}
    </Grid>
  );
};

export default ActivityList;
