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

  // Filter out full sections (openSeats <= 0)
  const filterOpen = (s: SectionData[]) => s.filter(sec => sec.openSeats > 0);

  const lectures = filterOpen(sections["LEC"] || []);
  const labs = filterOpen([...(sections["LAB"] || []), ...(sections["LBN"] || [])]);
  const discussions = filterOpen([...(sections["DIS"] || []), ...(sections["DSO"] || [])]);
  const activities = filterOpen(sections["ACT"] || []);

  // Rules:
  // 1. If there are lectures, combine with dependent types (lab/discussion/activity)
  // 2. If no lectures, treat remaining sections as independent

  if (lectures.length > 0) {
    const bundles: SectionData[][] = [];

    for (const lec of lectures) {
      const labsOrNone = labs.length > 0 ? labs : [null];
      const discsOrNone = discussions.length > 0 ? discussions : [null];
      const actsOrNone = activities.length > 0 ? activities : [null];

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

  // No lectures — treat each section independently
  const allTypes = Object.values(sections).flat().filter(sec => sec.openSeats > 0);
  return allTypes.map(s => [s]);
}

export function filterSchedules(
  schedules: SectionData[][],
  pinned: number[],
  blockedSlots: string[]
): SectionData[][] {

  return schedules.filter(schedule => {

    // Must contain ALL pinned sections
    const hasPinned = pinned.every(pin =>
      schedule.some(sec => sec.sectionNumber === pin)
    );
    if (!hasPinned) return false;

    // Must NOT touch any blocked time slot
    const hitsBlocked = schedule.some(sec =>
      sec.times.some(t => {
        const slotIndex = Math.floor(t.startTime / 6);
        const key = `${t.day}-${slotIndex}`;
        return blockedSlots.includes(key);
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


