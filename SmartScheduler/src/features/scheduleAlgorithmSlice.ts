import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ScheduleAlgorithmState = {
  generatedSchedules: any[];
}

const initialState: ScheduleAlgorithmState = {
  generatedSchedules: [],
};

export const scheduleAlgorithmSlice = createSlice({
  name: "scheduleAlgorithm",
  initialState,
  reducers: {
    setGeneratedSchedules(state, action: PayloadAction<any[]>) {
      state.generatedSchedules = action.payload;
    },
    clearGeneratedSchedules(state) {
      state.generatedSchedules = [];
    },
  },
});

export const { setGeneratedSchedules, clearGeneratedSchedules } =
  scheduleAlgorithmSlice.actions;

export default scheduleAlgorithmSlice.reducer;

export function generateSchedulesPlaceholder() {
}
