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

  const lectures = sections["LEC"] || [];
  const labs = [...(sections["LAB"] || []), ...(sections["LBN"] || [])];
  const discussions = [...(sections["DIS"] || []), ...(sections["DSO"] || [])];
  const activities = sections["ACT"] || [];

  //  Rules:
  // 1. If there are lectures, combine with any dependent types (lab/discussion/activity)
  // 2. If no lectures, treat remaining sections as independent

  // Case A: Lecture-based course
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

  // Case B: No lectures — just treat each section as independent
  const allTypes = Object.values(sections).flat();
  return allTypes.map(s => [s]);
}





/** Main entry point — generates all conflict-free schedules. */
export function generateSchedules(classes: ClassData[]): SectionData[][] {
  const sectionGroups = classes.map(buildCourseSectionBundles);
  const allCombos = generateCombinations(sectionGroups);
  return allCombos.filter(isConflictFree);
}

