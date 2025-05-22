import { StyleSheet, View } from 'react-native';
import { BedrockRoute } from 'react-native-bedrock';
import { colors } from '@toss-design-system/react-native';
import { BottomAppBar } from 'components/BottomAppBar';
import { Card } from 'components/Card';

export const Route = BedrockRoute('/', {
  validateParams: (params) => params,
  component: Index,
});

export function Index() {
  return (
    <View style={styles.container}>
      <Card />
      <BottomAppBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    backgroundColor: colors.grey100,
  },
});
