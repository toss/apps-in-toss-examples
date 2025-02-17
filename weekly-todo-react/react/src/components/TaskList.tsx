import style from "./TaskList.module.css";
import { ReactSortable, type MoveEvent } from "react-sortablejs";
import { type TaskItemType } from "../hooks/useTaskState";
import { sendWebViewMessage } from "../utils/sendWebViewMessage";

interface Props {
  title: string;
  items: TaskItemType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItemType[]>>;
  setIsSorting: (bool: boolean) => void;
  children: React.ReactNode;
  emptyMessage?: string;
}

export default function TaskList({
  title,
  items,
  setTasks,
  setIsSorting,
  children,
  emptyMessage,
}: Props) {
  const message = sendWebViewMessage();

  const handleDragEnd = (newState: TaskItemType[]) => {
    setTasks(newState);
    setIsSorting(false);
    message.haptic();
  };

  const handleMoveCheck = (evt: MoveEvent) => {
    const notDraggable =
      evt.related.classList.value.includes("not-draggable") ||
      evt.dragged.classList.value.includes("not-draggable");

    return !notDraggable;
  };

  return (
    <div>
      <h3 className={style.title}>{title}</h3>
      <ReactSortable
        tag={"ul"}
        list={items}
        handle=".draggable-handle"
        setList={handleDragEnd}
        onStart={() => setIsSorting(true)}
        onMove={handleMoveCheck}
        animation={200}
        className={style["task-list"]}
      >
        {children}
      </ReactSortable>
      {!items.length && (
        <div className={style["task-empty"]}>{emptyMessage}</div>
      )}
    </div>
  );
}
