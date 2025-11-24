/// Grid.tsx
/// React component for displaying the scheduling grid.
/// Inputs: None
/// Outputs: JSX.Element representing the scheduling grid. Display of Schedule cards
/// Authors: Micheal Buckendahl, Cole Charpentier, Delaney Gray, C. Cooper
/// Creation Date: 10/24/2025

import React, { useEffect, useRef, useState } from "react";
import ScheduleCard from "./ScheduleCard";
import { togglePin } from "../features/scheduleSlice";
import type { ScheduledTime, SectionData } from "../types";
import "../styles/ScheduleGridStyles.css";
import {
  getClass,
  getCurrentPermutation,
  getScheduledSections,
  getState,
  unparseTime,
} from "../utils/Utilities";
import { useAppDispatch } from "../redux/hooks";
import { toggleBlockedTime } from "../features/scheduleSlice";

export default function Grid() {
  const dispatch = useAppDispatch();
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
  // To see blocked times array
  useEffect(() => {
    console.log('Current blocked times:', state.blockedTimes);
  }, [state.blockedTimes]);
  
  const permutation: SectionData[] = getCurrentPermutation(state) ?? [];

  const scheduledCourses: SectionData[] = getScheduledSections(permutation);

  function startsInBlock(
    time: ScheduledTime,
    day: number,
    hour: number,
    minute: number
  ) {
    return (
      time.day === day && // The same day
      Math.floor(time.startTime / 6) === hour * 2 + (minute > 0 ? 1 : 0) // And the same 30-minute period
    );
  }

  // The first cell in the grid, and its width and height, for rendering the sections the correct size
  const firstCellRef = useRef<HTMLDivElement | null>(null);
  const [cellWidth, setCellWidth] = useState(0);
  const [cellHeight, setCellHeight] = useState(0);

  // Keep the first cell width and height updated
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

  /**
   * Get the height of the section with the given ScheduledTime
   * @param cellHeight The height of one cell in the grid
   * @param time The time of the section
   * @returns The height of the section
   */
  function getSectionHeight(cellHeight: number, time: ScheduledTime): number {
    // Return the height of one cell times the number of 30-minutes the section takes up
    return cellHeight * ((time.endTime - time.startTime) / 6);
  }

  /**
   * Get amount of padding above the section for the section with the given ScheduledTime
   * @param cellHeight The height of one cell in the grid
   * @param time The time of the section
   * @returns The top padding for the section
   */
  function getSectionTopPad(cellHeight: number, time: ScheduledTime): number {
    // Return the cell height times the percentage of a 30-minute block after a 30-minute marker that the class starts (e.g. height * .50 for :15 or :45)
    return (cellHeight * (time.startTime % 6)) / 6;
  }

  // Convert hour and minute to time slot index (30-minute increments from 12:00am)
  const getTimeSlotIndex = (hour: number, minute: number): number => {
    return hour * 2 + (minute >= 30 ? 1 : 0);
  };
  
  // Handle cell click to toggle blocked time in Redux
  const handleCellClick = (
    dayIdx: number,
    slot: { hour: number; minute: number }
  ) => {
    const timeSlotIndex = getTimeSlotIndex(slot.hour, slot.minute);
    dispatch(toggleBlockedTime({ day: dayIdx + 1, timeSlot: timeSlotIndex }));
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


            const timeSlotIndex = getTimeSlotIndex(slot.hour, slot.minute);
          
            const isBlocked = state.blockedTimes[dayIdx + 1]?.[timeSlotIndex] || false;
          
            return (
              <div
                key={dayIdx}
                className="grid-cell"
                onClick={() => handleCellClick(dayIdx, slot)}
                style={{
                  backgroundColor:
                    isBlocked ? "#d3d3d3" // gray
                    : "transparent",
                  cursor: "pointer", // changes your mouse cursor so the users knows its clickable
                  transition: "background-color 0.2s ease", // a simple tranition styling so the change isnt shocking
                }}
                ref={slotIdx === 0 && dayIdx === 0 ? firstCellRef : undefined}
              >
                {sectionInCell && sectionTime && sectionCourse && (
                  <ScheduleCard
                    key={sectionCourse.id + sectionInCell.times[0].day + unparseTime(sectionInCell.times[0].startTime)}
                    name={sectionCourse.id + " " + sectionInCell.type}
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
