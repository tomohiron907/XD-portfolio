"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// Total 6 phases: 0=CAD, 1-4=Strecs3D detail steps, 5=Slicer
const TOTAL_PHASES = 6;

const detailSteps = [
  {
    step: "1",
    title: "Import",
    image: "figures/Import.svg",
    desc: "Import your CAD model (STEP file) into Strecs3D.",
  },
  {
    step: "2",
    title: "Simulation",
    image: "figures/Simulation.svg",
    desc: "Set loads and constraints, then run stress analysis.",
  },
  {
    step: "3",
    title: "Optimize",
    image: "figures/Optimize.svg",
    desc: "Infill density is auto-assigned per region from analysis results.",
  },
  {
    step: "4",
    title: "Export",
    image: "figures/Export.svg",
    desc: "Export as 3MF with optimized infill metadata.",
  },
];

// Which top-bar item is active: "cad" | "strecs" | "slicer"
function activePhaseGroup(phase: number) {
  if (phase === 0) return "cad";
  if (phase >= 1 && phase <= 4) return "strecs";
  return "slicer";
}

function badgeClass(
  item: "cad" | "strecs" | "slicer",
  active: "cad" | "strecs" | "slicer"
) {
  const base =
    "rounded-full px-5 py-2 text-sm sm:text-base transition-all duration-500";
  if (item === active) {
    return `${base} font-bold bg-foreground/15 text-foreground/90 ring-1 ring-foreground/25`;
  }
  return `${base} font-semibold bg-foreground/8 text-foreground/40`;
}

export default function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cadRef = useRef<HTMLButtonElement>(null);
  const strecsRef = useRef<HTMLButtonElement>(null);
  const slicerRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState(0); // 0=CAD, 1-4=Strecs3D, 5=Slicer
  const [paused, setPaused] = useState(false);
  const [lineX, setLineX] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const group = activePhaseGroup(phase);
  const isStrecs = group === "strecs";
  const strecsDetailIndex = isStrecs ? phase - 1 : -1;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scheduleNext = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setPhase((prev) => (prev < TOTAL_PHASES - 1 ? prev + 1 : 0));
    }, 4000);
  }, []);

  useEffect(() => {
    if (!isVisible || paused) return;
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, phase, paused, scheduleNext]);

  // Compute the X position for the connection line
  useEffect(() => {
    const bar = barRef.current;
    const refMap = { cad: cadRef, strecs: strecsRef, slicer: slicerRef };
    const btn = refMap[group]?.current;
    if (!bar || !btn) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setLineX(btnRect.left - barRect.left + btnRect.width / 2);
  }, [group]);

  // Recalculate on resize
  useEffect(() => {
    const update = () => {
      const bar = barRef.current;
      const refMap = { cad: cadRef, strecs: strecsRef, slicer: slicerRef };
      const btn = refMap[activePhaseGroup(phase)]?.current;
      if (!bar || !btn) return;
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setLineX(btnRect.left - barRect.left + btnRect.width / 2);
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [phase]);

  const handlePhaseClick = (p: number) => {
    setPaused(true);
    setPhase(p);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="border-t border-foreground/10 py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold">Workflow</h2>
      </div>

      {/* Upper bar: CAD → Strecs3D → Slicer */}
      <div className="mx-auto mt-14 max-w-3xl px-6">
        <div className="relative flex items-center justify-center gap-3 sm:gap-5" ref={barRef}>
          <button ref={cadRef} onClick={() => handlePhaseClick(0)} className={badgeClass("cad", group)}>
            CAD
          </button>
          <span className="text-lg text-foreground/25 sm:text-xl">→</span>
          <button ref={strecsRef} onClick={() => handlePhaseClick(1)} className={badgeClass("strecs", group)}>
            Strecs3D
          </button>
          <span className="text-lg text-foreground/25 sm:text-xl">→</span>
          <button ref={slicerRef} onClick={() => handlePhaseClick(5)} className={badgeClass("slicer", group)}>
            Slicer
          </button>
        </div>

        {/* Connection line - positioned under the active badge */}
        <div className="relative h-8">
          <div
            className="absolute top-0 h-full border-l-2 border-foreground/20 transition-[left] duration-500 ease-in-out"
            style={{ left: `${lineX}px` }}
          />
        </div>
      </div>

      {/* Lower section */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-4 py-8 sm:px-8 sm:py-10">
          {/* Strecs3D phase: 4 detail cards — always rendered to set the container height */}
          <div
            className="grid w-full grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-4"
            style={{
              visibility: group === "strecs" ? "visible" : "hidden",
              transition: "opacity 0.4s ease",
              opacity: group === "strecs" ? 1 : 0,
            }}
          >
            {detailSteps.map((item, i) => {
              const isActive = i === strecsDetailIndex;
              return (
                <div key={item.step} className="relative flex items-stretch">
                  <div
                    onClick={() => handlePhaseClick(i + 1)}
                    className={`flex w-full cursor-pointer flex-col items-center rounded-xl border p-4 sm:p-5 ${
                      isActive
                        ? "border-foreground/50 shadow-lg"
                        : "border-foreground/10"
                    }`}
                    style={{
                      transform: isActive ? "scale(1.03)" : "scale(0.97)",
                      opacity: isActive ? 1 : 0.5,
                      transition:
                        "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, border-color 0.4s ease, box-shadow 0.4s ease",
                    }}
                  >
                    <h3 className="text-sm font-semibold sm:text-base">
                      {item.step}. {item.title}
                    </h3>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="mt-3 h-28 w-full object-contain sm:h-36"
                    />
                    <p className="mt-2 text-center text-xs leading-relaxed text-foreground/60">
                      {item.desc}
                    </p>
                  </div>
                  {i < detailSteps.length - 1 && (
                    <span className="absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 text-lg text-foreground/25 lg:block">
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* CAD phase: single card — overlaid */}
          {group === "cad" && (
            <div className="absolute inset-0 flex items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
              <div className="flex w-full max-w-xs flex-col items-center rounded-xl border border-foreground/50 bg-background p-5 shadow-lg">
                <h3 className="text-sm font-semibold sm:text-base">
                  0. Design
                </h3>
                <img
                  src="figures/Design.svg"
                  alt="Design"
                  className="mt-3 h-28 w-full object-contain sm:h-36"
                />
                <p className="mt-2 text-center text-xs leading-relaxed text-foreground/60">
                  Design a part in CAD and export as a STEP file.
                </p>
              </div>
            </div>
          )}

          {/* Slicer phase: single card — overlaid */}
          {group === "slicer" && (
            <div className="absolute inset-0 flex items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
              <div className="flex w-full max-w-xs flex-col items-center rounded-xl border border-foreground/50 bg-background p-5 shadow-lg">
                <h3 className="text-sm font-semibold sm:text-base">
                  5. Slice
                </h3>
                <img
                  src="figures/Slice.svg"
                  alt="Slice"
                  className="mt-3 h-28 w-full object-contain sm:h-36"
                />
                <p className="mt-2 text-center text-xs leading-relaxed text-foreground/60">
                  Open the 3MF in your favorite slicer and print.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
