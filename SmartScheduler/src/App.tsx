import "./App.css";
import HelloWorld from "./components/helloWorld";
import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../src/redux/hooks";
import type { RootState } from "./redux/store";
import {
  addSection,
  clearSchedule,
  removeSection,
} from "./features/scheduleSlice";
import type { Course } from "./types";

function App() {
  const dispatch = useAppDispatch();
  const schedule = useAppSelector((state: RootState) => state.schedule);
  const newSection1: Course = {
    id: "CS101",
    name: "test class",
    creditHours: 3,
    instructor: "Dr. Smith",
    times: ["Mon 10:00-11:00", "Wed 10:00-11:00"],
    description: "An introductory computer science course.",
  };
  const newSection2: Course = {
    id: "CS102",
    name: "test class 2",
    creditHours: 3,
    instructor: "Dr. Smith",
    times: ["Mon 10:00-11:00", "Wed 10:00-11:00"],
    description: "An introductory computer science course.",
  };

  return (
    <>
      <div>SmartScheduler</div>
      <HelloWorld />
      <Button
        variant="contained"
        onClick={() => dispatch(addSection(newSection1))}
      >
        ADD CS101
      </Button>
      <Button
        variant="contained"
        onClick={() => dispatch(addSection(newSection2))}
      >
        ADD CS102
      </Button>
      <Button
        variant="outlined"
        onClick={() => dispatch(removeSection("CS101"))}
      >
        REMOVE CS101
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={() => dispatch(clearSchedule())}
      >
        CLEAR SCHEDULE
      </Button>
      <div>
        <h2>Scheduled Sections:</h2>
        <ul>
          {schedule.sections.map((section, index) => (
            <li key={index}>
              {section.id} - {section.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
