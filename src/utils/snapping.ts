/**
 * Smart Snapping and Alignment Guide calculations for flowchart shapes and connectors
 */

export interface Box {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnappingGuide {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number; // coordinate where line is drawn (x for vertical, y for horizontal)
  start: number; // perpendicular axis start (min coordinate)
  end: number; // perpendicular axis end (max coordinate)
  kind: 'edge' | 'center' | 'size' | 'gap';
  label?: string; // e.g. "Center", "Aligned", "150px"
  targetPoint?: { x: number; y: number };
  referencePoint?: { x: number; y: number };
}

export interface MoveSnapResult {
  snappedX: number;
  snappedY: number;
  deltaX: number; // adjustment applied to X
  deltaY: number; // adjustment applied to Y
  guides: SnappingGuide[];
}

export interface ResizeSnapResult {
  box: Box;
  guides: SnappingGuide[];
}

export type ResizeHandleDirection =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w';

/**
 * Compute smart snapping for moving elements.
 * Snaps to edges (left, center, right, top, center, bottom) and equal gaps of reference elements.
 */
export function computeMoveSnapping(
  targetBox: Box,
  referenceBoxes: Box[],
  threshold: number = 8
): MoveSnapResult {
  if (referenceBoxes.length === 0) {
    return {
      snappedX: targetBox.x,
      snappedY: targetBox.y,
      deltaX: 0,
      deltaY: 0,
      guides: [],
    };
  }

  const guides: SnappingGuide[] = [];

  // Proposed coordinates
  const tLeft = targetBox.x;
  const tCenterX = targetBox.x + targetBox.width / 2;
  const tRight = targetBox.x + targetBox.width;

  const tTop = targetBox.y;
  const tCenterY = targetBox.y + targetBox.height / 2;
  const tBottom = targetBox.y + targetBox.height;

  // --- X-Axis Snapping (Vertical Guide Lines) ---
  let bestXDiff: number | null = null;
  let bestXGuide: SnappingGuide | null = null;

  for (const ref of referenceBoxes) {
    const rLeft = ref.x;
    const rCenterX = ref.x + ref.width / 2;
    const rRight = ref.x + ref.width;

    const xChecks: {
      targetVal: number;
      refVal: number;
      label: string;
      kind: 'center' | 'edge';
    }[] = [
      // Centers
      { targetVal: tCenterX, refVal: rCenterX, label: 'Align Center', kind: 'center' },
      // Edges (same side)
      { targetVal: tLeft, refVal: rLeft, label: 'Align Left', kind: 'edge' },
      { targetVal: tRight, refVal: rRight, label: 'Align Right', kind: 'edge' },
      // Edges (opposite sides)
      { targetVal: tLeft, refVal: rRight, label: 'Snap Edge', kind: 'edge' },
      { targetVal: tRight, refVal: rLeft, label: 'Snap Edge', kind: 'edge' },
      // Center to edges
      { targetVal: tCenterX, refVal: rLeft, label: 'Center to Left', kind: 'center' },
      { targetVal: tCenterX, refVal: rRight, label: 'Center to Right', kind: 'center' },
    ];

    for (const check of xChecks) {
      const diff = check.refVal - check.targetVal;
      const absDiff = Math.abs(diff);

      if (absDiff <= threshold) {
        if (bestXDiff === null || absDiff < Math.abs(bestXDiff)) {
          bestXDiff = diff;
          const minY = Math.min(targetBox.y, ref.y) - 16;
          const maxY = Math.max(targetBox.y + targetBox.height, ref.y + ref.height) + 16;

          bestXGuide = {
            id: `guide-v-${check.refVal.toFixed(1)}`,
            type: 'vertical',
            position: check.refVal,
            start: minY,
            end: maxY,
            kind: check.kind,
            label: check.label,
            targetPoint: { x: check.refVal, y: tCenterY },
            referencePoint: { x: check.refVal, y: ref.y + ref.height / 2 },
          };
        }
      }
    }
  }

  const deltaX = bestXDiff ?? 0;
  const snappedX = targetBox.x + deltaX;
  if (bestXGuide) {
    guides.push(bestXGuide);
  }

  // --- Y-Axis Snapping (Horizontal Guide Lines) ---
  let bestYDiff: number | null = null;
  let bestYGuide: SnappingGuide | null = null;

  for (const ref of referenceBoxes) {
    const rTop = ref.y;
    const rCenterY = ref.y + ref.height / 2;
    const rBottom = ref.y + ref.height;

    const yChecks: {
      targetVal: number;
      refVal: number;
      label: string;
      kind: 'center' | 'edge';
    }[] = [
      // Centers
      { targetVal: tCenterY, refVal: rCenterY, label: 'Align Center', kind: 'center' },
      // Edges (same side)
      { targetVal: tTop, refVal: rTop, label: 'Align Top', kind: 'edge' },
      { targetVal: tBottom, refVal: rBottom, label: 'Align Bottom', kind: 'edge' },
      // Edges (opposite sides)
      { targetVal: tTop, refVal: rBottom, label: 'Snap Edge', kind: 'edge' },
      { targetVal: tBottom, refVal: rTop, label: 'Snap Edge', kind: 'edge' },
      // Center to edges
      { targetVal: tCenterY, refVal: rTop, label: 'Center to Top', kind: 'center' },
      { targetVal: tCenterY, refVal: rBottom, label: 'Center to Bottom', kind: 'center' },
    ];

    for (const check of yChecks) {
      const diff = check.refVal - check.targetVal;
      const absDiff = Math.abs(diff);

      if (absDiff <= threshold) {
        if (bestYDiff === null || absDiff < Math.abs(bestYDiff)) {
          bestYDiff = diff;
          const minX = Math.min(snappedX, ref.x) - 16;
          const maxX = Math.max(snappedX + targetBox.width, ref.x + ref.width) + 16;

          bestYGuide = {
            id: `guide-h-${check.refVal.toFixed(1)}`,
            type: 'horizontal',
            position: check.refVal,
            start: minX,
            end: maxX,
            kind: check.kind,
            label: check.label,
            targetPoint: { x: snappedX + targetBox.width / 2, y: check.refVal },
            referencePoint: { x: ref.x + ref.width / 2, y: check.refVal },
          };
        }
      }
    }
  }

  const deltaY = bestYDiff ?? 0;
  const snappedY = targetBox.y + deltaY;
  if (bestYGuide) {
    guides.push(bestYGuide);
  }

  // --- Smart Gap / Equal Spacing Snapping ---
  // If no edge snap occurred on an axis, check for equal distance between adjacent shapes
  if (!bestXGuide && referenceBoxes.length >= 2) {
    const sortedByX = [...referenceBoxes].sort((a, b) => a.x - b.x);
    for (let i = 0; i < sortedByX.length - 1; i++) {
      const a = sortedByX[i];
      const b = sortedByX[i + 1];
      const gap = b.x - (a.x + a.width);
      if (gap > 10) {
        // Check if target is after b with same gap
        const expectedXAfter = b.x + b.width + gap;
        if (Math.abs(targetBox.x - expectedXAfter) <= threshold) {
          const gapDelta = expectedXAfter - targetBox.x;
          return {
            snappedX: expectedXAfter,
            snappedY,
            deltaX: gapDelta,
            deltaY,
            guides: [
              ...guides,
              {
                id: `guide-gap-x-${b.id || i}`,
                type: 'vertical',
                position: expectedXAfter,
                start: Math.min(targetBox.y, b.y) - 10,
                end: Math.max(targetBox.y + targetBox.height, b.y + b.height) + 10,
                kind: 'gap',
                label: `Equal Gap: ${Math.round(gap)}px`,
              },
            ],
          };
        }
      }
    }
  }

  return {
    snappedX,
    snappedY,
    deltaX,
    deltaY,
    guides,
  };
}

/**
 * Compute smart snapping for element resizing
 */
export function computeResizeSnapping(
  origBox: Box,
  handle: ResizeHandleDirection,
  proposedBox: Box,
  referenceBoxes: Box[],
  threshold: number = 8,
  minWidth: number = 40,
  minHeight: number = 30
): ResizeSnapResult {
  const resultBox: Box = {
    x: proposedBox.x,
    y: proposedBox.y,
    width: Math.max(minWidth, proposedBox.width),
    height: Math.max(minHeight, proposedBox.height),
  };

  const guides: SnappingGuide[] = [];

  const movesRight = handle === 'e' || handle === 'se' || handle === 'ne';
  const movesLeft = handle === 'w' || handle === 'sw' || handle === 'nw';
  const movesBottom = handle === 's' || handle === 'se' || handle === 'sw';
  const movesTop = handle === 'n' || handle === 'ne' || handle === 'nw';

  // --- Width / Right Edge Snapping ---
  if (movesRight) {
    const proposedRight = resultBox.x + resultBox.width;
    let bestDiff: number | null = null;
    let guide: SnappingGuide | null = null;

    // 1. Equal Dimension Snapping (Same width as another shape)
    for (const ref of referenceBoxes) {
      const diffWidth = ref.width - resultBox.width;
      if (Math.abs(diffWidth) <= threshold && (bestDiff === null || Math.abs(diffWidth) < Math.abs(bestDiff))) {
        bestDiff = diffWidth;
        guide = {
          id: `guide-size-w-${ref.width}`,
          type: 'vertical',
          position: resultBox.x + ref.width,
          start: Math.min(resultBox.y, ref.y),
          end: Math.max(resultBox.y + resultBox.height, ref.y + ref.height),
          kind: 'size',
          label: `Width: ${Math.round(ref.width)}px`,
        };
      }
    }

    // 2. Alignment to other elements' edges or centers
    for (const ref of referenceBoxes) {
      const targets = [
        { val: ref.x, label: 'Align Left' },
        { val: ref.x + ref.width / 2, label: 'Align Center' },
        { val: ref.x + ref.width, label: 'Align Right' },
      ];
      for (const t of targets) {
        const diff = t.val - proposedRight;
        if (Math.abs(diff) <= threshold && (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff))) {
          bestDiff = diff;
          guide = {
            id: `guide-edge-r-${t.val}`,
            type: 'vertical',
            position: t.val,
            start: Math.min(resultBox.y, ref.y) - 16,
            end: Math.max(resultBox.y + resultBox.height, ref.y + ref.height) + 16,
            kind: 'edge',
            label: t.label,
          };
        }
      }
    }

    if (bestDiff !== null) {
      resultBox.width = Math.max(minWidth, resultBox.width + bestDiff);
      if (guide) guides.push(guide);
    }
  }

  // --- Width / Left Edge Snapping ---
  if (movesLeft) {
    const proposedLeft = resultBox.x;
    let bestDiff: number | null = null;
    let guide: SnappingGuide | null = null;

    for (const ref of referenceBoxes) {
      const targets = [
        { val: ref.x, label: 'Align Left' },
        { val: ref.x + ref.width / 2, label: 'Align Center' },
        { val: ref.x + ref.width, label: 'Align Right' },
      ];
      for (const t of targets) {
        const diff = t.val - proposedLeft;
        if (Math.abs(diff) <= threshold && (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff))) {
          bestDiff = diff;
          guide = {
            id: `guide-edge-l-${t.val}`,
            type: 'vertical',
            position: t.val,
            start: Math.min(resultBox.y, ref.y) - 16,
            end: Math.max(resultBox.y + resultBox.height, ref.y + ref.height) + 16,
            kind: 'edge',
            label: t.label,
          };
        }
      }
    }

    if (bestDiff !== null) {
      const newX = resultBox.x + bestDiff;
      const newWidth = (origBox.x + origBox.width) - newX;
      if (newWidth >= minWidth) {
        resultBox.x = newX;
        resultBox.width = newWidth;
        if (guide) guides.push(guide);
      }
    }
  }

  // --- Height / Bottom Edge Snapping ---
  if (movesBottom) {
    const proposedBottom = resultBox.y + resultBox.height;
    let bestDiff: number | null = null;
    let guide: SnappingGuide | null = null;

    // 1. Equal Dimension Snapping (Same height as another shape)
    for (const ref of referenceBoxes) {
      const diffHeight = ref.height - resultBox.height;
      if (Math.abs(diffHeight) <= threshold && (bestDiff === null || Math.abs(diffHeight) < Math.abs(bestDiff))) {
        bestDiff = diffHeight;
        guide = {
          id: `guide-size-h-${ref.height}`,
          type: 'horizontal',
          position: resultBox.y + ref.height,
          start: Math.min(resultBox.x, ref.x),
          end: Math.max(resultBox.x + resultBox.width, ref.x + ref.width),
          kind: 'size',
          label: `Height: ${Math.round(ref.height)}px`,
        };
      }
    }

    // 2. Alignment to other elements' top, center, bottom
    for (const ref of referenceBoxes) {
      const targets = [
        { val: ref.y, label: 'Align Top' },
        { val: ref.y + ref.height / 2, label: 'Align Center' },
        { val: ref.y + ref.height, label: 'Align Bottom' },
      ];
      for (const t of targets) {
        const diff = t.val - proposedBottom;
        if (Math.abs(diff) <= threshold && (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff))) {
          bestDiff = diff;
          guide = {
            id: `guide-edge-b-${t.val}`,
            type: 'horizontal',
            position: t.val,
            start: Math.min(resultBox.x, ref.x) - 16,
            end: Math.max(resultBox.x + resultBox.width, ref.x + ref.width) + 16,
            kind: 'edge',
            label: t.label,
          };
        }
      }
    }

    if (bestDiff !== null) {
      resultBox.height = Math.max(minHeight, resultBox.height + bestDiff);
      if (guide) guides.push(guide);
    }
  }

  // --- Height / Top Edge Snapping ---
  if (movesTop) {
    const proposedTop = resultBox.y;
    let bestDiff: number | null = null;
    let guide: SnappingGuide | null = null;

    for (const ref of referenceBoxes) {
      const targets = [
        { val: ref.y, label: 'Align Top' },
        { val: ref.y + ref.height / 2, label: 'Align Center' },
        { val: ref.y + ref.height, label: 'Align Bottom' },
      ];
      for (const t of targets) {
        const diff = t.val - proposedTop;
        if (Math.abs(diff) <= threshold && (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff))) {
          bestDiff = diff;
          guide = {
            id: `guide-edge-t-${t.val}`,
            type: 'horizontal',
            position: t.val,
            start: Math.min(resultBox.x, ref.x) - 16,
            end: Math.max(resultBox.x + resultBox.width, ref.x + ref.width) + 16,
            kind: 'edge',
            label: t.label,
          };
        }
      }
    }

    if (bestDiff !== null) {
      const newY = resultBox.y + bestDiff;
      const newHeight = (origBox.y + origBox.height) - newY;
      if (newHeight >= minHeight) {
        resultBox.y = newY;
        resultBox.height = newHeight;
        if (guide) guides.push(guide);
      }
    }
  }

  return {
    box: resultBox,
    guides,
  };
}

/**
 * Snap connector endpoint to target anchor points and straight angles (0°, 90°, 180°, 270°)
 */
export function computeConnectorPointSnapping(
  currentPos: { x: number; y: number },
  startPos: { x: number; y: number },
  shapes: { id: string; x: number; y: number; width: number; height: number }[],
  threshold: number = 16
): {
  pos: { x: number; y: number };
  targetShapeId?: string;
  targetSide?: 'top' | 'right' | 'bottom' | 'left';
  guides: SnappingGuide[];
} {
  const guides: SnappingGuide[] = [];

  // 1. Check Shape Anchors magnetic snap
  for (const s of shapes) {
    const w = s.width;
    const h = s.height;
    const anchors: { x: number; y: number; side: 'top' | 'right' | 'bottom' | 'left' }[] = [
      { x: s.x + w / 2, y: s.y, side: 'top' },
      { x: s.x + w, y: s.y + h / 2, side: 'right' },
      { x: s.x + w / 2, y: s.y + h, side: 'bottom' },
      { x: s.x, y: s.y + h / 2, side: 'left' },
    ];

    for (const anc of anchors) {
      const dist = Math.hypot(currentPos.x - anc.x, currentPos.y - anc.y);
      if (dist <= threshold) {
        // Aligns with start anchor?
        if (Math.abs(startPos.y - anc.y) <= 8) {
          guides.push({
            id: 'conn-guide-h',
            type: 'horizontal',
            position: anc.y,
            start: Math.min(startPos.x, anc.x) - 10,
            end: Math.max(startPos.x, anc.x) + 10,
            kind: 'center',
            label: 'Horizontal Alignment',
          });
        }
        if (Math.abs(startPos.x - anc.x) <= 8) {
          guides.push({
            id: 'conn-guide-v',
            type: 'vertical',
            position: anc.x,
            start: Math.min(startPos.y, anc.y) - 10,
            end: Math.max(startPos.y, anc.y) + 10,
            kind: 'center',
            label: 'Vertical Alignment',
          });
        }

        return {
          pos: { x: anc.x, y: anc.y },
          targetShapeId: s.id,
          targetSide: anc.side,
          guides,
        };
      }
    }
  }

  // 2. Straight axis alignment snap with starting point
  let snappedPos = { ...currentPos };

  // Horizontal line (same Y)
  if (Math.abs(currentPos.y - startPos.y) <= threshold) {
    snappedPos.y = startPos.y;
    guides.push({
      id: 'conn-guide-h-axis',
      type: 'horizontal',
      position: startPos.y,
      start: Math.min(startPos.x, currentPos.x) - 10,
      end: Math.max(startPos.x, currentPos.x) + 10,
      kind: 'center',
      label: 'Straight Horizontal (0°)',
    });
  }

  // Vertical line (same X)
  if (Math.abs(currentPos.x - startPos.x) <= threshold) {
    snappedPos.x = startPos.x;
    guides.push({
      id: 'conn-guide-v-axis',
      type: 'vertical',
      position: startPos.x,
      start: Math.min(startPos.y, currentPos.y) - 10,
      end: Math.max(startPos.y, currentPos.y) + 10,
      kind: 'center',
      label: 'Straight Vertical (90°)',
    });
  }

  return {
    pos: snappedPos,
    guides,
  };
}
