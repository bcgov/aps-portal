import * as React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import format from 'date-fns/format';

import ActivityIcon from './activity-icon';
import { Activity } from '@/shared/types/query.types';

interface ActivityItemProps {
  data: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ data }) => {
  return (
    <Flex align="center" p={2} bgColor="white">
      <ActivityIcon result={data.result} />
      <VStack align="left" mx={1}>
        <Flex align="center">
          <Text fontSize="sm">
            <Text
              as="span"
              color="#4183c4"
              fontWeight={600}
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              overflow="hidden"
            >
              {data.actor?.name}
            </Text>
            <Text as="span">{data.message}</Text>
            <Text
              as="time"
              pl={2}
              fontSize="0.8em"
              color="rgba(0,0,0,.4)"
            >{`${format(new Date(data.createdAt), 'HH:mm')} `}</Text>
          </Text>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default ActivityItem;
