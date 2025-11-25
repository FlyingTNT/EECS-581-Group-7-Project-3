/**
 * scheduleSlice.ts
 * Inputs: None
 * Outputs: Various functions for modifying the global state for the ScheduleBuilder app
 * Creation Date: 2025-10-23
 * Authors: Micheal Buckendahl, C. Cooper, Delaney Gray, Cole Charpentier
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ClassData, SectionData } from "../types";
import { getClass, getCurrentPermutation, getNextTerm, getPinnedSections, getTermCode } from "../utils/Utilities";
import { filterSchedules, generateSchedules } from "../utils/scheduleAlgorithm";

type ScheduleState = {
  /** The classes that the user has selected thru the search bar */
  selectedClasses: ClassData[];
  /** All possible permutations of the sections of {@link ScheduleState.selectedClasses} */
  permutations: SectionData[][];
  /** The index of the permutation in {@link ScheduleState.permutations} that the user has selected, or -1 if there is no valid permutation. */
  currentPermutation: number;

  /** The times that the user has blocked classes from occuring at.
   * The first index is the day of the week and the second is the time of the day, in 30-minute increments from 12:00am.
   * i.e. blockedTimes[2][3] would refer to Tuesday (2) at 1:30am (3)
   */
  blockedTimes: boolean[][];

  selectedTerm: number;
};

const initialState: ScheduleState = {
  selectedClasses: [],
  permutations: [],
  currentPermutation: -1,
  blockedTimes: Array.from([0, 1, 2, 3, 4, 5, 6], (_) =>
    Array(2 * 24).fill(false)
  ),
  selectedTerm: getTermCode(getNextTerm().year, getNextTerm().season)
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    addCourse(state, action: PayloadAction<ClassData>) {
      state.selectedClasses.push(action.payload);
      console.log("Added class:", action.payload);
    },
    removeCourse(state, action: PayloadAction<string>) {
      state.selectedClasses = state.selectedClasses.filter(
        (s) => s.id !== action.payload
      );
    },
    clearSchedule(state) {
      state.selectedClasses = [];
    },
    /**
     * Regenerate the permutations based on the currently selected courses
     * @param state The current state
     * @param action Whether if the permutations need to be fully regenerated, or it can just be re-filtered, along with whether to always display a dialogue when there is no valid schedule
     */
    regenerateSchedules(state, action: PayloadAction<{fullRegenerate: boolean, reAlert: boolean}>)
    {
      console.log("Re-generating schedules from selectedCourses:", state.selectedClasses);

      const oldScheduleCount = state.permutations.length;

      // The unfiltered schedules - just the current schedules if we don't need to fully regenerate
      let schedules = action.payload.fullRegenerate ? generateSchedules(state.selectedClasses) : state.permutations;

      // Filter the schedules
      schedules = filterSchedules(schedules, getPinnedSections(state.selectedClasses), state.blockedTimes);

      // Push the filtered schedules
      scheduleSlice.caseReducers.reportSchedules(state, {type: "SectionData[][]", payload: schedules});

      // If there are no possible schedules and (there used to be, or we should re-alert anyways), display an alert
      if(schedules.length === 0 && (oldScheduleCount != 0 || action.payload.reAlert))
      {
        window.alert("There are no valid class combinations.");
      }
    },
    /**
     * Push a new set of schedule permutations that have been generated
     * @param state The current state
     * @param action The new permutations
     */
    reportSchedules(state, action: PayloadAction<SectionData[][]>) {
      state.permutations = action.payload;
      if (state.permutations.length === 0) {
        state.currentPermutation = -1;
      } else {
        if (
          state.currentPermutation < 0 ||
          state.currentPermutation >= state.permutations.length
        ) {
          state.currentPermutation = 0;
        }
      }
    },
    togglePin(state, action: PayloadAction<number>){
      const permutation = getCurrentPermutation(state);
      const selection = permutation?.find(s => s.sectionNumber === action.payload);
      if(!selection)
      {
        return;
      }

      const course = getClass(selection, state);

      // Update the pin in the class object
      outer: for(const sectionType in course?.sections)
      {
        for(const section of course.sections[sectionType])
        {
          if(section.sectionNumber === action.payload)
          {
            section.pinned = !section.pinned;
            break outer;
          }
        }
      }

      // Update the pin in the permutation object
      selection.pinned = !selection.pinned;

      // Regenerate the schedules, doing a full regeneration if the section was unpinned
      scheduleSlice.caseReducers.regenerateSchedules(state, {type: "boolean", payload: {fullRegenerate: !selection.pinned, reAlert: false}});
    },
    incrementCurrentPermutation(state) {
      if (state.currentPermutation < state.permutations.length - 1) {
        state.currentPermutation += 1;
      }
    },
    decrementCurrentPermutation(state) {
      if (state.currentPermutation > 0) state.currentPermutation -= 1;
    },
    toggleBlockedTime(state, action: PayloadAction<{ day: number; timeSlot: number }>) {
      const { day, timeSlot } = action.payload;
      state.blockedTimes[day][timeSlot] = !state.blockedTimes[day][timeSlot];

      scheduleSlice.caseReducers.regenerateSchedules(state, {type: "boolean", payload: {fullRegenerate: !state.blockedTimes[day][timeSlot], reAlert: false}});
    },
    setCurrentTerm(state, action: PayloadAction<number>)
    {
      state.selectedTerm = action.payload;

      scheduleSlice.caseReducers.clearSchedule(state);
    }
  },
});

export const {
  addCourse,
  removeCourse,
  clearSchedule,
  reportSchedules,
  togglePin,
  incrementCurrentPermutation,
  decrementCurrentPermutation,
  toggleBlockedTime,
  regenerateSchedules,
  setCurrentTerm
} = scheduleSlice.actions;
export { type ScheduleState };
export default scheduleSlice.reducer;
