/// TotalCreditHours.tsx
/// React component for displaying the total credit hours of selected courses.
/// Inputs: None
/// Outputs: JSX.Element representing the total credit hours.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import { useAppSelector } from "../redux/hooks";
import "../styles/TotalCreditHoursStyle.css";

// Displays the total amount of credit hours based on the currently selected courses.
export default function TotalCreditHours() {
  const currentPermutationIndex = useAppSelector(
    (state) => state.schedule.currentPermutation
  );
  const permutaitons = useAppSelector((state) => state.schedule.permutations);
  if (currentPermutationIndex === -1) {
    return <div className="totalCredits">Total Credit Hours: 0</div>;
  }
  const currentPermutation = permutaitons[currentPermutationIndex];
  let seenSections: string[] = [];
  let totalHours = 0;
  currentPermutation.map((section) => {
    if (!seenSections.includes(section.classId))
      totalHours += section.maxCredits;
    seenSections.push(section.classId);
  });
  return <div className="totalCredits">Total Credit Hours: {totalHours}</div>;
}
