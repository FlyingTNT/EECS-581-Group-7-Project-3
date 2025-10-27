/// SelectedCourses.tsx
/// React component for displaying the selected courses.
/// Inputs: None
/// Outputs: JSX.Element representing the selected courses.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import { useAppSelector } from "../redux/hooks";

// Currently this is a place holder to just show how the searchbar is correctly
// adding the selected courses to the redux store.
export default function SelectedCourses() {
  const selectedCourses = useAppSelector((state) => state.schedule.sections);
  return (
    <>
      <li>Selected Courses:</li>
      <ul>
        {/* Map through the selected courses and display them here */}
        {selectedCourses.map((course: any) => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>
    </>
  );
}
