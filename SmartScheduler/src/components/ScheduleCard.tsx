// src/components/ScheduleCard.tsx
/// Component for displaying classes on schedule
/// Inputs: Class Data
/// Outputs: Element of card visual
/// Authors: Delaney Gray
/// Creation Date: 11/08/2025
import "../styles/ScheduleCard.css";

interface ScheduleCardProps {
  name: string;
  location: string;
  time: string;
  color: string;
  height?: number;
  width?: number;
  topPad?: number;
  pinned?: boolean;
  onPin?: () => void; 
}

export default function ScheduleCard({
  name,
  location,
  time,
  color,
  height,
  width,
  topPad,
  pinned,
  onPin,
}: ScheduleCardProps) {
  return (
    <div
      className="schedule-card"
      style={{
        backgroundColor: color,
        height: height,
        width: width,
        paddingTop: topPad,
        position: "relative",
        cursor: onPin ? "pointer" : "default",
      }}
      onClick={onPin}
    >
      {/* Pin image */}
      {pinned && (
        <img
          src="/pin.svg"
          alt="Pinned"
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "16px",
            height: "16px",
            zIndex: 10,
          }}
        />
      )}

      <div className="schedule-card-name">{name}</div>
      <div className="schedule-card-location">{location}</div>
      <div className="schedule-card-time">{time}</div>
    </div>
  );
}
