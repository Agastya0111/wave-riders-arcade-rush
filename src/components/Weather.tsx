
import React from "react";

export type WeatherType = "clear" | "rain" | "storm" | "sunset";

interface WeatherProps {
  kind: WeatherType;
}

export const Weather = ({ kind }: WeatherProps) => {
  // Render weather overlays
  if (kind === "rain") {
    // CSS rain drops
    return (
      <div className="pointer-events-none absolute inset-0 z-40">
        {[...Array(32)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-raindrop"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${(i * 3) % 100}%`,
              width: 2,
              height: 32,
              background: "rgba(180,220,255,0.4)",
              borderRadius: 4,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    );
  }
  if (kind === "storm") {
    // Flashing lightning effect
    return (
      <>
        <div className="pointer-events-none absolute inset-0 z-40 bg-black opacity-20 animate-storm-flash" />
        <div className="pointer-events-none absolute inset-0 z-40">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-raindrop"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${(i * 5) % 100}%`,
                width: 2,
                height: 34,
                background: "rgba(120,170,220,0.5)",
                borderRadius: 4,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </>
    );
  }
  if (kind === "sunset") {
    // Color overlay
    return (
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-b from-yellow-200/40 to-fuchsia-500/90" />
    );
  }
  // Clear = nothing
  return null;
};
