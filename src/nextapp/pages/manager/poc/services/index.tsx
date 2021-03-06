import * as React from 'react';
import {
  Box,
  Container,
  Divider,
  Heading,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import ServicesList from '@/components/services-list';
import { useAuth /*, withAuth*/ } from '@/shared/services/auth';

type Filters = 'all' | 'up' | 'down';

// export const getServerSideProps = withAuth(async (context) => {
//   const { user } = context;

//   if (!user) {
//     return {
//       redirect: {
//         destination: '/unauthorized',
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {},
//   };
// });

const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = React.useState<Filters>('all');
  const isServer = typeof window === 'undefined';
  const onFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as Filters);
  };

  return (
    <Container maxW="6xl">
      <PageHeader title="Services">
        <p>
          List of services from the API Owner perspective. This should pull in
          details from Prometheus and gwa-api Status.
        </p>
      </PageHeader>
      <Divider my={4} />
      <Box d="flex" flexDir="column">
        <Box
          as="header"
          my={4}
          d="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Heading as="h3" size="md">
            Gateway Services
          </Heading>
          <Select
            w="25%"
            onChange={onFilterChange}
            value={filter}
            variant="select"
          >
            <option value="all">All Services</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="unassigned">Unassigned Product</option>
          </Select>
        </Box>
        {user && !isServer && (
          <SimpleGrid columns={{ base: 1, sm: 3, md: 4 }} spacing={4} mb={8}>
            <ClientRequest
              fallback={[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                <Skeleton key={d} height="200px" />
              ))}
            >
              <ServicesList search="" />
            </ClientRequest>
          </SimpleGrid>
        )}
      </Box>
    </Container>
  );
};

export default ServicesPage;
