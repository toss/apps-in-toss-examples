import { useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import { type TaskItemType } from "../hooks/useTaskState";
import style from "./BottomReply.module.css";
import { sendWebViewMessage } from "../utils/sendWebViewMessage";

interface Props {
  addTask: (task: TaskItemType) => void;
  createAt: Date;
}

export default function BottomReply({ addTask, createAt }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled =
    createAt.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
  const message = sendWebViewMessage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current || !inputRef.current.value) return;

    addTask({
      id: nanoid(),
      text: inputRef.current.value,
      isDone: false,
      isLike: false,
      date: createAt.getTime(),
    });
    message.haptic();

    inputRef.current.value = "";
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [createAt]);

  return (
    <form className={style["bottom-reply"]} onSubmit={handleSubmit}>
      <input
        className={style.input}
        type="text"
        ref={inputRef}
        disabled={isDisabled}
      />
      <button className={style.button} type="submit" disabled={isDisabled}>
        <i className="ri-add-line"></i>
      </button>
    </form>
  );
}
