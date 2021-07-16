import * as React from 'react';
import { Box, Heading, StackDivider, VStack } from '@chakra-ui/react';
import { uid } from 'react-uid';

import { ActivityGroup } from './types';
import ActivityItem from './activity-item';

interface ActivityListItemProps {
  data: ActivityGroup;
}

const ActivityListItem: React.FC<ActivityListItemProps> = ({ data }) => {
  return (
    <Box mb={4} pb={4}>
      <Box as="header" my={4}>
        <Heading size="sm">{data.title}</Heading>
      </Box>
      <VStack
        divider={<StackDivider />}
        spacing={2}
        align="stretch"
        bgColor="white"
      >
        {data.activities.map((a) => (
          <ActivityItem key={uid(a.id)} data={a} />
        ))}
      </VStack>
    </Box>
  );
};

export default ActivityListItem;
