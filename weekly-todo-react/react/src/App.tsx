import { useState } from "react";
import { format } from "date-fns";
import useTaskState from "./hooks/useTaskState";
import Week from "./components/Week";
import TaskList from "./components/TaskList";
import TaskItem from "./components/TaskItem";
import BottomReply from "./components/BottomReply";
import DeviceViewport from "./components/DeviceViewport";

function App() {
  const [selectDate, setSelectDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const {
    tasks: todos,
    setTasks: setTodos,
    addTask: addTodo,
    toggleTaskLike: toggleTodoLike,
    deleteTask: deleteTodo,
  } = useTaskState({ storageKey: "TODOS", currentDate: selectDate });

  const {
    tasks: dones,
    setTasks: setDones,
    addTask: addDone,
    toggleTaskLike: toggleDoneLike,
    deleteTask: deleteDone,
  } = useTaskState({ storageKey: "DONES", currentDate: selectDate });

  const [isSorting, setIsSorting] = useState<boolean>(false);

  return (
    <>
      <DeviceViewport />
      <Week onSelectDay={setSelectDate} />
      <div className="task-container">
        <TaskList
          title="ToDo"
          items={todos}
          setTasks={setTodos}
          setIsSorting={setIsSorting}
          emptyMessage="Set a new goal for yourself! 🎯"
        >
          {todos.map((todo) => (
            <TaskItem
              key={todo.id}
              task={todo}
              addTask={addDone}
              toggleTaskLike={toggleTodoLike}
              deleteTask={deleteTodo}
              isSorting={isSorting}
            />
          ))}
        </TaskList>
        <TaskList
          title="Done"
          items={dones}
          setTasks={setDones}
          setIsSorting={setIsSorting}
          emptyMessage="Still nothing done! Finish one today! 🌟"
        >
          {dones.map((done) => (
            <TaskItem
              key={done.id}
              task={done}
              addTask={addTodo}
              toggleTaskLike={toggleDoneLike}
              deleteTask={deleteDone}
              isSorting={isSorting}
            />
          ))}
        </TaskList>
      </div>
      <BottomReply addTask={addTodo} createAt={new Date(selectDate)} />
    </>
  );
}

export default App;
