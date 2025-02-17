import { startOfWeek } from "date-fns";
import { useEffect, useState } from "react";

export interface TaskItemType {
  id: string;
  text: string;
  isDone: boolean;
  isLike: boolean;
  date: number;
}

interface Props {
  storageKey: string;
  currentDate: string;
}

export default function useTaskState({ storageKey, currentDate }: Props) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  const localData = localStorage.getItem(storageKey);
  const parsedData: Record<string, TaskItemType[]> = localData
    ? JSON.parse(localData)
    : {};

  const taskStore = new Map(
    Object.entries(parsedData).filter(
      ([date]) => new Date(date).getTime() >= weekStart
    )
  );

  const [tasks, setTasks] = useState<TaskItemType[]>([]);

  useEffect(() => {
    setTasks(taskStore.get(currentDate) || []);
  }, [currentDate]);

  useEffect(() => {
    taskStore.set(currentDate, tasks);
    localStorage.setItem(
      storageKey,
      JSON.stringify(Object.fromEntries(taskStore))
    );
  }, [tasks]);

  const addTask = (newTask: TaskItemType) => {
    setTasks((prev) =>
      [newTask, ...prev].sort((a, b) => Number(b.isLike) - Number(a.isLike))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTaskLike = (id: string, isLike: boolean) => {
    setTasks((prev) => {
      const updatedTasks = prev.map((task) =>
        task.id === id ? { ...task, isLike } : task
      );

      return updatedTasks.sort(
        (a, b) => Number(b.isLike) - Number(a.isLike) || a.date - b.date
      );
    });
  };

  return {
    tasks,
    setTasks,
    addTask,
    deleteTask,
    toggleTaskLike,
  };
}
