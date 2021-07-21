import * as React from 'react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import format from 'date-fns/format';

import ActivityIcon from './activity-icon';
import { Activity } from '@/shared/types/query.types';
import { FaInfoCircle } from 'react-icons/fa';

interface ActivityItemProps {
  data: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ data }) => {
  return (
    <Flex align="center" p={2} bgColor="white">
      <ActivityIcon result={data.result} />
      <VStack align="stretch" mx={2}>
        <Flex align="center" justify="space-between" flex={1}>
          <Box>
            <Text fontSize="sm">
              {data.actor && (
                <Text
                  as="span"
                  pr={1}
                  color="#4183c4"
                  fontWeight={600}
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  {data.actor.name}
                </Text>
              )}
              <Tag
                as="span"
                mr={2}
                fontWeight="bold"
                textTransform="uppercase"
                colorScheme="yellow"
                size="sm"
              >
                {data.action}
              </Tag>
              <Text as="span">{data.message}</Text>
              {data.type === 'GatewayConfig' && !data.message && (
                <Text as="span">Configuration change</Text>
              )}
              <Text
                as="time"
                pl={2}
                fontSize="0.8em"
                color="rgba(0,0,0,.4)"
              >{`${format(new Date(data.createdAt), 'HH:mm')} `}</Text>
            </Text>
          </Box>
          <IconButton aria-label="View info" variant="ghost" colorScheme="cyan">
            <Icon as={FaInfoCircle} />
          </IconButton>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default ActivityItem;
