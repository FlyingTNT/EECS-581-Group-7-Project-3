/// UnscheduledTable.tsx
/// React component for displaying the unscheduled courses in a table format.
/// Inputs: None
/// Outputs: JSX.Element representing the unscheduled courses table.
/// Authors: Micheal Buckendahl, Delaney Gray 
/// Creation Date: 10/24/2025

/// UnscheduledTable.tsx

import ScheduleCard from "./ScheduleCard";
import type { SectionData } from "../types";
import { getClass, getCurrentPermutation, getState, getUnscheduledSections } from "../utils/Utilities";

export default function UnscheduledTable() {
 
  const state = getState();
  const permutation = getCurrentPermutation(state) ?? [];
  const unscheduledCourses: SectionData[] = getUnscheduledSections(permutation);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {unscheduledCourses.length === 0 && <div>No unscheduled courses</div>}
      {unscheduledCourses.map(section => {
        const course = getClass(section, state);

        if(!course)
        {
          return;
        }

        return (
        <ScheduleCard
          key={course.id}
          name={course.name}
          location={section.location}
          time="TBD"
          color={course.color || "#ccc"}
        />
      )})}
    </div>
  );
}
