import { getPokemonTypeColor, type PokemonStat } from '@acity/shared';

// Classic Pokédex hexagon order, clockwise from the top.
const STAT_CONFIG: Array<{ key: string; label: string }> = [
  { key: 'hp', label: 'PS' },
  { key: 'attack', label: 'Ataque' },
  { key: 'defense', label: 'Defensa' },
  { key: 'speed', label: 'Velocidad' },
  { key: 'special-defense', label: 'Def. Esp.' },
  { key: 'special-attack', label: 'At. Esp.' },
];

// Most base stats fall well under this — a handful of outliers (e.g. Blissey's 255 HP) just
// clip to the outer ring, which reads fine and keeps the chart legible for everyone else.
const MAX_STAT = 150;
const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 62;
const GRID_LEVELS = [0.33, 0.66, 1];

function pointAt(index: number, ratio: number) {
  const angleDeg = -90 + index * 60;
  const angleRad = (Math.PI / 180) * angleDeg;
  return {
    x: CENTER + RADIUS * ratio * Math.cos(angleRad),
    y: CENTER + RADIUS * ratio * Math.sin(angleRad),
    cos: Math.cos(angleRad),
  };
}

function polygonPoints(ratios: number[]) {
  return ratios.map((ratio, i) => `${pointAt(i, ratio).x},${pointAt(i, ratio).y}`).join(' ');
}

/** Pushes each label away from the shape on the side it sits on, instead of centering all of
 * them the same way — reads much cleaner than uniform `text-anchor: middle`. */
function labelAnchor(cos: number): 'start' | 'middle' | 'end' {
  if (Math.abs(cos) < 0.3) return 'middle';
  return cos > 0 ? 'start' : 'end';
}

interface StatRadarProps {
  stats: PokemonStat[];
  primaryType: string;
}

export default function StatRadar({ stats, primaryType }: StatRadarProps) {
  const values = STAT_CONFIG.map(
    ({ key }) => stats.find((stat) => stat.stat.name === key)?.base_stat ?? 0,
  );
  const ratios = values.map((value) => Math.min(1, value / MAX_STAT));
  const color = getPokemonTypeColor(primaryType);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-[280px] overflow-visible"
      aria-hidden="true"
    >
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(STAT_CONFIG.map(() => level))}
          className="fill-none stroke-border"
        />
      ))}

      {STAT_CONFIG.map((_, i) => {
        const { x, y } = pointAt(i, 1);
        return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} className="stroke-border" />;
      })}

      <polygon
        points={polygonPoints(ratios)}
        fill={color}
        fillOpacity={0.35}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {ratios.map((ratio, i) => {
        const { x, y } = pointAt(i, ratio);
        return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
      })}

      {/* Label + value folded into one two-line tag per axis instead of a separate grid below
          the chart — keeps the whole thing to one compact block. */}
      {STAT_CONFIG.map(({ label }, i) => {
        const { x, y, cos } = pointAt(i, 1.32);
        const anchor = labelAnchor(cos);
        return (
          <g key={label} textAnchor={anchor}>
            <text x={x} y={y - 5} className="fill-muted-foreground text-[9px] font-medium">
              {label}
            </text>
            <text x={x} y={y + 10} fill={color} className="text-[13px] font-bold tabular-nums">
              {values[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
