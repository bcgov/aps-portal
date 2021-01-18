import * as React from 'react';
import { Container, Grid } from '@chakra-ui/react';

interface GridLayoutProps {
  children: React.ReactNode;
}

const GridLayout: React.FC<GridLayoutProps> = ({ children }) => {
  return (
    <Container centerContent maxWidth="6xl" py={4}>
      <Grid
        templateColumns={{
          base: null,
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        }}
        gap={4}
      >
        {children}
      </Grid>
    </Container>
  );
};

export default GridLayout;
