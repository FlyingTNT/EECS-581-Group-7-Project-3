/// UnscheduledTable.tsx
/// React component for displaying the unscheduled courses in a table format.
/// Inputs: None
/// Outputs: JSX.Element representing the unscheduled courses table.
/// Authors: Micheal Buckendahl, Delaney Gray
/// Creation Date: 10/24/2025

/// UnscheduledTable.tsx

import ScheduleCard from "./ScheduleCard";
import type { SectionData } from "../types";
import "../styles/UnscheduledTableStyles.css";
import {
  getClass,
  getCurrentPermutation,
  getState,
  getUnscheduledSections,
} from "../utils/Utilities";
import { useState } from "react";

export default function UnscheduledTable() {
  const state = getState();
  const permutation = getCurrentPermutation(state) ?? [];
  const unscheduledCourses: SectionData[] = getUnscheduledSections(permutation);

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  return (
    <div>
      <div
        className="pullUpHeader"
        onClick={() => setIsDropDownOpen(!isDropDownOpen)}
      >
        <div>Unscheduled Sections</div>

        <div className="unsDropDownButton">
          {isDropDownOpen ? "/\\" : "\\/"}
        </div>
      </div>

      {isDropDownOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {unscheduledCourses.length === 0 && <div>No unscheduled courses</div>}
          {unscheduledCourses.map((section) => {
            const course = getClass(section, state);

            if (!course) {
              return;
            }

            return (
              <ScheduleCard
                key={course.id}
                name={course.name}
                location={section.location}
                time="Unscheduled"
                color={course.color || "#ccc"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
