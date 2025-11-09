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
import "../styles/ScheduleGridStyles.css";


export default function Grid() {
  // Define column headers
  const days = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  // Array of time slots with 30-minute intervals from 8:00am to 8:00pm
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push({ hour, minute: 0 });
    if (hour < 20) { // Don't add :30 for the last hour
      timeSlots.push({ hour, minute: 30 });
    }
  }

  // Helper function to format time into 12-hour AM/PM format
  const formatTime = (hour: number, minute: number) => {
    const suffix = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')}${suffix}`;
  };

   const selectedCourses = useAppSelector(
    (state) => state.schedule.selectedClasses
  );

  const scheduledCourses: ClassData[] = selectedCourses.filter(
    (course) => course.lectures.length > 0
  );

  return (
    // Main grid container
    <div className="grid-container">
      {/* Header row */}
      {days.map((day, idx) => (
        <div key={idx} className="grid-cell grid-header">
          {day}
        </div>
      ))}

      {/* Generate rows for each time slot */}
      {timeSlots.map((slot, slotIdx) => (
        <React.Fragment key={slotIdx}>
          {/* Time label */}
          <div className="grid-cell grid-header">
            {formatTime(slot.hour, slot.minute)}
          </div>
          
          {days.slice(1).map((dayName, dayIdx) => {
            const courseInCell = scheduledCourses.find(course =>
              course.lectures[0]?.times[0]?.day === dayIdx &&
              course.lectures[0]?.times[0]?.startTime === slot.hour &&
              (slot.minute === 0 || slot.minute === 30)
            );
            
            return (
              <div key={dayIdx} className="grid-cell">
                {courseInCell && (
                  <ScheduleCard
                    key={courseInCell.id}
                    name={courseInCell.name}
                    location={courseInCell.lectures[0]?.location || "TBD"}
                    time={`${["Mon","Tue","Wed","Thu","Fri"][dayIdx]} ${slot.hour}:${slot.minute.toString().padStart(2, '0')}`}
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
