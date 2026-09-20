import React from 'react';
import type { SnappingGuide } from '../../utils/snapping';

interface SmartGuidesOverlayProps {
  guides: SnappingGuide[];
  zoom: number;
}

export const SmartGuidesOverlay: React.FC<SmartGuidesOverlayProps> = ({ guides, zoom }) => {
  if (!guides || guides.length === 0) return null;

  const strokeWidth = 1.25 / zoom;
  const glowWidth = 3 / zoom;
  const tickSize = 5 / zoom;
  const fontSize = Math.max(9, 11 / Math.min(zoom, 1.2));

  return (
    <g id="smart-snapping-guides-layer" className="pointer-events-none select-none z-50">
      {guides.map((guide) => {
        const isVertical = guide.type === 'vertical';

        // Coordinates for the guide line
        const x1 = isVertical ? guide.position : guide.start;
        const y1 = isVertical ? guide.start : guide.position;
        const x2 = isVertical ? guide.position : guide.end;
        const y2 = isVertical ? guide.end : guide.position;

        // Colors based on snap kind
        const primaryColor =
          guide.kind === 'gap'
            ? '#10b981' // Emerald green for equal spacing
            : guide.kind === 'size'
            ? '#f59e0b' // Amber for equal sizing
            : '#0284c7'; // Vivid cyan/blue for alignment
        const glowColor =
          guide.kind === 'gap'
            ? 'rgba(16, 185, 129, 0.25)'
            : guide.kind === 'size'
            ? 'rgba(245, 158, 11, 0.25)'
            : 'rgba(2, 132, 199, 0.25)';

        // Midpoint for badge label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={guide.id}>
            {/* Glow Backing Line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={glowColor}
              strokeWidth={glowWidth}
              strokeLinecap="round"
            />

            {/* Crisp Dashed Guide Line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={primaryColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${4 / zoom} ${3 / zoom}`}
              strokeLinecap="square"
            />

            {/* Endpoint End-Ticks */}
            {isVertical ? (
              <>
                <line
                  x1={guide.position - tickSize}
                  y1={guide.start}
                  x2={guide.position + tickSize}
                  y2={guide.start}
                  stroke={primaryColor}
                  strokeWidth={strokeWidth}
                />
                <line
                  x1={guide.position - tickSize}
                  y1={guide.end}
                  x2={guide.position + tickSize}
                  y2={guide.end}
                  stroke={primaryColor}
                  strokeWidth={strokeWidth}
                />
              </>
            ) : (
              <>
                <line
                  x1={guide.start}
                  y1={guide.position - tickSize}
                  x2={guide.start}
                  y2={guide.position + tickSize}
                  stroke={primaryColor}
                  strokeWidth={strokeWidth}
                />
                <line
                  x1={guide.end}
                  y1={guide.position - tickSize}
                  x2={guide.end}
                  y2={guide.position + tickSize}
                  stroke={primaryColor}
                  strokeWidth={strokeWidth}
                />
              </>
            )}

            {/* Alignment Point Ticks / Diamonds */}
            {guide.targetPoint && (
              <rect
                x={guide.targetPoint.x - (tickSize * 0.7)}
                y={guide.targetPoint.y - (tickSize * 0.7)}
                width={tickSize * 1.4}
                height={tickSize * 1.4}
                fill="#ffffff"
                stroke={primaryColor}
                strokeWidth={strokeWidth}
                transform={`rotate(45, ${guide.targetPoint.x}, ${guide.targetPoint.y})`}
              />
            )}

            {guide.referencePoint && (
              <rect
                x={guide.referencePoint.x - (tickSize * 0.7)}
                y={guide.referencePoint.y - (tickSize * 0.7)}
                width={tickSize * 1.4}
                height={tickSize * 1.4}
                fill="#ffffff"
                stroke={primaryColor}
                strokeWidth={strokeWidth}
                transform={`rotate(45, ${guide.referencePoint.x}, ${guide.referencePoint.y})`}
              />
            )}

            {/* Floating Information Badge */}
            {guide.label && (
              <foreignObject
                x={isVertical ? guide.position + 6 / zoom : midX - 45 / zoom}
                y={isVertical ? midY - 10 / zoom : guide.position + 6 / zoom}
                width={120 / zoom}
                height={26 / zoom}
                className="overflow-visible pointer-events-none"
              >
                <div
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full shadow-xs font-mono font-medium tracking-tight whitespace-nowrap"
                  style={{
                    backgroundColor: primaryColor,
                    color: '#ffffff',
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.2,
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                  }}
                >
                  {guide.label}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </g>
  );
};
