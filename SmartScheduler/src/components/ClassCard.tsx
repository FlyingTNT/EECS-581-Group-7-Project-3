/// ClassCard.tsx
/// React component that will display course info in a box format for the user to get a quick idea of what
/// the class is once they have selected it
/// Inputs: It will need to take in a course object that will have the information it will then display
/// Outputs: JSX.Element representing the selected course.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/30/2025

import type { ClassData, SectionData } from "../types";
import { removeCourse } from "../features/scheduleSlice";
import "../styles/ClassCardStyles.css";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useState } from "react";
import { unparseTime } from "../utils/Utilities";

interface ClassCardProps {
  currCourse: ClassData;
}

export default function ClassCard({ currCourse }: ClassCardProps) {
  // Grab all the possible permutations so that we can find the current permutaiton
  const allPermutations = useAppSelector(
    (state) => state.schedule.permutations
  );

  // To get the current permutation we need its index so we grab that from the state
  const currPermutationIndex = useAppSelector(
    (state) => state.schedule.currentPermutation
  );

  // Use the index to grab the current permutation
  const currPermutation = allPermutations[currPermutationIndex];
  const dispatch = useAppDispatch();

  // There is a hook that handles filtering the current list of selected classes, here we pass it
  // the id so that it removes that class
  const handleRemoveClass = () => {
    dispatch(removeCourse(currCourse.id));
  };

  // Simple state that will handle if the dropdown of extra content is being displayed or not
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  // choose preferred order for common types, others render after
  const preferredOrder = ["LEC", "LBN", "DIS"];
  const sectionTypes = Object.keys(currCourse.sections || {}) as string[];
  const sortedSectionTypes = [
    ...preferredOrder.filter((t) => sectionTypes.includes(t)),
    ...sectionTypes.filter((t) => !preferredOrder.includes(t)),
  ];

  const SECTION_TYPE_LABELS: Record<string, string> = {
    ACT: "Activity",
    CLN: "Clinical",
    CON: "Continuance",
    DIS: "Discussion",
    DSO: "Discussion (Optional)",
    EXT: "External",
    FLD: "Field Studies",
    IND: "Independent Study",
    LAB: "Laboratory (Main)",
    LBN: "Laboratory",
    LEC: "Lecture",
    PRA: "Practicum",
    RSC: "Research",
    RSH: "Individual Research",
    SEM: "Seminar",
    SUP: "Supervision",
    THE: "Thesis/Dissertation",
    TUT: "Tutorial",
  };

  const days = ["M", "Tu", "W", "Tr", "F"]; // List that we will use to turn numbers to correct day abreviation

  // Each of the parts that display the sections and there times are lists and bulleted lists need keys for each
  // element so these two helper functions create completely unique keys for each element
  const timeKey = (t: { day: number; startTime: number; endTime: number }) =>
    `${t.day}-${t.startTime}-${t.endTime}`;
  const sectionKey = (type: string, sec: { sectionNumber: string | number }) =>
    `${type}-${sec.sectionNumber}`;

  // This is a function that will be used to display the current permutation sections and there times
  function TimesList({
    times,
  }: {
    times: { day: number; startTime: number; endTime: number }[];
  }) {
    if (!times || times.length === 0) return null;
    return (
      <ul>
        {times.map((t) => (
          <li key={timeKey(t)}>
            {days[t.day - 1] ?? t.day} {unparseTime(t.startTime)} -{" "}
            {unparseTime(t.endTime)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="classCardContainer"
      style={{ backgroundColor: currCourse.color }}
    >
      <div className="cardHeader">
        <div className="idCreditContainer">
          {currCourse.name} {currCourse.maxCredits}
        </div>
        <div className="removeButton" onClick={handleRemoveClass}>
          -
        </div>
      </div>
      <div className="cardContent">
        <div className="sectionDisplay">
          <div className="sectionDisplay">
            {/** Grab the selected section for each type from the current permutation */}
            {(() => {
              const selectedSecs: SectionData[] = (
                currPermutation ?? []
              ).filter((sec: SectionData) => sec.classId === currCourse.id);

              if (selectedSecs.length === 0) return null;
              return (
                <div className="selectedSectionsList">
                  <ul className="sectionList">
                    {selectedSecs.map((sec) => (
                      <li className="sectionItem" key={sectionKey("SEL", sec)}>
                        <div className="sectionHeader">
                          Section {sec.sectionNumber}
                        </div>
                        {/* show times or fallback text */}
                        {(sec.times ?? []).length > 0 ? (
                          <TimesList times={sec.times} />
                        ) : (
                          <ul className="timesList">
                            <li>This has no scheduled time</li>
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
        </div>
        <div
          className="dropDownButton"
          onClick={() => setIsDropDownOpen(!isDropDownOpen)}
        >
          {isDropDownOpen ? "/\\" : "\\/"}
        </div>
      </div>
      {isDropDownOpen && (
        <div className="cardExtraContent">
          <div className="description">{currCourse.description} </div>
          {/* Render every section type dynamically */}
          {sortedSectionTypes.map((type) => {
            const secs = currCourse.sections[type] ?? [];
            if (secs.length === 0) return null;

            const typeLabel = SECTION_TYPE_LABELS[type];

            return (
              <div className={`${type.toLowerCase()}List`} key={type}>
                <div className="sectionTypeLabel">{typeLabel}:</div>
                <ul className="sectionList">
                  {secs.map((sec) => (
                    <li className="sectionItem" key={sectionKey(type, sec)}>
                      <div className="sectionHeader">
                        Section {sec.sectionNumber}
                      </div>
                      {/* show times or fallback text */}
                      {(sec.times ?? []).length > 0 ? (
                        <TimesList times={sec.times} />
                      ) : (
                        <ul className="timesList">
                          <li>This has no scheduled time</li>
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
