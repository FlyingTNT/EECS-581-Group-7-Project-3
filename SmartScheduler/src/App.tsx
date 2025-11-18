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
import PaginationControls from "./components/PaginationControls";
import { getState } from "./utils/Utilities";
import { useAppDispatch } from "./redux/hooks";
import { decrementCurrentPermutation, incrementCurrentPermutation } from "./features/scheduleSlice";
import type { KeyboardEvent } from "react";

function App() {
  const state = getState();
  const dispatch = useAppDispatch();

  const onKeyUp = async (event: KeyboardEvent) =>
  {
    if(!(event.key === "ArrowLeft" || event.key === "ArrowRight"))
    {
      return;
    }

    if(state.currentPermutation === -1 || state.permutations.length === 0)
    {
      return;
    }

    if(event.key === "ArrowLeft")
    {
      dispatch(incrementCurrentPermutation());
    }
    else
    {
      dispatch(decrementCurrentPermutation());
    }
  }

  return (
    <>
      <Header />
      <div className="contentContainer" tabIndex={-1} onKeyUp={onKeyUp}>
        <div className="searchAndSelected">
          <div className="searchBarContainer">
            <SearchBar />
          </div>
          <div className="selectedAndTotal">
            <div className="selectedCoursesContainer">
              <SelectedCourses />
            </div>
            <div>
              <Divider orientation="horizontal" variant="middle" flexItem />
              <div className="totalCreditHoursContainer">
                <TotalCreditHours />
              </div>
            </div>
          </div>
        </div>
        <Divider orientation="vertical" variant="middle" flexItem />
        <div className="scheduledAndUnsched">
          <div className="gridContainer">
            <Grid />
          </div>
          <div className="paginationControls">
            <PaginationControls />
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
