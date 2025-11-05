/// SelectedCourses.tsx
/// React component for displaying the selected courses.
/// Inputs: None
/// Outputs: JSX.Element representing the selected courses.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import { useAppSelector } from "../redux/hooks";
import type { ClassData } from "../types";
import "../styles/SelectedCoursesStyles.css";
import ClassCard from "./ClassCard";

// Currently this is a place holder to just show how the searchbar is correctly
// adding the selected courses to the redux store.
export default function SelectedCourses() {
  const selectedCourses = useAppSelector(
    (state) => state.schedule.selectedClasses
  );
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
