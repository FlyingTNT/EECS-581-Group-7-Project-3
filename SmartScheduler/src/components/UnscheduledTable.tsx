/// UnscheduledTable.tsx
/// React component for displaying the unscheduled courses in a table format.
/// Inputs: None
/// Outputs: JSX.Element representing the unscheduled courses table.
/// Authors: Micheal Buckendahl, Delaney Gray 
/// Creation Date: 10/24/2025

/// UnscheduledTable.tsx

import React from "react";
import { useAppSelector } from "../redux/hooks";
import ScheduleCard from "./ScheduleCard";
import type { ClassData } from "../types";

export default function UnscheduledTable() {
  const selectedCourses = useAppSelector(state => state.schedule.selectedClasses);

 
  const unscheduledCourses: ClassData[] = selectedCourses.filter(
    course => course.lectures.length === 0
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {unscheduledCourses.length === 0 && <div>No unscheduled courses</div>}
      {unscheduledCourses.map(course => (
        <ScheduleCard
          key={course.id}
          name={course.name}
          location="TBD"
          time="TBD"
          color={course.color || "#ccc"}
        />
      ))}
    </div>
  );
}
