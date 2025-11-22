import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ClassData, SectionData } from "../types";

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
};

const initialState: ScheduleState = {
  selectedClasses: [],
  permutations: [],
  currentPermutation: -1,
  blockedTimes: Array.from([0, 1, 2, 3, 4, 5, 6], (_) =>
    Array(2 * 24).fill(false)
  ),
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
    },
  },
});

export const {
  addCourse,
  removeCourse,
  clearSchedule,
  reportSchedules,
  incrementCurrentPermutation,
  decrementCurrentPermutation,
  toggleBlockedTime,
} = scheduleSlice.actions;
export { type ScheduleState };
export default scheduleSlice.reducer;
