import React from 'react';
import { TextBox } from './ui/TextBox';
import { colors } from '@toss/tds-react-native';
import { PermissionStatus } from '@apps-in-toss/framework';

interface PermissionViewProps {
  permission: PermissionStatus;
}

export function PermissionView({ permission }: PermissionViewProps) {
  const viewStyle: Record<PermissionStatus, { bgColor: string; fontColor: string }> = {
    allowed: {
      bgColor: colors.green50,
      fontColor: colors.green600,
    },
    denied: {
      bgColor: colors.red50,
      fontColor: colors.red600,
    },
    notDetermined: {
      bgColor: colors.grey100,
      fontColor: colors.grey600,
    },
  };
  return (
    <TextBox
      text={`권한 상태: ${permission}`}
      fontColor={viewStyle[permission].fontColor}
      bgColor={viewStyle[permission].bgColor}
    />
  );
}
