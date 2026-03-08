import type { BodyMeasurements } from "@/types/customize";

interface BodyDiagramProps {
  measurements: BodyMeasurements;
}

export default function BodyDiagram({ measurements }: BodyDiagramProps) {
  const m = measurements;

  // Measurement lines with labels and positions on the SVG body
  const lines: { label: string; value: string; x1: number; y1: number; x2: number; y2: number; labelX: number; labelY: number; side: "left" | "right" }[] = [
    { label: "Height", value: `${m.height}"`, x1: 30, y1: 20, x2: 30, y2: 380, labelX: 12, labelY: 200, side: "left" },
    { label: "Shoulders", value: `${m.shoulders}"`, x1: 95, y1: 78, x2: 205, y2: 78, labelX: 150, labelY: 68, side: "right" },
    { label: "Chest", value: `${m.chest}"`, x1: 215, y1: 115, x2: 240, y2: 115, labelX: 252, labelY: 112, side: "right" },
    { label: "Waist", value: `${m.waist}"`, x1: 215, y1: 165, x2: 240, y2: 165, labelX: 252, labelY: 162, side: "right" },
    { label: "Hips", value: `${m.hips}"`, x1: 215, y1: 205, x2: 240, y2: 205, labelX: 252, labelY: 202, side: "right" },
    { label: "Neck", value: `${m.neck}"`, x1: 70, y1: 55, x2: 55, y2: 55, labelX: 38, labelY: 52, side: "left" },
    { label: "Sleeve", value: `${m.sleeveLength}"`, x1: 75, y1: 90, x2: 55, y2: 195, labelX: 42, labelY: 140, side: "left" },
    { label: "Inseam", value: `${m.inseam}"`, x1: 140, y1: 220, x2: 140, y2: 365, labelX: 148, labelY: 295, side: "right" },
    { label: "Thigh", value: `${m.thigh}"`, x1: 215, y1: 250, x2: 240, y2: 250, labelX: 252, labelY: 247, side: "right" },
    { label: "Arm", value: `${m.armLength}"`, x1: 215, y1: 90, x2: 245, y2: 195, labelX: 252, labelY: 140, side: "right" },
  ];

  return (
    <div className="relative bg-secondary/20 rounded-lg p-2 border border-border">
      <svg viewBox="0 0 300 400" className="w-full h-auto" style={{ maxHeight: 320 }}>
        {/* Body silhouette */}
        <g opacity={0.6}>
          {/* Head */}
          <ellipse cx="150" cy="30" rx="18" ry="22" fill="hsl(var(--muted-foreground))" opacity={0.3} />
          {/* Neck */}
          <rect x="143" y="50" width="14" height="15" rx="3" fill="hsl(var(--muted-foreground))" opacity={0.25} />
          {/* Torso */}
          <path
            d="M 95 65 Q 90 75 88 100 Q 85 130 92 160 Q 95 180 100 200 L 110 210 L 140 215 L 160 215 L 190 210 L 200 200 Q 205 180 208 160 Q 215 130 212 100 Q 210 75 205 65 Z"
            fill="hsl(var(--muted-foreground))" opacity={0.2}
          />
          {/* Left arm */}
          <path
            d="M 95 70 Q 80 80 70 110 Q 60 150 55 195 Q 53 205 58 208 Q 65 205 68 195 Q 75 150 82 115 Q 88 90 95 75 Z"
            fill="hsl(var(--muted-foreground))" opacity={0.2}
          />
          {/* Right arm */}
          <path
            d="M 205 70 Q 220 80 230 110 Q 240 150 245 195 Q 247 205 242 208 Q 235 205 232 195 Q 225 150 218 115 Q 212 90 205 75 Z"
            fill="hsl(var(--muted-foreground))" opacity={0.2}
          />
          {/* Left leg */}
          <path
            d="M 110 210 Q 108 250 110 290 Q 112 330 115 365 Q 115 375 120 378 Q 130 378 128 370 Q 125 335 123 290 Q 122 250 125 215 Z"
            fill="hsl(var(--muted-foreground))" opacity={0.2}
          />
          {/* Right leg */}
          <path
            d="M 190 210 Q 192 250 190 290 Q 188 330 185 365 Q 185 375 180 378 Q 170 378 172 370 Q 175 335 177 290 Q 178 250 175 215 Z"
            fill="hsl(var(--muted-foreground))" opacity={0.2}
          />
        </g>

        {/* Measurement lines */}
        {lines.map((line, i) => (
          <g key={i}>
            <line
              x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
              stroke="hsl(var(--primary))" strokeWidth={0.8} strokeDasharray="3,2" opacity={0.7}
            />
            {/* Endpoints */}
            <circle cx={line.x1} cy={line.y1} r={1.5} fill="hsl(var(--primary))" />
            <circle cx={line.x2} cy={line.y2} r={1.5} fill="hsl(var(--primary))" />
            {/* Label */}
            <text
              x={line.labelX} y={line.labelY}
              fill="hsl(var(--muted-foreground))"
              fontSize={7}
              textAnchor={line.side === "left" ? "end" : "start"}
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
            >
              {line.label}
            </text>
            <text
              x={line.labelX} y={line.labelY + 10}
              fill="hsl(var(--primary))"
              fontSize={8}
              fontWeight={600}
              textAnchor={line.side === "left" ? "end" : "start"}
              dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
            >
              {line.value}
            </text>
          </g>
        ))}

        {/* Body type badge */}
        <rect x="115" y="385" width="70" height="14" rx="7" fill="hsl(var(--primary))" opacity={0.15} />
        <text x="150" y="394" textAnchor="middle" fill="hsl(var(--primary))" fontSize={8} fontWeight={600} fontFamily="Inter, sans-serif" className="capitalize">
          {m.bodyType} build
        </text>
      </svg>
    </div>
  );
}
