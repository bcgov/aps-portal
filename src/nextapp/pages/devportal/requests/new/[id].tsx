import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Box,
  Container,
  VStack,
  Text,
  Flex,
  ButtonGroup,
  Link,
  Textarea,
  Checkbox,
  HStack,
  Heading,
  Avatar,
  Select,
  Icon,
  StackDivider,
  useToast,
} from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import { QueryClient, useQueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import api, { useApi } from '@/shared/services/api';
import { dehydrate } from 'react-query/hydration';
import { FieldsetBox, RadioGroup } from '@/components/forms';
import { FaBook, FaCog } from 'react-icons/fa';
import { useRouter } from 'next/router';

const queryKey = 'newAccessRequest';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const NewRequestsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const router = useRouter();
  const client = useQueryClient();
  const toast = useToast();
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: {
        id,
      },
    },
    { suspense: false }
  );
  const dataset = data?.allProducts[0];
  const requestor = data?.allTemporaryIdentities[0];
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!form.checkValidity()) {
      return;
    }

    try {
      const payload = {
        name: `${dataset.name} FOR ${data.allTemporaryIdentities[0].name}`,
        controls: '{}',
        requestor: data.allTemporaryIdentities[0].userId,
        applicationId: formData.get('applicationId'),
        productEnvironmentId: formData.get('environmentId'),
      };
      const result = await api(mutation, payload);
      client.invalidateQueries('allAccessRequests');
      toast({
        title: 'Request submitted',
        description: 'Check back to see if it has been accepted soon',
        status: 'success',
      });
      // ${result.createAccessRequest.id}
      router?.push(`/devportal/poc/access/000`);
    } catch (err) {
      toast({
        title: 'Unable to make request',
        description: err.message,
        status: 'error',
      });
    }
  };
  const handleCancel = () => router?.back();

  return (
    <>
      <Head>
        <title>API Program Services | API Discovery</title>
      </Head>
      <Container maxW="6xl">
        {data.allApplications?.length === 0 && (
          <Alert status="warning">
            <AlertIcon />
            {'To get started, you must '}
            <NextLink passHref href="/devportal/poc/applications">
              <Link colorScheme="blue" size="sm">
                Register an Application
              </Link>
            </NextLink>
            {' first.'}
          </Alert>
        )}
        <PageHeader title="New Access Request">
          <Text>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias ipsum
            sapiente eligendi. Ea sapiente quae quos. Eveniet doloribus
            temporibus inventore expedita totam corporis ut, tenetur molestiae
            perspiciatis ducimus veniam dignissimos!
          </Text>
        </PageHeader>
        <form onSubmit={handleSubmit}>
          <FieldsetBox title="APIs">
            <HStack divider={<StackDivider />} spacing={4}>
              <VStack flex={1}>
                <Icon as={FaCog} boxSize="14" color="bc-blue-alt" />
                <Box>
                  <Text fontWeight="bold" color="bc-blue-alt">
                    {data.allProducts.find((d) => d.id === id)?.name ?? 'API'}
                  </Text>
                </Box>
              </VStack>
              <Box flex={1}>
                <Heading size="sm" mb={2}>
                  OAuth Flow
                </Heading>
                <Flex>
                  <Avatar name={requestor.name} />
                  <Box ml={2}>
                    <Text fontWeight="bold">
                      {requestor.name}{' '}
                      <Text as="span" fontWeight="normal" color="gray.400">
                        {requestor.username}
                      </Text>
                    </Text>
                    <Text fontSize="xs">{requestor.email}</Text>
                  </Box>
                </Flex>
              </Box>
              <Box flex={1}>
                <Heading size="sm" mb={3}>
                  Select an application to consume the API
                </Heading>
                <Select name="applicationId">
                  <option value="">No Application Selected</option>
                  {data.allApplications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Box>
            </HStack>
          </FieldsetBox>
          <FieldsetBox
            isRequired
            title={`Which ${dataset?.name} API Environment?`}
          >
            <RadioGroup
              defaultValue=""
              name="environmentId"
              options={dataset?.environments
                .filter((e) => e.active)
                .map((e) => ({
                  value: e.id,
                  icon: FaBook,
                  label: (
                    <Box>
                      <Text fontWeight="bold">{e.name}</Text>
                      <Text fontSize="sm" color="gray.400">
                        {e.flow}
                      </Text>
                    </Box>
                  ),
                }))}
            />
          </FieldsetBox>
          <FieldsetBox isRequired title="Additional Information & Terms">
            <Textarea
              name="other"
              placeholder="Write any additional instructions for the reviewer"
              variant="bc-input"
            />
            {dataset.environments[0]?.legal && (
              <Flex
                justify="space-between"
                mt={4}
                p={4}
                bgColor="blue.50"
                borderRadius={4}
              >
                <Checkbox colorScheme="blue">
                  {dataset.environments[0]?.legal.description}
                </Checkbox>
                <Link
                  fontWeight="bold"
                  href={dataset.environments[0]?.legal.link}
                  colorScheme="blue"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Legal
                </Link>
              </Flex>
            )}
          </FieldsetBox>
          <Box mt={4} bgColor="white">
            <Flex justify="flex-end" p={4}>
              <ButtonGroup>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="submit" variant="primary">
                  Submit
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default NewRequestsPage;

const query = gql`
  query Get($id: ID!) {
    allProducts(where: { id: $id }) {
      id
      name
      environments {
        id
        name
        active
        flow
        legal {
          description
          link
        }
      }
    }
    allApplications {
      id
      name
    }
    allTemporaryIdentities {
      id
      userId
      name
      username
      email
    }
  }
`;

const mutation = gql`
  mutation AddAccessRequest(
    $name: String!
    $controls: String
    $requestor: ID!
    $applicationId: ID!
    $productEnvironmentId: ID!
  ) {
    createAccessRequest(
      data: {
        name: $name
        controls: $controls
        requestor: { connect: { id: $requestor } }
        application: { connect: { id: $applicationId } }
        productEnvironment: { connect: { id: $productEnvironmentId } }
      }
    ) {
      id
    }
  }
`;