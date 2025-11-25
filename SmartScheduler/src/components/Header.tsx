/// Header.tsx
/// Basic React component to create a simple header for the application.
/// Inputs: None
/// Outputs: JSX.Element representing the header.
/// Authors: Micheal Buckendahl, C. Cooper
/// Creation Date: 10/24/2025

import "../styles/HeaderStyles.css";
import TermSelector from "./TermSelector";

// A very simple div that is styled to be a header bar with the application name.
export default function Header() {
  return <div className="appHeader"><div>SmartScheduler</div> <TermSelector></TermSelector></div>;
}
