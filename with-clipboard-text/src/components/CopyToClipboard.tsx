import { useState } from 'react';
import { setClipboardText } from '@apps-in-toss/framework';
import { Button, TextField, useToast } from '@toss-design-system/react-native';

export function CopyToClipboard() {
  const [inputText, setInputText] = useState('');
  const toast = useToast();

  const handleCopyToClipboard = async () => {
    try {
      await setClipboardText(inputText);
      toast.open('텍스트가 복사됐어요!', { type: 'bottom' });
      setInputText('');
    } catch (error) {
      toast.open('텍스트 복사에 실패했어요.', { type: 'bottom' });
    }
  };

  return (
    <TextField
      style={{ flex: 1 }}
      variant="box"
      placeholder="텍스트를 입력 후 복사해 보세요."
      value={inputText}
      onChangeText={setInputText}
      paddingBottom={0}
      right={
        <Button size="tiny" onPress={handleCopyToClipboard}>
          복사하기
        </Button>
      }
    />
  );
}
