import { useState } from 'react';
import { getClipboardText } from '@apps-in-toss/framework';
import { Button, TextField, useToast } from '@toss-design-system/react-native';

export function PasteFromClipboard() {
  const [inputText, setInputText] = useState('');
  const toast = useToast();

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await getClipboardText();
      if (!clipboardText) {
        toast.open('클립보드에 텍스트가 없어요.', { type: 'bottom' });
        return;
      }

      setInputText(clipboardText);
    } catch (error) {
      toast.open('텍스트를 가져오지 못했어요.', { type: 'bottom' });
    }
  };

  return (
    <TextField
      style={{ flex: 1 }}
      variant="box"
      placeholder="복사한 텍스트를 붙여 넣어보세요."
      value={inputText}
      onChangeText={setInputText}
      disabled
      right={
        <Button size="tiny" type="dark" onPress={handlePasteFromClipboard}>
          붙어넣기
        </Button>
      }
    />
  );
}
