import {
  SyntheticEvent,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import { Input } from "./components/ui/Input";
import { Save } from "lucide-react";

interface Task {
  id: string;
  name: string;
  isDone: boolean;
  isFav: boolean;
}

interface ToDoState {
  name: string;
  tasks: Task[];
}

type ToDoActions =
  | { type: "addToDo"; payload: Task }
  | { type: "removeToDo"; payload: string }
  | { type: "addName"; payload: string }
  | { type: "recoverState"; payload: ToDoState };

const todoReducer = (state: ToDoState, action: ToDoActions): ToDoState => {
  switch (action.type) {
    case "addToDo": {
      const newState = {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

      localStorageManager().save(newState);
      return newState;
      break;
    }
    case "addName": {
      const newState = {
        ...state,
        name: action.payload,
      };
      localStorageManager().save(newState);
      return newState;
    }

    case "removeToDo": {
      const newState = {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
      localStorageManager().save(newState);
      return newState;
    }

    case "recoverState": {
      return action.payload;
    }

    default:
      return state;
      break;
  }
};

const toDoInitialState: ToDoState = {
  name: "",
  tasks: [],
};

const localStorageManager = () => {
  const TO_DO_STATE = "TO_DO_STATE";

  function recover(): ToDoState {
    return (
      JSON.parse(window.localStorage.getItem(TO_DO_STATE)) || toDoInitialState
    );
  }

  function save(state: ToDoState) {
    window.localStorage.setItem(TO_DO_STATE, JSON.stringify(state));
  }

  function clear() {
    window.localStorage.removeItem(TO_DO_STATE);
  }

  function areDataInLocalStorage() {
    console.log(localStorageManager().recover());
    return !!window.localStorage.getItem(TO_DO_STATE);
  }

  return {
    recover,
    save,
    clear,
    areDataInLocalStorage,
  };
};

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
const genId = () => `${uuid()}`;

function App() {
  const [state, dispatch] = useReducer(todoReducer, toDoInitialState);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorageManager().areDataInLocalStorage()) {
      dispatch({
        type: "recoverState",
        payload: localStorageManager().recover(),
      });
    }
  }, []);

  function handleAddToDo() {
    dispatch({
      type: "addToDo",
      payload: {
        id: genId(),
        isDone: true,
        isFav: false,
        name: "learning context",
      },
    });
  }

  function handleFormSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const name = nameInputRef.current?.value || "";
    dispatch({ type: "addName", payload: name });
  }

  function handleRemoveTask(taksId: string) {
    dispatch({ type: "removeToDo", payload: taksId });
  }

  return (
    <main className="font-sans">
      <button onClick={handleAddToDo}>add task</button>

      {state.name ? (
        <h1>Hello {state.name} !</h1>
      ) : (
        <div>
          <h3>What is your name?</h3>
          <form onSubmit={handleFormSubmit}>
            <Input id="name" ref={nameInputRef} />
          </form>
        </div>
      )}

      <h3>Tasks:</h3>
      <button onClick={handleAddToDo}>add task</button>

      <ul>
        {state.tasks.length > 0 &&
          state.tasks.map((task) => (
            <li key={task.id}>
              <p>{task.id}</p>
              <p>{task.name}</p>
              <label htmlFor="isDone">isDone?</label>
              {task.isDone ? "❌" : "✔"}
              <label htmlFor="isFav">isFav?</label>
              {task.isFav ? "❌" : "✔"}
              <br></br>
              <button onClick={() => handleRemoveTask(task.id)}>
                {" "}
                remove ❌{" "}
              </button>
            </li>
          ))}
      </ul>
    </main>
  );
}

export default App;
