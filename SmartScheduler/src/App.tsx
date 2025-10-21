import "./App.css";
import HelloWorld from "./components/helloWorld";
import { Button } from "@mui/material";

function App() {
  return (
    <>
      <div>SmartScheduler</div>
      <HelloWorld />
      <Button variant="contained" onClick={() => console.log("hello")}>
        Contained
      </Button>
    </>
  );
}

export default App;
