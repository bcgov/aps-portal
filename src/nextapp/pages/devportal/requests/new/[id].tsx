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
  StackDivider,
  useToast,
  Center,
} from '@chakra-ui/react';
import Head from 'next/head';
import isEmpty from 'lodash/isEmpty';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import { QueryClient, useQueryClient } from 'react-query';
import { Environment, Query } from '@/shared/types/query.types';
import api, { useApi } from '@/shared/services/api';
import graphql from '@/shared/services/graphql';
import { dehydrate } from 'react-query/hydration';
import { FieldsetBox, RadioGroup } from '@/components/forms';
import { FaBook } from 'react-icons/fa';
import { useRouter } from 'next/router';
import isNotBlank from '@/shared/isNotBlank';

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
  const [environment, setEnvironment] = React.useState<string>('');
  const dataset = data?.allDiscoverableProducts[0];
  const requestor = data?.allTemporaryIdentities[0];
  const hasSelectedEnvironment = Boolean(environment);
  const selectedEnvironment: Environment = dataset.environments.find(
    (e) => e.id === environment
  );
  const apiTitle = data.allDiscoverableProducts.reduce((memo: string, d) => {
    if (isEmpty(memo) && d.id !== id) {
      return 'API';
    }
    return d.name;
  }, '');
  const hasNotAgreedLegal = React.useMemo(() => {
    const legalsAgreed = !isEmpty(data?.mySelf?.legalsAgreed)
      ? JSON.parse(data.mySelf.legalsAgreed)
      : [];

    if (selectedEnvironment?.legal) {
      const { reference } = selectedEnvironment?.legal;

      if (!isEmpty(reference)) {
        const legalAgreements = legalsAgreed.filter(
          (ag: { reference: string }) => ag.reference === reference
        );

        return legalAgreements.length === 0;
      }
    }

    return true;
  }, [data.mySelf, selectedEnvironment]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!form.checkValidity()) {
      return;
    }

    try {
      const payload = {
        name: `${dataset.name} FOR ${
          data.allTemporaryIdentities[0].name
            ? data.allTemporaryIdentities[0].name
            : data.allTemporaryIdentities[0].username
        }`,
        controls: JSON.stringify({
          clientGenCertificate:
            selectedEnvironment?.credentialIssuer?.clientAuthenticator ===
            'client-jwt',
        }),
        requestor: data.allTemporaryIdentities[0].userId,
        applicationId: formData.get('applicationId'),
        productEnvironmentId: formData.get('environmentId'),
        additionalDetails: formData.get('additionalDetails'),
        acceptLegal: formData.has('acceptLegal') ? true : false,
      };
      const result = await graphql(mutation, payload);
      client.invalidateQueries('allAccessRequests');
      toast({
        title: 'Request submitted',
        status: 'success',
      });
      router?.push(
        `/devportal/requests/new/tokens?requestId=${result.data.createAccessRequest.id}`
      );
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
        <PageHeader title="New Access Request" />
        <form onSubmit={handleSubmit}>
          <FieldsetBox title={apiTitle}>
            <HStack spacing={4}>
              <Box flex={1}>
                <Heading size="sm" mb={3}>
                  Select an application to consume the API
                </Heading>
                <Select name="applicationId">
                  <option value="">No Application Selected</option>
                  {data.myApplications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box mx={4} w={100}>
                <Center>as</Center>
              </Box>
              <Box flex={1}>
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
            </HStack>
          </FieldsetBox>
          <FieldsetBox
            isRequired
            title={`Which ${dataset?.name} API Environment?`}
          >
            <RadioGroup
              name="environmentId"
              onChange={setEnvironment}
              options={dataset?.environments
                .filter((e) => e.active)
                .filter((e) => e.flow !== 'public')
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
              value={environment}
            />
          </FieldsetBox>

          <FieldsetBox
            isRequired={
              hasSelectedEnvironment &&
              isNotBlank(selectedEnvironment?.additionalDetailsToRequest)
            }
            title="Additional Information & Terms"
          >
            {isNotBlank(selectedEnvironment?.additionalDetailsToRequest) && (
              <Box pb={4}>
                <Text>
                  <Text as="strong">From the API Provider</Text>:{' '}
                  {selectedEnvironment.additionalDetailsToRequest}
                </Text>
              </Box>
            )}
            <Textarea
              name="additionalDetails"
              placeholder="Add any addtional notes for the API Provider"
              variant="bc-input"
            />
            {selectedEnvironment?.legal && hasNotAgreedLegal && (
              <Flex
                justify="space-between"
                mt={4}
                p={4}
                bgColor="blue.50"
                borderRadius={4}
              >
                <Checkbox colorScheme="blue" name="acceptLegal">
                  {selectedEnvironment.legal.title}
                </Checkbox>
                <Link
                  fontWeight="bold"
                  href={selectedEnvironment.legal.link}
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
    allDiscoverableProducts(where: { id: $id }) {
      id
      name
      environments {
        id
        name
        active
        flow
        additionalDetailsToRequest
        legal {
          title
          description
          link
          reference
        }
        credentialIssuer {
          clientAuthenticator
        }
      }
    }
    myApplications {
      id
      name
    }
    mySelf {
      legalsAgreed
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
    $additionalDetails: String
    $acceptLegal: Boolean!
  ) {
    acceptLegal(
      productEnvironmentId: $productEnvironmentId
      acceptLegal: $acceptLegal
    ) {
      legalsAgreed
    }

    createAccessRequest(
      data: {
        name: $name
        controls: $controls
        additionalDetails: $additionalDetails
        requestor: { connect: { id: $requestor } }
        application: { connect: { id: $applicationId } }
        productEnvironment: { connect: { id: $productEnvironmentId } }
      }
    ) {
      id
    }
  }
`;
