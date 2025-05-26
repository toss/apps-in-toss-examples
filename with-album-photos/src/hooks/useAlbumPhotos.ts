import { useState, useCallback } from 'react';
import { fetchAlbumPhotos, ImageResponse } from '@apps-in-toss/framework';

export interface ImageState extends ImageResponse {
  previewUri: string;
}

interface UseAlbumPhotosProps {
  base64?: boolean;
}

export function useAlbumPhotos({ base64 = false }: UseAlbumPhotosProps) {
  const [albumPhotos, setAlbumPhotos] = useState<ImageState[]>([]);

  const loadPhotos = useCallback(async () => {
    try {
      const response = await fetchAlbumPhotos({
        maxWidth: 360,
        base64,
      });
      const newImages = response.map((img) => ({
        ...img,
        previewUri: base64
          ? `data:image/jpeg;base64,${img.dataUri}`
          : img.dataUri,
      }));

      setAlbumPhotos((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error('앨범을 가져오는 데 실패했어요:', error);
    }
  }, [base64]);

  const deletePhoto = useCallback((id: string) => {
    setAlbumPhotos((prev) => prev.filter((album) => album.id !== id));
  }, []);

  return { albumPhotos, loadPhotos, deletePhoto };
}
