import { StyleSheet, FlatList, View } from 'react-native';
import { BedrockRoute } from 'react-native-bedrock';
import { useContacts } from 'hooks/useContacts';
import { Text } from '@toss-design-system/react-native';
import { ContactItem } from 'components/ContactItem';
import { FlatListFooter } from 'components/ListFooter';

export const Route = BedrockRoute('/', {
  validateParams: (params) => params,
  component: Index,
});

export function Index() {
  const { contacts, done, reloadContacts } = useContacts();

  return (
    <View style={styles.container}>
      <Text typography="st5" fontWeight="extraBold" style={styles.title}>
        연락처 예제
      </Text>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={contacts}
        renderItem={({ item }) => (
          <ContactItem name={item.name} phoneNumber={item.phoneNumber} />
        )}
        ListFooterComponent={<FlatListFooter done={done} />}
        onEndReached={reloadContacts}
        onEndReachedThreshold={0.6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
});
