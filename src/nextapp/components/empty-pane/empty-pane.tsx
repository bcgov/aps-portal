import * as React from 'react';
import { Box, Center, Heading, Icon, Text } from '@chakra-ui/react';
import { FaRegFolderOpen } from 'react-icons/fa';

interface EmptyPaneProps {
  action?: React.ReactNode;
  error?: string;
  message: string;
  title: string;
}

const EmptyPane: React.FC<EmptyPaneProps> = ({
  action,
  error,
  message,
  title,
}) => {
  return (
    <Center my={12} data-testid="empty-pane">
      <Box
        textAlign="center"
        p={8}
        bg="white"
        borderRadius="4px"
        maxW={{ sm: 400 }}
        mx={{ base: 4 }}
      >
        <Icon as={FaRegFolderOpen} w={20} h={20} mb={4} color="gray.300" />
        <Heading as="h3" size="md" mb={2}>
          {title}
        </Heading>
        <Text>{message}</Text>
        {error && <Text color="red.500">{error}</Text>}
        {action && <Box mt="4">{action}</Box>}
      </Box>
    </Center>
  );
};

export default EmptyPane;
