import type { Extent } from 'ol/extent';
import { boundingExtent, isEmpty } from 'ol/extent';

export const combineExtents = (extents: Extent[]): Extent | null => {
  if (extents.length === 0) {
    return null;
  }

  const merged = boundingExtent(extents.flatMap((extent) => [[extent[0], extent[1]], [extent[2], extent[3]]])) as Extent;

  return isEmpty(merged) ? null : merged;
};
