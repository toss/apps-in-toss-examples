import style from "./TaskItem.module.css";
import { type TaskItemType } from "../hooks/useTaskState";
import Checkbox from "./Checkbox";
import { sendWebViewMessage } from "../utils/sendWebViewMessage";
import SwipeGestureHandler from "./SwipeGestureHandler";

interface Props {
  task: TaskItemType;
  addTask: (task: TaskItemType) => void;
  toggleTaskLike: (id: string, isLike: boolean) => void;
  deleteTask: (id: string) => void;
  isSorting: boolean;
}

export default function TaskItem({
  task,
  addTask,
  toggleTaskLike,
  deleteTask,
  isSorting,
}: Props) {
  const message = sendWebViewMessage();

  const handleLikeToggle = (like: boolean) => {
    toggleTaskLike(task.id, like);
    message.haptic();
  };
  const handleDoneToggle = (done: boolean) => {
    deleteTask(task.id);
    addTask({ ...task, isDone: done });
    message.haptic();
  };

  const handleDeleteTask = () => {
    deleteTask(task.id);
    message.haptic();
  };

  return (
    <li
      className={`
        ${style["task-item"]} 
        ${task.isLike ? "not-draggable" : ""}
      `.trim()}
    >
      <SwipeGestureHandler isSorting={isSorting}>
        <div className={style["task-inner"]}>
          <Checkbox
            initialValue={task.isDone}
            onCheckedChange={handleDoneToggle}
          >
            <i className="ri-checkbox-blank-circle-line inactive-icon"></i>
            <i className="ri-checkbox-circle-line active-icon"></i>
          </Checkbox>
          <p
            className={`${
              task.isDone ? style["done-text"] : style["todo-text"]
            }`.trim()}
          >
            {task.text}
          </p>
          <Checkbox
            initialValue={task.isLike}
            className={style["task-like"]}
            onCheckedChange={handleLikeToggle}
          >
            <i className="ri-star-fill active-icon"></i>
            <i className="ri-star-line inactive-icon"></i>
          </Checkbox>
          <div className="draggable-handle">
            <i className="ri-draggable"></i>
          </div>
        </div>
      </SwipeGestureHandler>
      <button className={style["delete-button"]} onClick={handleDeleteTask}>
        삭제
      </button>
    </li>
  );
}
