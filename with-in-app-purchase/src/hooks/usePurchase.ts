import { useState } from 'react';
import { useToast } from '@toss/tds-react-native';
import { IAP } from '@apps-in-toss/framework';

export function usePurchase() {
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>(false);

  const purchaseProduct = async (sku: string) => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      IAP.createOneTimePurchaseOrder({
        options: {
          sku,
          processProductGrant: ({ orderId }) => {
            // 상품 지급 로직을 작성해요.
            console.log('orderId:', orderId);
            return true; // 상품 지급 여부를 반환해요.
          },
        },
        onEvent: (event) => {
          console.log('event:', event);
          toast.open('구매 했어요.');
        },
        onError: (error) => {
          console.error('error:', error);
        },
      });
    } catch (error) {
      toast.open('구매를 실패했어요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { purchaseProduct, loading };
}
