/// ClassCard.tsx
/// React component that will display course info in a box format for the user to get a quick idea of what
/// the class is once they have selected it
/// Inputs: It will need to take in a course object that will have the information it will then display
/// Outputs: JSX.Element representing the selected course.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/30/2025

import type { ClassData, SectionData } from "../types";
import { removeCourse } from "../features/scheduleSlice";
import "../styles/classCardStyles.css";
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

  // Each classData object has these different lists of sections so here we are just pulling it out of the object
  const lecSections = currCourse.sections["LEC"];
  const labSections = currCourse.sections["LBN"];
  const DiscussionSections = currCourse.sections["DIS"];

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
          {currCourse.id} - {currCourse.maxCredits}
        </div>
        <div className="removeButton" onClick={handleRemoveClass}>
          -
        </div>
      </div>
      <div className="cardContent">
        <div className="sectionDisplay">
          <div className="sectionDisplay">
            {/** Grab the selected section for each type from the current permutation */}
            {(["LEC", "LBN", "DIS"] as const).map((t) => {
              const sel = currPermutation?.find(
                (sec: SectionData) =>
                  sec.classId === currCourse.id && sec.type === t
              );
              if (!sel) return null; // if this type isn't selected in the permutation, don't render it

              const label =
                t === "LEC" ? "LEC:" : t === "LBN" ? "LAB:" : "DIS:";

              return (
                <div
                  className={
                    t === "LEC"
                      ? "currSectionLec"
                      : t === "LBN"
                      ? "currSectionLab"
                      : "currSectionDis"
                  }
                  key={sectionKey(t, { sectionNumber: sel.sectionNumber })}
                >
                  {label} <TimesList times={sel.times} />
                </div>
              );
            })}
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
          {/* Lectures */}
          {(lecSections ?? []).length > 0 && (
            <div className="lecList">
              <div className="sectionTypeLabel">lectures:</div>
              {/* This creates a list of all the possible sections for this calss */}
              <ul className="sectionList">
                {(lecSections ?? []).map((sec) => (
                  <li className="sectionItem" key={sectionKey("LEC", sec)}>
                    <div className="sectionHeader">
                      Section {sec.sectionNumber}
                    </div>
                    {/* This then creates a list for all the times for that section */}
                    <ul className="timesList">
                      {(sec.times ?? []).length > 0 ? (
                        sec.times.map((t) => (
                          // the times get parsed into ints that need to be unparsed to get the normal times
                          // so here we are unparsing the times. As well as using that list to get from a a int
                          // to a week abreviation.
                          <li key={timeKey(t)}>
                            {days[t.day - 1] ?? t.day}{" "}
                            {unparseTime(t.startTime)} -{" "}
                            {unparseTime(t.endTime)}
                          </li>
                        ))
                      ) : (
                        // There are cases where something doesnt have a scheduled time for that section so we just
                        // simply display that to the user
                        <li>This has no scheduled time</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Labs */}
          {(labSections ?? []).length > 0 && (
            <div className="labList">
              <div className="sectionTypeLabel">labs:</div>
              <ul className="sectionList">
                {(labSections ?? []).map((sec) => (
                  <li className="sectionItem" key={sectionKey("LBN", sec)}>
                    <div className="sectionHeader">
                      Section {sec.sectionNumber}
                    </div>
                    <ul className="timesList">
                      {(sec.times ?? []).length > 0 ? (
                        sec.times.map((t) => (
                          <li key={timeKey(t)}>
                            {days[t.day - 1] ?? t.day}{" "}
                            {unparseTime(t.startTime)} -{" "}
                            {unparseTime(t.endTime)}
                          </li>
                        ))
                      ) : (
                        <li>This has no scheduled time</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Discussions */}
          {(DiscussionSections ?? []).length > 0 && (
            <div className="discussionList">
              <div className="sectionTypeLabel">discussion:</div>
              <ul className="sectionList">
                {(DiscussionSections ?? []).map((sec) => (
                  <li className="sectionItem" key={sectionKey("DIS", sec)}>
                    <div className="sectionHeader">
                      Section {sec.sectionNumber}
                    </div>
                    <ul className="timesList">
                      {(sec.times ?? []).length > 0 ? (
                        sec.times.map((t) => (
                          <li key={timeKey(t)}>
                            {days[t.day - 1] ?? t.day}{" "}
                            {unparseTime(t.startTime)} -{" "}
                            {unparseTime(t.endTime)}
                          </li>
                        ))
                      ) : (
                        <li>This has no scheduled time</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
