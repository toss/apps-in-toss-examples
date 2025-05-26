import { useCallback, useState } from 'react';
import { ImageResponse, openCamera } from '@apps-in-toss/framework';

export interface ImageState extends ImageResponse {
  previewUri: string;
}

interface UseCameraProps {
  base64?: boolean;
}

export function useCamera({ base64 = false }: UseCameraProps) {
  const [image, setImage] = useState<ImageState | null>(null);

  const capturePhoto = useCallback(async () => {
    try {
      const response = await openCamera({ base64 });
      const newImage: ImageState = {
        ...response,
        previewUri: base64
          ? `data:image/jpeg;base64,${response.dataUri}`
          : response.dataUri,
      };

      setImage(newImage);
    } catch (error) {
      console.log('사진을 가져오는 데 실패했어요:', error);
    }
  }, [base64]);

  const clearPhoto = useCallback(() => {
    setImage(null);
  }, []);

  return { image, capturePhoto, clearPhoto };
}
