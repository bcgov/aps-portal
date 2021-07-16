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
} from '@chakra-ui/react';
import { dehydrate } from 'react-query/hydration';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { Query, User } from '@/shared/types/query.types';
import { uid } from 'react-uid';

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
  const { data } = useApi(
    queryKey,
    {
      query,
      variables,
    },
    { suspense: false }
  );
  const users = data?.allActivities?.reduce((memo: User[], value) => {
    const names = memo.map((u) => u.name);

    if (value.actor && !names.includes(value.actor.name)) {
      memo.push(value.actor);
    }

    return memo;
  }, []);

  return (
    <>
      <Head>
        <title>API Program Services | Activity</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="Namespace Activity" breadcrumb={breadcrumbs} />
        <Grid gap={4} templateColumns="repeat(12, 1fr)">
          <GridItem colSpan={8}>
            <ActivityList data={data?.allActivities} />
          </GridItem>
          <GridItem as="aside" colSpan={4}>
            <Heading py={4} size="sm">
              Feed Filters
            </Heading>
            <FormControl id="date">
              <FormLabel>View Date</FormLabel>
              <Input type="date" variant="bc-input" name="date" />
            </FormControl>
            <FormControl id="" my={4}>
              <FormLabel>Activity Types</FormLabel>
              <RadioGroup>
                <Stack direction="column">
                  <Radio value="1">All</Radio>
                  <Radio value="2">Consumer</Radio>
                  <Radio value="3">Namespace</Radio>
                  <Radio value="3">Service Account</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl id="date">
              <FormLabel>Users</FormLabel>
              {users.map((u) => (
                <Box key={uid(u)}>
                  <Avatar name={u.name} size="sm" /> {u.name}
                </Box>
              ))}
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
