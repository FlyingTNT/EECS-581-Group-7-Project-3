/// hooks.ts
/// Custom hooks for typed Redux usage in the SmartScheduler application.
/// Inputs: None
/// Outputs: Typed hooks for use throughout the application.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
