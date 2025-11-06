/// Grid.tsx
/// React component for displaying the scheduling grid.
/// Inputs: None
/// Outputs: JSX.Element representing the scheduling grid.
/// Authors: Micheal Buckendahl, Cole Charpentier
/// Creation Date: 10/24/2025

import React from "react";

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
          {/* Empty day cells for each weekday */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={styles.cell}></div>
          ))}
        </React.Fragment>
      ))}
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
