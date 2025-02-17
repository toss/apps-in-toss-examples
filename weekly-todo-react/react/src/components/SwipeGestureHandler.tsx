import { useState } from "react";
import { sendWebViewMessage } from "../utils/sendWebViewMessage";

interface Props {
  children: React.ReactNode;
  isSorting: boolean;
}

export default function SwipeGestureHandler({ children, isSorting }: Props) {
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragMoveX, setDragMoveX] = useState<number>(0);
  const message = sendWebViewMessage();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSorting) return;
    setDragStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null || isSorting) return;

    const moveDistance = e.targetTouches[0].clientX - dragStartX;
    setDragMoveX(Math.max(moveDistance, -80));
  };

  const handleTouchEnd = () => {
    if (dragMoveX === 0) return;

    if (dragMoveX < -70) {
      setDragStartX(-80);
      message.haptic();
      return;
    }

    setDragMoveX(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${dragMoveX || 0}px)`,
        transition: "transform 0.3s ease-in-out",
        position: "relative",
        width: "100%",
        paddingInline: "8px",
        zIndex: "50",
        backgroundColor: "var(--color-gray-200)",
      }}
    >
      {children}
    </div>
  );
}
