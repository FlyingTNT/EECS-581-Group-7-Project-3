/// Grid.tsx
/// React component for displaying the scheduling grid.
/// Inputs: None
/// Outputs: JSX.Element representing the scheduling grid. Display of Schedule cards
/// Authors: Micheal Buckendahl, Cole Charpentier, Delaney Gray 
/// Creation Date: 10/24/2025

import React from "react";
import { useAppSelector } from "../redux/hooks";
import ScheduleCard from "./ScheduleCard";
import type { ClassData, ScheduledTime } from "../types";


export default function Grid() {
  // Define column headers
  const days = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  // Array of hour values from 8 (8:00am) to 20 (8:00pm)
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] // 8am–8pm

  // Helper function to format a 24-hour value into 12-hour AM/PM time
  const formatTime = (hour: number) => {
    const suffix = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00${suffix}`;
  };

   const selectedCourses = useAppSelector(
    (state) => state.schedule.selectedClasses
  );

  const scheduledCourses: ClassData[] = selectedCourses.filter(
    (course) => course.lectures.length > 0
  );

  return (
    // Main grid container
    <div style={styles.container}>
      {/* Header row */}
      {days.map((day, idx) => (
        <div key={idx} style={{ ...styles.cell, ...styles.header }}>
          {day}
        </div>
      ))}

      {/* Generate rows for each hour */}
      {hours.map((hour) => (
        <React.Fragment key={hour}>
          {/* Time label */}
          <div style={{ ...styles.cell, ...styles.timeCell }}>
            {formatTime(hour)}
          </div>

          {days.slice(1).map((dayName, dayIdx) => {
  const courseInCell = scheduledCourses.find(course =>
    course.lectures[0]?.times[0]?.day === dayIdx &&
    course.lectures[0]?.times[0]?.startTime === hour
  );

  return (
    <div key={dayIdx} style={styles.cell}>
      {courseInCell && (
        <ScheduleCard
          key={courseInCell.id}
          name={courseInCell.name}
          location={courseInCell.lectures[0]?.location || "TBD"}
          time={`${["Mon","Tue","Wed","Thu","Fri"][dayIdx]} ${hour}:00`} 
          color={courseInCell.color || "#ccc"}
        />
      )}
    </div>
  );
})}


        </React.Fragment>
      ))}

      {/*display sched cards */}
      {scheduledCourses.map((course) => {
        const firstLectureTime: ScheduledTime | undefined = course.lectures[0]?.times[0];

        const timeText = firstLectureTime
          ? `${["Mon", "Tue", "Wed", "Thu", "Fri"][firstLectureTime.day]} ${firstLectureTime.startTime}-${firstLectureTime.endTime}`
          : "TBD";

        const location = firstLectureTime ? course.lectures[0]?.location || "TBD" : "TBD";

        return (
          <ScheduleCard
            key={course.id}
            name={course.name}
            location={location}
            time={timeText}
            color={course.color || "#ccc"}
          />
        );
      })}


    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "grid",
    gridTemplateColumns: "100px repeat(5, 1fr)", // 6 columns: 1 for times
    border: "1px solid #ccc",
    textAlign: "center",
    maxHeight: "65vh", // Limits grid to 65% of viewport height
    overflowY: "auto", // Adds scroll if content exceeds max height
  },
  cell: {
    border: "1px solid #ddd",
    height: "5vh", // Dynamic height based on viewport
    width: "100%", // Full width within grid column
    minHeight: "40px",
    minWidth: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#f0f0f0",
  },
  timeCell: {
    backgroundColor: "#fafafa",
  },
};
