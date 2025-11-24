/// Grid.tsx
/// React component for displaying the scheduling grid.
/// Inputs: None
/// Outputs: JSX.Element representing the scheduling grid. Display of Schedule cards
/// Authors: Micheal Buckendahl, Cole Charpentier, Delaney Gray
/// Creation Date: 10/24/2025

import React, { useEffect, useRef, useState } from "react";
import ScheduleCard from "./ScheduleCard";
import { useDispatch } from "react-redux";
import { regenerateSchedules, togglePin } from "../features/scheduleSlice";
import type { ClassData, ScheduledTime, SectionData } from "../types";
import "../styles/ScheduleGridStyles.css";
import {
  getClass,
  getCurrentPermutation,
  getScheduledSections,
  getState,
  unparseTime,
} from "../utils/Utilities";

export default function Grid() {
  const dispatch = useDispatch();
  // Define column headers
  const days = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  // Array of time slots with 30-minute intervals from 8:00am to 8:00pm
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push({ hour, minute: 0 });
    if (hour < 20) {
      // Don't add :30 for the last hour
      timeSlots.push({ hour, minute: 30 });
    }
  }

  // Helper function to format time into 12-hour AM/PM format
  const formatTime = (hour: number, minute: number) => {
    const suffix = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, "0")}${suffix}`;
  };

  const state = getState();

  const permutation: SectionData[] = getCurrentPermutation(state) ?? [];

  const scheduledCourses: SectionData[] = getScheduledSections(permutation);

  // This is a temporary way to have a state instance track what is blocked or not
  const [blockedCells, setBlockedCells] = React.useState<Set<string>>(
    new Set()
  );

  function startsInBlock(
    time: ScheduledTime,
    day: number,
    hour: number,
    minute: number
  ) {
    return (
      time.day === day &&
      Math.floor(time.startTime / 6) === hour * 2 + (minute > 0 ? 1 : 0)
    );
  }

  const firstCellRef = useRef<HTMLDivElement | null>(null);
  const [cellWidth, setCellWidth] = useState(0);
  const [cellHeight, setCellHeight] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!firstCellRef.current) return;
      const rect = firstCellRef.current.getBoundingClientRect();
      setCellWidth(rect.width);
      setCellHeight(rect.height);
    };

    measure(); // initial

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function getSectionHeight(cellHeight: number, time: ScheduledTime): number {
    return cellHeight * ((time.endTime - time.startTime) / 6);
  }

  function getSectionTopPad(cellHeight: number, time: ScheduledTime): number {
    return (cellHeight * (time.startTime % 6)) / 6;
  }

  // A simple function that takes the click of a cell and uses the temporary state above
  // and logs that that cell was clicked as well as updates that state so that the set can be
  // checked later to know which needs to be rendered gray or not.
  const handleCellClick = (
    dayName: string,
    slot: { hour: number; minute: number }
  ) => {
    const timeLabel = formatTime(slot.hour, slot.minute);
    console.log(`Clicked on ${dayName} at ${timeLabel}`);
    const key = `${dayName}-${slot.hour}:${slot.minute}`;
    setBlockedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

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
            let sectionInCell: SectionData | undefined;
            let sectionTime: ScheduledTime | undefined;

            outer: for (const section of scheduledCourses) {
              for (const time of section.times) {
                if (startsInBlock(time, dayIdx + 1, slot.hour, slot.minute)) {
                  sectionInCell = section;
                  sectionTime = time;
                  break outer;
                }
              }
            }

            const sectionCourse = sectionInCell
              ? getClass(sectionInCell, state)
              : undefined;

            return (
              <div
                key={dayIdx}
                className="grid-cell"
                onClick={() => handleCellClick(dayName, slot)}
                style={{
                  backgroundColor: blockedCells.has(
                    `${dayName}-${slot.hour}:${slot.minute}`
                  )
                    ? "#d3d3d3" // gray
                    : "transparent",
                  cursor: "pointer", // changes your mouse cursor so the users knows its clickable
                  transition: "background-color 0.2s ease", // a simple tranition styling so the change isnt shocking
                }}
                ref={slotIdx === 0 && dayIdx === 0 ? firstCellRef : undefined}
              >
                {sectionInCell && sectionTime && sectionCourse && (
                  <ScheduleCard
                    key={sectionCourse.id}
                    name={sectionCourse.name}
                    location={sectionInCell.location || "TBD"}
                    time={
                      days[dayIdx + 1] +
                      " " +
                      unparseTime(sectionTime.startTime) +
                      "-" +
                      unparseTime(sectionTime.endTime)
                    }
                    color={sectionCourse.color || "#ccc"}
                    height={getSectionHeight(cellHeight, sectionTime)}
                    width={cellWidth}
                    topPad={getSectionTopPad(cellHeight, sectionTime)}
                    pinned={sectionInCell.pinned}
                    onPin={() => dispatch(togglePin(sectionInCell.sectionNumber))}
                  />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
