import { useAppDispatch, useAppSelector } from "../redux/hooks";
import "../styles/PaginationControlStyles.css";
import {
  incrementCurrentPermutation,
  decrementCurrentPermutation,
} from "../features/scheduleSlice";

export default function PaginationControls() {
  const allPermutations = useAppSelector(
    (state) => state.schedule.permutations
  );
  const totalPermutations = allPermutations.length;
  const currentPermutation = useAppSelector(
    (state) => state.schedule.currentPermutation
  );

  const dispatch = useAppDispatch();

  // if currentPermutation is set to -1 that means there are no permutations
  if (currentPermutation === -1) return;
  const atMaxPerm = currentPermutation + 1 === totalPermutations;
  const atMinPerm = currentPermutation === 0;

  return (
    <div className="paginationContainer">
      {!atMinPerm && (
        <div
          className="leftArrow"
          onClick={() => dispatch(decrementCurrentPermutation())}
        >
          &lt;
        </div>
      )}
      <div className="currentPerm">
        {currentPermutation + 1} out of {totalPermutations}
      </div>
      {!atMaxPerm && (
        <div
          className="rightArrow"
          onClick={() => dispatch(incrementCurrentPermutation())}
        >
          &gt;
        </div>
      )}
    </div>
  );
}
