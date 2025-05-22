import { Button } from '@toss-design-system/react-native';
import {
  generateHapticFeedback,
  type HapticFeedbackType,
} from 'react-native-bedrock';

interface HapticFeedbackButtonProps {
  label: string;
  type: HapticFeedbackType;
}

export function HapticFeedbackButton({
  label,
  type,
}: HapticFeedbackButtonProps) {
  return (
    <Button
      display="block"
      onPress={() => {
        generateHapticFeedback({ type });
      }}
    >
      {label}
    </Button>
  );
}
