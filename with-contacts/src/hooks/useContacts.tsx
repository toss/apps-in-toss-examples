import { useCallback, useEffect, useState } from 'react';
import { ContactEntity, fetchContacts } from '@apps-in-toss/framework';

interface ContactsResponse {
  result: ContactEntity[];
  nextOffset: number | null;
  done: boolean;
}

export function useContacts() {
  const [contacts, setContacts] = useState<ContactsResponse>({
    result: [],
    nextOffset: 0,
    done: false,
  });

  const loadContacts = useCallback(async () => {
    try {
      if (contacts.done) return;

      const response = await fetchContacts({
        size: 10,
        offset: contacts.nextOffset ?? 0,
      });

      setContacts((prev) => ({
        result: [...prev.result, ...response.result],
        nextOffset: response.nextOffset,
        done: response.done,
      }));
    } catch (error) {
      console.error('연락처를 가져오는 데 실패했어요:', error);
    }
  }, [contacts.done, contacts.nextOffset]);

  useEffect(() => {
    loadContacts();
  }, []);

  return {
    contacts: contacts.result,
    done: contacts.done,
    reloadContacts: loadContacts,
  };
}
