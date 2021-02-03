import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Center,
  Heading,
  Icon,
  List,
  ListItem,
  Text,
} from '@chakra-ui/react';
import { FaCheck, FaExclamation } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { gql } from 'graphql-request';
import type { Environment, Query } from '@/types/query.types';

export const GET_LIST = gql`
  query GetServices {
    allPackages {
      id
      name
      organization {
        title
      }
      organizationUnit {
        title
      }
      environments {
        id
        name
        active
        authMethod
        services {
          name
          host
        }
      }
    }
  }
`;

interface ServicesListProps {
  filter: 'all' | 'up' | 'down';
}

const ServicesList: React.FC<ServicesListProps> = ({ filter }) => {
  const { data } = useQuery<Query>(
    'services',
    async () => await api(GET_LIST),
    {
      suspense: true,
    }
  );
  const stateFilter = (d: Environment) => {
    switch (filter) {
      case 'up':
        return d.active;
      case 'down':
        return !d.active;
      case 'all':
      default:
        return true;
    }
  };

  return (
    <>
      {data.allPackages.length <= 0 && (
        <Box width="100%">
          <Text color="gray.400">No services created yet.</Text>
        </Box>
      )}
      {data.allPackages.map((d) =>
        d.environments?.filter(stateFilter).map((e) => (
          <Box
            key={e.id}
            bg={e.active ? 'green.100' : 'yellow.100'}
            borderRadius={4}
            borderColor={e.active ? 'green.600' : 'yellow.600'}
            borderWidth={1}
            borderTopWidth={3}
            p={4}
            position="relative"
          >
            <Box
              width={6}
              height={6}
              d="flex"
              alignItems="center"
              justifyContent="center"
              pos="absolute"
              top={-3}
              left={-3}
              bgColor={e.active ? 'green.600' : 'yellow.600'}
              borderRadius="50%"
              color="white"
            >
              <Center>
                <Icon as={e.active ? FaCheck : FaExclamation} w={3} h={3} />
              </Center>
            </Box>
            <Box as="header" key={d.name}>
              <Heading as="h4" size="sm">
                {d.name} - {e.name}
              </Heading>
              <Text color="green.700" fontSize="xs">
                {e.services.map((s) => s.host)}
              </Text>
            </Box>
            <Box>
              <Box my={2}>
                <Text>HTTPS</Text>
              </Box>
              <List
                as="dl"
                d="flex"
                flexWrap="wrap"
                fontSize="sm"
                color="green.800"
              >
                <ListItem as="dt" width="50%" fontWeight="bold">
                  Security
                </ListItem>
                <ListItem as="dd" width="50%" textAlign="right">
                  {e.authMethod}
                </ListItem>
                <ListItem as="dt" width="50%" fontWeight="bold">
                  Response
                </ListItem>
                <ListItem as="dd" width="50%" textAlign="right">
                  400ms
                </ListItem>
                <ListItem as="dt" width="50%" fontWeight="bold">
                  Uptime
                </ListItem>
                <ListItem as="dd" width="50%" textAlign="right">
                  99.99%
                </ListItem>
              </List>
            </Box>
          </Box>
        ))
      )}
    </>
  );
};

export default ServicesList;