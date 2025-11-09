/// SelectedCourses.tsx
/// React component for displaying the selected courses and generating possible schedules.
/// Inputs: None
/// Outputs: JSX.Element representing the selected courses and generation controls.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { ClassData } from "../types";
import { generateSchedules } from "../utils/scheduleAlgorithm";
import { setGeneratedSchedules } from "../features/scheduleAlgorithmSlice";

export default function SelectedCourses() {
  const dispatch = useAppDispatch();
  const selectedCourses = useAppSelector(
    (state) => state.schedule.selectedClasses
  );

  useEffect(() => {
    if (selectedCourses.length === 0) {
      console.warn("No courses selected — skipping schedule generation.");
      dispatch(setGeneratedSchedules([]));
      return;
    }

    console.log("Re-generating schedules from selectedCourses:", selectedCourses);
    const generated = generateSchedules(selectedCourses);
    console.log(" Generated schedules:", generated);
    dispatch(setGeneratedSchedules(generated));
  }, [selectedCourses, dispatch]);

  return (
    <>
      <li>Selected Courses:</li>
      <ul>
        {/* Map through the selected courses and display them here */}
        {selectedCourses.map((course: ClassData) => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>


    </>
  );
}
