import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BedrockRoute, generateHapticFeedback } from 'react-native-bedrock';
import { useLocationWatcher } from 'hooks/useLocationWatcher';
import {
  LocationStatusView,
  LOCATION_STATUS,
} from 'components/LocationStatusView';
import { LOCATION } from '../src/constants/location';
import { Button, Text } from '@toss-design-system/react-native';

export const Route = BedrockRoute('/', {
  validateParams: (params) => params,
  component: Index,
});

const LOCATION_STATUS_KEYS = Object.fromEntries(
  Object.keys(LOCATION_STATUS).map((key) => [key, key])
) as { [K in keyof typeof LOCATION_STATUS]: K };

type LocationStatus = keyof typeof LOCATION_STATUS;

export function Index() {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(
    LOCATION_STATUS_KEYS.INITIAL
  );
  const {
    startWatchingLocation,
    stopWatchingLocation,
    currentDistance,
    isWatching,
  } = useLocationWatcher({
    onDistanceInitial: () => {
      setLocationStatus(LOCATION_STATUS_KEYS.SAFE);
    },
    onDistanceUpdate: (distance: number) => {
      if (distance >= LOCATION.DISTANCE_THRESHOLD_METERS) {
        setLocationStatus(LOCATION_STATUS_KEYS.WARNING);
        generateHapticFeedback({ type: 'basicMedium' });
      } else if (distance > LOCATION.DISTANCE_WARNING_METERS) {
        setLocationStatus(LOCATION_STATUS_KEYS.MOVE);
        generateHapticFeedback({ type: 'softMedium' });
      } else {
        setLocationStatus(LOCATION_STATUS_KEYS.SAFE);
      }
    },
    onReset: () => {
      setLocationStatus(LOCATION_STATUS_KEYS.INITIAL);
    },
  });

  return (
    <View style={styles.container}>
      <Text typography="st5" fontWeight="extraBold" style={styles.title}>
        위치 변경 시 콜백 예제
      </Text>
      <LocationStatusView
        currentDistance={currentDistance}
        locationStatus={locationStatus}
      />
      <View style={styles.buttons}>
        <Button
          viewStyle={styles.button}
          onPress={startWatchingLocation}
          disabled={isWatching}
        >
          시작하기
        </Button>
        <Button
          viewStyle={styles.button}
          type="dark"
          onPress={stopWatchingLocation}
          disabled={!isWatching}
        >
          중지하기
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
