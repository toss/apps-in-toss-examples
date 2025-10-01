import React, { useEffect, useState } from 'react';
import { createRoute } from '@granite-js/react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useToast } from '@toss/tds-react-native';
import { openCamera, type PermissionStatus } from '@apps-in-toss/framework';
import { PermissionView } from 'components/PermissionStatusView';

export const Route = createRoute('/', {
  component: Index,
});

function Index() {
  const [permission, setPermission] = useState<PermissionStatus>('notDetermined');
  const toast = useToast();

  useEffect(() => {
    async function loadPermission() {
      try {
        const permission = await openCamera.getPermission();
        setPermission(permission);
      } catch (error) {
        toast.open(`권한 정보 가져오기 실패: ${error}`);
      }
    }

    loadPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Text typography="st5" fontWeight="extraBold" style={styles.title}>
        권한 예제
      </Text>
      <PermissionView permission={permission} />
      <View style={styles.buttons}>
        <Button
          style="weak"
          viewStyle={styles.button}
          disabled={permission !== 'allowed'}
          onPress={async () => {
            const response = await openCamera({ base64: false });
            toast.open(`카메라 열기 성공: ${response}`);
          }}
        >
          카메라 열기
        </Button>
        <Button
          viewStyle={styles.button}
          onPress={async () => {
            const permission = await openCamera.openPermissionDialog();
            setPermission(permission);
          }}
        >
          권한 요청
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 10,
    marginBottom: 20,
  },
  buttons: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
