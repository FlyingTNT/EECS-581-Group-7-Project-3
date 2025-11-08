// src/components/ScheduleCard.tsx
/// Component for displaying classes on schedule
/// Inputs: Class Data
/// Outputs: Element of card visual
/// Authors: Delaney Gray
/// Creation Date: 11/08/2025
import React from "react";
import "../styles/ScheduleCard.css";

interface ScheduleCardProps {
  name: string;
  location: string;
  time: string;
  color: string;
}

export default function ScheduleCard({ name, location, time, color }: ScheduleCardProps) {
  return (
    <div className="schedule-card" style={{ backgroundColor: color }}>
      <div className="schedule-card-name">{name}</div>
      <div className="schedule-card-location">{location}</div>
      <div className="schedule-card-time">{time}</div>
    </div>
  );
}
