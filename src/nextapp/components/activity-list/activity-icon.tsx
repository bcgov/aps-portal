import * as React from 'react';
import { Icon } from '@chakra-ui/react';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

type IconTypes = typeof FaCheckCircle | typeof FaClock;

const getIcon = (
  result: string
): {
  icon: React.ElementType<IconTypes>;
  color: string;
} => {
  switch (result) {
    case 'completed':
      return { icon: FaCheckCircle, color: 'green.500' };

    case 'success':
      return { icon: FaCheckCircle, color: 'green.500' };

    case 'failed':
      return { icon: FaTimesCircle, color: 'red.500' };

    default:
      return { icon: FaClock, color: 'gray.500' };
  }
};

interface ActivityIconProps {
  result: string;
}

const ActivityIcon: React.FC<ActivityIconProps> = ({ result }) => {
  const { color, icon } = getIcon(result);
  return <Icon as={icon} color={color} width={4} height={4} />;
};

export default ActivityIcon;
