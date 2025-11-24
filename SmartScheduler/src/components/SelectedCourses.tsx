/// SelectedCourses.tsx
/// React component for displaying the selected courses and generating possible schedules.
/// Inputs: None
/// Outputs: JSX.Element representing the selected courses and generation controls.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { ClassData } from "../types";
import { setGeneratedSchedules } from "../features/scheduleAlgorithmSlice";
import "../styles/SelectedCoursesStyles.css";
import ClassCard from "./ClassCard";
import { regenerateSchedules, reportSchedules } from "../features/scheduleSlice";

export default function SelectedCourses() {
  const dispatch = useAppDispatch();
  const selectedCourses = useAppSelector(
    (state) => state.schedule.selectedClasses
  );

  useEffect(() => {
    if (selectedCourses.length === 0) {
      console.warn("No courses selected — skipping schedule generation.");
      dispatch(setGeneratedSchedules([]));
      dispatch(reportSchedules([]));
      return;
    }

    dispatch(regenerateSchedules(true));
  }, [selectedCourses, dispatch]);
  return (
    <>
      <li>Selected Courses:</li>
      <div className="coursesContainer">
        <ul className="courseList">
          {/* Map through the selected courses and display them here using the classCard component */}
          {selectedCourses.map((course: ClassData) => (
            <ClassCard currCourse={course} />
          ))}
        </ul>
      </div>
    </>
  );
}
