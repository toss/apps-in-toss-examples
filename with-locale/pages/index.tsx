import { StyleSheet, View } from 'react-native';
import { BedrockRoute } from 'react-native-bedrock';
import { useTranslation } from 'react-i18next';
import { makeLocaleKeys } from 'constants/i18nKeys';
import { Text } from '@toss-design-system/react-native';
import { TextBox } from 'components/ui/TextBox';

export const Route = BedrockRoute('/', {
  validateParams: (params) => params,
  component: Index,
});

const localeKeys = makeLocaleKeys('localeExample');

export function Index() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text typography="st5" fontWeight="extraBold" style={styles.title}>
        {t(localeKeys.title)}
      </Text>
      <TextBox text={t(localeKeys.description)} />
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
});
