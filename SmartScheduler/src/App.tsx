/// App.tsx
/// React component for the main application layout which included:
/// Header, SearchBar, SelectedCourses, TotalCreditHours, Grid, and UnscheduledTable.
/// Inputs: None
/// Outputs: JSX.Element representing the app layout.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import Header from "./components/Header";
import "../../SmartScheduler/src/styles/App.css";
import { Divider } from "@mui/material";
import SearchBar from "./components/SearchBar";
import SelectedCourses from "./components/SelectedCourses";
import TotalCreditHours from "./components/TotalCreditHours";
import Grid from "./components/Grid";
import UnscheduledTable from "./components/UnscheduledTable";

function App() {
  return (
    <>
      <Header />
      <div className="contentContainer">
        <div className="searchAndSelected">
          <div className="searchBarContainer">
            <SearchBar />
          </div>
          <div className="selectedCoursesContainer">
            <SelectedCourses />
          </div>
          <Divider orientation="horizontal" variant="middle" flexItem />
          <div className="totalCreditHoursContainer">
            <TotalCreditHours />
          </div>
        </div>
        <Divider orientation="vertical" variant="middle" flexItem />
        <div className="scheduledAndUnsched">
          <div className="gridContainer">
            <Grid />
          </div>
          <Divider orientation="horizontal" variant="middle" flexItem />
          <div className="unscheduledTableContainer">
            <UnscheduledTable />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
