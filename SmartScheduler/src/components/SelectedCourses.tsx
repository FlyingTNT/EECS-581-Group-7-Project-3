import { useAppSelector } from "../redux/hooks";

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
