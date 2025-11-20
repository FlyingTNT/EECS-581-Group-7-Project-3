import type { ClassData, SectionData } from "../types";

/** Generate all combinations of sections across selected classes. */
export function generateCombinations(classBundles: SectionData[][][]): SectionData[][] {
  if (classBundles.length === 0) return [[]];
  const [first, ...rest] = classBundles;
  const restCombos = generateCombinations(rest);

  const result: SectionData[][] = [];
  for (const bundle of first) {
    for (const combo of restCombos) {
      result.push([...bundle, ...combo]);
    }
  }
  return result;
}


/** Check if two sections overlap in time. */
function sectionsConflict(a: SectionData, b: SectionData): boolean {
  for (const t1 of a.times) {
    for (const t2 of b.times) {
      if (t1.day === t2.day && !(t1.endTime <= t2.startTime || t2.endTime <= t1.startTime)) {
        return true;
      }
    }
  }
  return false;
}

/** Determine if a schedule (set of sections) has no conflicts. */
function isConflictFree(schedule: SectionData[]): boolean {
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      if (sectionsConflict(schedule[i], schedule[j])) return false;
    }
  }
  return true;
}

function buildCourseSectionBundles(course: ClassData): SectionData[][] {
  const { sections } = course;

  // Helper: filter out full sections
  const filterOpen = (s: SectionData[]) => s.filter(sec => sec.openSeats > 0);

  // Group types together
  const lectures    = filterOpen(sections["LEC"] || []);
  const labs        = filterOpen([...(sections["LAB"] || []), ...(sections["LBN"] || [])]);
  const discussions = filterOpen([...(sections["DIS"] || []), ...(sections["DSO"] || [])]);
  const activities  = filterOpen(sections["ACT"] || []);

  // ----------------------------
  // CASE 1: Normal course with a lecture
  // ----------------------------
  if (lectures.length > 0) {
    const bundles: SectionData[][] = [];

    const labsOrNone  = labs.length > 0 ? labs : [null];
    const discsOrNone = discussions.length > 0 ? discussions : [null];
    const actsOrNone  = activities.length > 0 ? activities : [null];

    for (const lec of lectures) {
      for (const lab of labsOrNone) {
        for (const dis of discsOrNone) {
          for (const act of actsOrNone) {
            const bundle = [lec, lab, dis, act].filter(Boolean) as SectionData[];
            bundles.push(bundle);
          }
        }
      }
    }

    return bundles;
  }

  // ----------------------------
  // CASE 2: No lecture — but multiple required types (e.g., LAB + DIS)
  // ----------------------------
  const typeGroups = [labs, discussions, activities].filter(g => g.length > 0);

  // If a class has multiple types, we must choose one section from each type
  if (typeGroups.length > 1) {
    const bundles: SectionData[][] = [];

    function buildBundles(idx: number, current: SectionData[]) {
      if (idx === typeGroups.length) {
        bundles.push([...current]);
        return;
      }

      for (const sec of typeGroups[idx]) {
        buildBundles(idx + 1, [...current, sec]);
      }
    }

    buildBundles(0, []);

    return bundles;
  }

  // ----------------------------
  // CASE 3: Only one type (simple class)
  // ----------------------------
  const allTypes = Object.values(sections).flat().filter(sec => sec.openSeats > 0);
  return allTypes.map(s => [s]);
}


export function filterSchedules(
  schedules: SectionData[][],
  pinned: number[],
  blockedTimes: boolean[][]
): SectionData[][] {
  return schedules.filter(schedule => {
    //needs to contain all pinned sections
    const hasPinned = pinned.every(pin =>
      schedule.some(sec => sec.sectionNumber === pin)
    );
    if (!hasPinned) return false;

    // needs to not overlap any blocked time
    const hitsBlocked = schedule.some(sec =>
      sec.times.some(t => {
        // Convert startTime and endTime (5-min intervals) to slot indices (30-min)
        const startSlot = Math.floor(t.startTime / 6); // 6 * 5 min = 30 min
        const endSlot = Math.ceil(t.endTime / 6);      // get end time too

        for (let slot = startSlot; slot < endSlot; slot++) {
          if (blockedTimes[t.day][slot]) {
            return true; // hits a blocked time slot
          }
        }
        return false;
      })
    );
    if (hitsBlocked) return false;

    return true;
  });
}







/** Main entry point — generates all conflict-free schedules. */
export function generateSchedules(classes: ClassData[]): SectionData[][] {
  const sectionGroups = classes.map(buildCourseSectionBundles);

  const allCombos = generateCombinations(sectionGroups);

  const conflictFree = allCombos.filter(isConflictFree);

  return conflictFree;
}


