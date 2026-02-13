"use client";

import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
} from "recharts";

// Normal specimen data (9 points)
const normalData = [
  { bend: 20, load: 20 },
  { bend: 30, load: 29.5 },
  { bend: 41, load: 39.8 },
  { bend: 52, load: 50 },
  { bend: 64.2, load: 60 },
  { bend: 79, load: 70.6 },
  { bend: 96.5, load: 80 },
  { bend: 111.5, load: 90 },
  { bend: 122, load: 100 },
].map((d) => ({ ...d, normalLoad: d.load }));

// Strecs3D specimen data (15 points)
const strecs3dData = [
  { bend: 6.5, load: 10 },
  { bend: 13.1, load: 20.5 },
  { bend: 19.2, load: 30 },
  { bend: 25.5, load: 40 },
  { bend: 31.6, load: 50.3 },
  { bend: 38, load: 60.3 },
  { bend: 44.8, load: 70.7 },
  { bend: 51, load: 80.5 },
  { bend: 59.2, load: 90.6 },
  { bend: 67.5, load: 100.7 },
  { bend: 77.9, load: 110 },
  { bend: 86.2, load: 120 },
  { bend: 96.7, load: 130.3 },
  { bend: 107.8, load: 140 },
  { bend: 120.2, load: 150.5 },
].map((d) => ({ ...d, strecs3dLoad: d.load }));

// Regression: Load = (k_mm * 0.01) * bend + intercept
const NORMAL_K = 75.675 * 0.01;
const NORMAL_INTERCEPT = 8.177;
const STRECS_K = 125.153 * 0.01;
const STRECS_INTERCEPT = 9.774;

// Break loads (bend at break is unknown)
const NORMAL_BREAK_LOAD = 121.5;
const STRECS_BREAK_LOAD = 239.5;

// Last measured point
const normalLastPoint = { bend: 122, load: 100 };
const strecs3dLastPoint = { bend: 120.2, load: 150.5 };

function generateRegressionLine(
  k: number,
  intercept: number,
  maxBend: number,
  key: string
) {
  const points = [];
  for (let b = 0; b <= maxBend; b += 2) {
    points.push({ bend: b, [key]: k * b + intercept });
  }
  return points;
}

const normalRegression = generateRegressionLine(
  NORMAL_K,
  NORMAL_INTERCEPT,
  normalLastPoint.bend,
  "normalReg"
);
const strecs3dRegression = generateRegressionLine(
  STRECS_K,
  STRECS_INTERCEPT,
  strecs3dLastPoint.bend,
  "strecs3dReg"
);

// Vertical arrow lines: from last measured load up to break load
const normalArrowData = [
  { bend: normalLastPoint.bend, normalArrow: normalLastPoint.load },
  { bend: normalLastPoint.bend + 0.01, normalArrow: NORMAL_BREAK_LOAD },
];
const strecs3dArrowData = [
  { bend: strecs3dLastPoint.bend, strecs3dArrow: strecs3dLastPoint.load },
  { bend: strecs3dLastPoint.bend + 0.01, strecs3dArrow: STRECS_BREAK_LOAD },
];

// Break point markers only (tip of the arrow)
const normalBreakMarker = [
  { bend: normalLastPoint.bend + 0.01, normalBreakPt: NORMAL_BREAK_LOAD },
];
const strecs3dBreakMarker = [
  { bend: strecs3dLastPoint.bend + 0.01, strecs3dBreakPt: STRECS_BREAK_LOAD },
];

// Merge all data
function mergeData() {
  const map = new Map<number, Record<string, number>>();

  const addPoints = (arr: Record<string, number>[]) => {
    for (const p of arr) {
      const existing = map.get(p.bend) || { bend: p.bend };
      Object.assign(existing, p);
      map.set(p.bend, existing);
    }
  };

  addPoints(normalData);
  addPoints(strecs3dData);
  addPoints(normalRegression);
  addPoints(strecs3dRegression);
  addPoints(normalArrowData);
  addPoints(strecs3dArrowData);
  addPoints(normalBreakMarker);
  addPoints(strecs3dBreakMarker);

  return Array.from(map.values()).sort((a, b) => a.bend - b.bend);
}

const chartData = mergeData();

const NORMAL_COLOR = "#6b7280";
const STRECS_COLOR = "#2563eb";

// Small triangle marker pointing up — top vertex aligns with the data point (cy)
function TriangleUp({ cx, cy, fill }: { cx?: number; cy?: number; fill?: string }) {
  if (cx == null || cy == null) return null;
  const s = 5;
  return (
    <polygon
      points={`${cx},${cy} ${cx - s},${cy + s * 2} ${cx + s},${cy + s * 2}`}
      fill={fill}
      stroke={fill}
      strokeWidth={1}
    />
  );
}

export default function BendingTestChart() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
      {/* Chart */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-foreground/10 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Three-Point Bending Test
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NORMAL_COLOR }} />
                Normal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STRECS_COLOR }} />
                Strecs3D
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={chartData}
              margin={{ top: 30, right: 30, bottom: 20, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--foreground)"
                opacity={0.1}
              />
              <XAxis
                dataKey="bend"
                type="number"
                domain={[0, 140]}
                label={{
                  value: "Bend [10⁻²mm]",
                  position: "insideBottom",
                  offset: -10,
                  style: { fill: "var(--foreground)", fontSize: 12 },
                }}
                tick={{ fill: "var(--foreground)", fontSize: 11 }}
                stroke="var(--foreground)"
                opacity={0.4}
              />
              <YAxis
                type="number"
                domain={[0, 260]}
                label={{
                  value: "Load [N]",
                  angle: -90,
                  position: "insideLeft",
                  offset: 5,
                  style: { fill: "var(--foreground)", fontSize: 12 },
                }}
                tick={{ fill: "var(--foreground)", fontSize: 11 }}
                stroke="var(--foreground)"
                opacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--foreground)",
                  borderRadius: 8,
                  opacity: 0.9,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
{/* Legend removed — custom legend rendered outside chart */}

              {/* Subtle horizontal lines at break loads */}
              <ReferenceLine
                y={NORMAL_BREAK_LOAD}
                stroke={NORMAL_COLOR}
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
              <ReferenceLine
                y={STRECS_BREAK_LOAD}
                stroke={STRECS_COLOR}
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />

              {/* Regression lines (measured range only) */}
              <Line
                dataKey="normalReg"
                name="Normal (regression)"
                stroke={NORMAL_COLOR}
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
                connectNulls
              />
              <Line
                dataKey="strecs3dReg"
                name="Strecs3D (regression)"
                stroke={STRECS_COLOR}
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
                connectNulls
              />

              {/* Vertical arrow lines to break load */}
              <Line
                dataKey="normalArrow"
                name="Normal → fracture"
                stroke={NORMAL_COLOR}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls
                legendType="none"
              />
              <Line
                dataKey="strecs3dArrow"
                name="Strecs3D → fracture"
                stroke={STRECS_COLOR}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls
                legendType="none"
              />

              {/* Measured data points */}
              <Scatter
                dataKey="normalLoad"
                name="Normal"
                fill={NORMAL_COLOR}
                r={4}
              />
              <Scatter
                dataKey="strecs3dLoad"
                name="Strecs3D"
                fill={STRECS_COLOR}
                r={4}
              />

              {/* Triangle markers at break points only */}
              <Scatter
                dataKey="normalBreakPt"
                name="Normal fracture"
                shape={<TriangleUp />}
                fill={NORMAL_COLOR}
                legendType="none"
              />
              <Scatter
                dataKey="strecs3dBreakPt"
                name="Strecs3D fracture"
                shape={<TriangleUp />}
                fill={STRECS_COLOR}
                legendType="none"
              />

              {/* Break load labels */}
              <ReferenceDot
                x={normalLastPoint.bend}
                y={NORMAL_BREAK_LOAD}
                r={0}
                label={{
                  value: `Broke at ${NORMAL_BREAK_LOAD} N`,
                  position: "left",
                  fill: NORMAL_COLOR,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceDot
                x={strecs3dLastPoint.bend}
                y={STRECS_BREAK_LOAD}
                r={0}
                label={{
                  value: `Broke at ${STRECS_BREAK_LOAD} N`,
                  position: "top",
                  fill: STRECS_COLOR,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex flex-row gap-3 lg:flex-col lg:w-48 shrink-0">
        <div className="flex-1 rounded-xl border border-foreground/10 p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
            Three-Point Bending Test
          </p>
          <img src="/figures/bend-test.svg" alt="Three-point bending test" className="mt-2 h-24 w-auto opacity-80" />
          <p className="mt-2 text-xs text-foreground/50">
            Specimen weight: 15.8 g each
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-foreground/10 p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
            Stiffness (EI) Ratio
          </p>
          <p className="mt-1 text-2xl font-bold">1.65x</p>
          <p className="mt-0.5 text-xs text-foreground/50">
            Strecs3D vs Normal
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-foreground/10 p-4 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
            Max Load Ratio
          </p>
          <p className="mt-1 text-2xl font-bold">1.97x</p>
          <p className="mt-0.5 text-xs text-foreground/50">
            239.5 N vs 121.5 N
          </p>
        </div>
      </div>
    </div>
  );
}
