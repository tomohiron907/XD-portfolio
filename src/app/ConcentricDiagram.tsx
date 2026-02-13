"use client";

// ── Data ──────────────────────────────────────────────────────────────
const categories = [
  { name: "Aerospace", children: ["Drone Frames", "Rotor Blades"] },
  { name: "Mobility", children: ["Aero Parts", "Racing Parts", "Bicycles", "Helmets"] },
  { name: "Robotics", children: ["Exterior Frames", "End Effectors"] },
  { name: "Architecture", children: ["Concrete Forms", "Structural Joints"] },
  { name: "Personalized", children: ["Sports Gear", "Furniture"] },
];

const totalChildren = categories.reduce((s, c) => s + c.children.length, 0);

// ── Geometry constants ────────────────────────────────────────────────
const CX = 50;
const CY = 650;
const INNER_R0 = 110;
const INNER_R1 = 230;
const OUTER_R0 = 238;
const OUTER_R1 = 370;
const LOGO_R = 70;
const LOGO_OFFSET_X = 14;  // Adjust to move logo horizontally (positive moves right)
const LOGO_OFFSET_Y = -29; // Adjust to move logo vertically (negative moves up)
const GAP_CAT = 0;   // degrees gap between categories
const GAP_PROD = 0;  // degrees gap between products within a category
const TOTAL_ANGLE = 90 - GAP_CAT * (categories.length - 1);

// ── Helpers ───────────────────────────────────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function describeArcBand(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startAngle: number, endAngle: number,
) {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const sweep = endAngle - startAngle;
  const largeArc = sweep > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

// ── Compute angular slices ────────────────────────────────────────────
interface ChildSlice { name: string; startAngle: number; endAngle: number }
interface Slice {
  category: string;
  startAngle: number;
  endAngle: number;
  children: ChildSlice[];
}

function computeSlices(): Slice[] {
  const slices: Slice[] = [];
  let cursor = 0;

  for (const cat of categories) {
    const span = (cat.children.length / totalChildren) * TOTAL_ANGLE;
    const start = cursor;
    const end = cursor + span;

    // Sub-divide with small gaps between products
    const n = cat.children.length;
    const totalProdGap = GAP_PROD * (n - 1);
    const usableSpan = span - totalProdGap;
    const perChild = usableSpan / n;

    const childSlices: ChildSlice[] = [];
    let childCursor = start;
    for (let i = 0; i < n; i++) {
      childSlices.push({
        name: cat.children[i],
        startAngle: childCursor,
        endAngle: childCursor + perChild,
      });
      childCursor += perChild + GAP_PROD;
    }

    slices.push({ category: cat.name, startAngle: start, endAngle: end, children: childSlices });
    cursor = end + GAP_CAT;
  }

  return slices;
}

// ── Component ─────────────────────────────────────────────────────────
export default function ConcentricDiagram({ className = "" }: { className?: string }) {
  const slices = computeSlices();

  return (
    <div className={`mx-auto w-full max-w-2xl ${className}`}>
      <svg
        viewBox="10 260 420 420"
        className="w-full h-auto"
        aria-label="Concentric diagram showing Strecs3D expanding from core to industries and products"
      >
        {/* Inner ring bands — categories */}
        {slices.map((s, i) => (
          <path
            key={`inner-band-${i}`}
            d={describeArcBand(CX, CY, INNER_R0, INNER_R1, s.startAngle, s.endAngle)}
            fill="var(--foreground)"
            fillOpacity={0.07}
            stroke="none"
          />
        ))}

        {/* Outer ring bands — products (individual with gaps) */}
        {slices.flatMap((s, i) =>
          s.children.map((ch, j) => (
            <path
              key={`outer-band-${i}-${j}`}
              d={describeArcBand(CX, CY, OUTER_R0, OUTER_R1, ch.startAngle, ch.endAngle)}
              fill="var(--foreground)"
              fillOpacity={0.04}
              stroke="none"
            />
          ))
        )}

        {/* Thin arc separators at ring boundaries */}
        {[INNER_R0, OUTER_R0].map((r) => {
          const s = polarToCartesian(CX, CY, r, 0);
          const e = polarToCartesian(CX, CY, r, 90);
          return (
            <path
              key={`arc-sep-${r}`}
              d={`M ${s.x} ${s.y} A ${r} ${r} 0 0 0 ${e.x} ${e.y}`}
              fill="none"
              stroke="var(--foreground)"
              strokeOpacity={0.08}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Category labels — radial text on inner ring */}
        {slices.map((s, i) => {
          const midAngle = (s.startAngle + s.endAngle) / 2;
          const r = INNER_R0 + 16;
          const pos = polarToCartesian(CX, CY, r, midAngle);
          return (
            <text
              key={`cat-label-${i}`}
              x={pos.x}
              y={pos.y}
              fontSize={14}
              fontWeight={600}
              fill="var(--foreground)"
              fillOpacity={0.85}
              textAnchor="start"
              dominantBaseline="central"
              transform={`rotate(${-midAngle}, ${pos.x}, ${pos.y})`}
            >
              {s.category}
            </text>
          );
        })}

        {/* Product labels — radial text on outer ring */}
        {slices.flatMap((s, i) =>
          s.children.map((ch, j) => {
            const midAngle = (ch.startAngle + ch.endAngle) / 2;
            const r = OUTER_R0 + 12;
            const pos = polarToCartesian(CX, CY, r, midAngle);
            return (
              <text
                key={`prod-label-${i}-${j}`}
                x={pos.x}
                y={pos.y}
                fontSize={10}
                fill="var(--foreground)"
                fillOpacity={0.6}
                textAnchor="start"
                dominantBaseline="central"
                transform={`rotate(${-midAngle}, ${pos.x}, ${pos.y})`}
              >
                {ch.name}
              </text>
            );
          })
        )}

        {/* Center logo */}
        <image
          href="/logo-mark.png"
          x={CX - LOGO_R * 0.7 + LOGO_OFFSET_X}
          y={CY - LOGO_R * 0.7 + LOGO_OFFSET_Y}
          width={LOGO_R * 1.4}
          height={LOGO_R * 1.4}
        />
      </svg>
    </div>
  );
}
