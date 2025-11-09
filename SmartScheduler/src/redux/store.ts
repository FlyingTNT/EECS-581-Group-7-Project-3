/// store.ts
/// Redux store configuration for the SmartScheduler application.
/// Inputs: None
/// Outputs: Configured Redux store.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import { configureStore } from "@reduxjs/toolkit";
import scheduleReducer from "../features/scheduleSlice";
import scheduleAlgorithmReducer from "../features/scheduleAlgorithmSlice";

export const store = configureStore({
  reducer: {
    schedule: scheduleReducer,
    scheduleAlgorithm: scheduleAlgorithmReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
