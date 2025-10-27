/// Header.tsx
/// Basic React component to create a simple header for the application.
/// Inputs: None
/// Outputs: JSX.Element representing the header.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import "../styles/HeaderStyles.css";

// A very simple div that is styled to be a header bar with the application name.
export default function Header() {
  return <div className="header">SmartScheduler</div>;
}
