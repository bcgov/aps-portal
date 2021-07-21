import * as React from 'react';
import ActivityList from '@/components/activity-list';
import api, { useApi } from '@/shared/services/api';
import {
  Avatar,
  Box,
  Container,
  Heading,
  Stack,
  Grid,
  GridItem,
  Input,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  VStack,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { dehydrate } from 'react-query/hydration';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { Activity, Query, User } from '@/shared/types/query.types';
import { uid } from 'react-uid';
import { FaCheck } from 'react-icons/fa';
import EmptyPane from '@/components/empty-pane';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const queryKey = 'allActivities';
  const variables = { first: 50, skip: 0 };

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, variables, {
        headers: context.req.headers as HeadersInit,
      })
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
      variables,
    },
  };
};

const ActivityPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey, variables }) => {
  const breadcrumbs = useNamespaceBreadcrumbs();
  const [date, setDate] = React.useState<string>('');
  const [activityType, setActivityType] = React.useState<string | number>(
    'all'
  );
  const [user, setUser] = React.useState<string | null>(null);
  const { data } = useApi(
    queryKey,
    {
      query,
      variables,
    },
    { suspense: false }
  );
  const users = React.useMemo(() => {
    return data?.allActivities?.reduce((memo: User[], value) => {
      const names = memo.map((u) => u.name);

      if (value.actor && !names.includes(value.actor.name)) {
        memo.push(value.actor);
      }

      return memo;
    }, []);
  }, [data]);
  const filteredData: Activity[] = React.useMemo(() => {
    return data?.allActivities
      .filter((a) => {
        if (activityType !== 'all') {
          return a.type === activityType;
        }

        return true;
      })
      .filter((a) => {
        if (user) {
          return a.actor?.username === user;
        }
        return true;
      })
      .filter((a) => {
        // TODO: This isn't working correctly yet, probably due to how date inputs are outputted
        if (date) {
          const diff = differenceInCalendarDays(
            new Date(a.createdAt),
            new Date(date)
          );
          return diff === 0;
        }
        return true;
      });
  }, [activityType, data, date, user]);

  const handleDateChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDate(event.target.value);
    },
    [setDate]
  );
  const handleUserClick = React.useCallback(
    (id: string) => () => {
      const nextUser = user === id ? null : id;
      setUser(nextUser);
    },
    [setUser, user]
  );

  return (
    <>
      <Head>
        <title>API Program Services | Activity</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="Namespace Activity" breadcrumb={breadcrumbs} />
        <Grid gap={4} templateColumns="repeat(12, 1fr)">
          <GridItem colSpan={8}>
            <ActivityList data={filteredData} />
            {filteredData.length === 0 && (
              <EmptyPane
                title="No activity to show"
                message="This could be due to no activity in your set filters or nothing has happened in this namespace yet"
              />
            )}
          </GridItem>
          <GridItem as="aside" colSpan={4}>
            <Heading py={4} size="sm">
              Feed Filters
            </Heading>
            <FormControl id="date">
              <FormLabel>View Date</FormLabel>
              <Input
                type="date"
                variant="bc-input"
                name="date"
                onChange={handleDateChange}
                value={date}
              />
            </FormControl>
            <FormControl id="" my={4}>
              <FormLabel>Activity Types</FormLabel>
              <RadioGroup value={activityType} onChange={setActivityType}>
                <Stack direction="column">
                  <Radio value="all">All</Radio>
                  <Radio value="AccessRequest">Consumer</Radio>
                  <Radio value="GatewayConfig">Namespace</Radio>
                  <Radio value="ServiceAccount">Service Account</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl id="date">
              <FormLabel>Users</FormLabel>
              <VStack align="stretch">
                {users.map((u) => (
                  <Flex
                    key={uid(u)}
                    as="button"
                    align="center"
                    justifyContent="space-between"
                    onClick={handleUserClick(u.username)}
                    px={0}
                    sx={{
                      _hover: {
                        color: 'bc-link',
                        backgroundColor: 'transparent',
                      },
                    }}
                    flex="1"
                  >
                    <Box as="span">
                      <Avatar name={u.name} mr={2} size="sm" /> {u.name}
                    </Box>
                    {user === u.username && (
                      <Icon as={FaCheck} color="green.500" />
                    )}
                  </Flex>
                ))}
              </VStack>
            </FormControl>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default ActivityPage;

const query = gql`
  query GET($first: Int, $skip: Int) {
    allActivities(first: $first, skip: $skip, sortBy: createdAt_DESC) {
      id
      type
      name
      action
      result
      message
      context
      refId
      namespace
      extRefId
      createdAt
      actor {
        name
        username
      }
    }
  }
`;
