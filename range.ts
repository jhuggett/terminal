/**
 * Includes start and end.
 */
export const multidimensionalRange = (
  sections: { start: number; end: number }[],
  doForEach: (coordinates: number[]) => void,
  dimensionalDepth: number[] = []
) => {
  const section = sections[0];
  if (!section) {
    return doForEach(dimensionalDepth);
  }

  for (let i = section.start; i <= section.end; i++) {
    multidimensionalRange(sections.slice(1), doForEach, [
      ...dimensionalDepth,
      i,
    ]);
  }
};
