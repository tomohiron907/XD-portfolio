"use client";

import { useState, useEffect, useCallback } from "react";

const examples = [
  { src: "/examples/bearing_holder.png", sim: "/examples/bearing_holder_sim.png", div: "/examples/bearing_holder_div.png", alt: "Bearing Holder" },
  { src: "/examples/canti.png", sim: "/examples/canti_sim.png", div: "/examples/canti_div.png", alt: "Cantilever" },
  { src: "/examples/drone.png", sim: "/examples/drone_sim.png", div: "/examples/drone_div.png", alt: "Drone" },
  { src: "/examples/frame_connector.png", sim: "/examples/frame_connector_sim.png", div: "/examples/frame_connector_div.png", alt: "Frame Connector" },
  { src: "/examples/wall_hook.png", sim: "/examples/wall_hook_sim.png", div: "/examples/wall_hook_div.png", alt: "Wall Hook" },
  { src: "/examples/tablet_stand.png", sim: "/examples/tablet_stand_sim.png", div: "/examples/tablet_stand_div.png", alt: "Tablet Stand" },
  { src: "/examples/rod_connector.png", sim: "/examples/rod_connector_sim.png", div: "/examples/rod_connector_div.png", alt: "Rod Connector" },
  { src: "/examples/motor_mount.png", sim: "/examples/motor_mount_sim.png", div: "/examples/motor_mount_div.png", alt: "Motor Mount" },
  { src: "/examples/iphone_stand.png", sim: "/examples/iphone_stand_sim.png", div: "/examples/iphone_stand_div.png", alt: "iPhone Stand" },
  { src: "/examples/hook.png", sim: "/examples/hook_sim.png", div: "/examples/hook_div.png", alt: "Hook" },
  { src: "/examples/handle.png", sim: "/examples/handle_sim.png", div: "/examples/handle_div.png", alt: "Handle" },
];

type ExampleItem = (typeof examples)[number];

export default function ExamplesSection() {
  const [selected, setSelected] = useState<ExampleItem | null>(null);

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, close]);

  return (
    <section id="examples" className="border-t border-foreground/10 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold">Examples</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/70">
          From mechanical parts to everyday items — strengthen your prints
          with optimized infill.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((item) => (
            <div
              key={item.src}
              onClick={() => setSelected(item)}
              className="cursor-pointer overflow-hidden rounded-xl border border-foreground/10 transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl hover:border-foreground/50 hover:scale-[1.03]"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ))}
          <a
            href="#get-started"
            className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-foreground/20 transition-colors hover:border-foreground/40 hover:bg-foreground/5"
          >
            <span className="text-3xl">+</span>
            <span className="text-sm font-medium text-foreground/50">
              Try it with your model
            </span>
          </a>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={close}
        >
          <div
            className="relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              &times;
            </button>

            {/* Title */}
            <h3 className="mb-6 text-center text-xl font-bold">
              {selected.alt}
            </h3>

            {/* Images: Print large on top, Sim + Processing side by side below */}
            <div className="flex flex-col gap-4">
              <img
                src={selected.src}
                alt={selected.alt}
                className="w-full rounded-lg object-contain"
              />
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={selected.sim}
                  alt={`${selected.alt} — Simulation`}
                  className="w-full rounded-lg object-contain"
                />
                <img
                  src={selected.div}
                  alt={`${selected.alt} — Processing`}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
