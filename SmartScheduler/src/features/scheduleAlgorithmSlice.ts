import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ScheduleAlgorithmState = {
  allSchedules: any[];         // all valid schedules
  generatedSchedules: any[];   // filtered schedules
  pinnedSections: number[];    // sectionNumbers the user pinned
  blockedSlots: string[];      // e.g. "1-16" meaning Monday 8:00am
};

const initialState: ScheduleAlgorithmState = {
  allSchedules: [],
  generatedSchedules: [],
  pinnedSections: [],
  blockedSlots: [],
};

export const scheduleAlgorithmSlice = createSlice({
  name: "scheduleAlgorithm",
  initialState,
  reducers: {
    setAllSchedules(state, action: PayloadAction<any[]>) {
      state.allSchedules = action.payload;
    },
    setGeneratedSchedules(state, action: PayloadAction<any[]>) {
      state.generatedSchedules = action.payload;
    },
    setPinnedSections(state, action: PayloadAction<number[]>) {
      state.pinnedSections = action.payload;
    },
    setBlockedSlots(state, action: PayloadAction<string[]>) {
      state.blockedSlots = action.payload;
    },
    clearAll(state) {
      state.allSchedules = [];
      state.generatedSchedules = [];
      state.pinnedSections = [];
      state.blockedSlots = [];
    },
  },
});

export const {
  setAllSchedules,
  setGeneratedSchedules,
  setPinnedSections,
  setBlockedSlots,
  clearAll
} = scheduleAlgorithmSlice.actions;

export default scheduleAlgorithmSlice.reducer;
