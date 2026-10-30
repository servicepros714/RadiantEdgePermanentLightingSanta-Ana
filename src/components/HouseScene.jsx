import { useId } from 'react';

/* Illustrated modern flat-roof home at night (echoes the logo).
   Props: color, intensity 0–1, coverage 'front' | 'front-sides', stories 1 | 2,
   addons [], variant 'a' | 'b' | 'c', chase (LED chase shimmer), title. */

export const LIGHT_COLORS = {
  warm: { label: 'Warm white', run: ['#FFD9A0'], glow: '#FFC77A' },
  gold: { label: 'Sunburst gold', run: ['#FDC52A'], glow: '#FDB92A' },
  emerald: { label: 'Emerald & gold', run: ['#34E3A4', '#FDC52A'], glow: '#7CE8B6' },
  multi: { label: 'Multicolor', run: ['#FF5A4E', '#3DDC84', '#4DA3FF', '#FDC52A'], glow: '#FFD59A' },
  candy: { label: 'Red & white', run: ['#FF3B3B', '#FFF6EA'], glow: '#FFB0A0' },
  cool: { label: 'Cool white', run: ['#E4F0FF'], glow: '#BFD8FF' },
};

const DX = 70;
const DY = -26;
const G = 384; // ground line
const T = 16; // roof slab thickness
const O = 26; // overhang

const VARIANTS = {
  a: { x0: 170, x1: 600, h: 118, wing: null },
  b: { x0: 205, x1: 565, h: 124, wing: null },
  c: { x0: 270, x1: 600, h: 118, wing: { x0: 150, x1: 270, h: 88 } },
};

function Run({ d, colors, glow, intensity, chase, uid }) {
  const on = intensity > 0.02;
  const n = colors.length;
  const seg = 9;
  return (
    <g className="hs-run">
      {on && <path d={d} stroke={glow} strokeWidth="16" strokeLinecap="round" fill="none" opacity={0.42 * intensity} filter={`url(#${uid}-blur)`} />}
      {n === 1 || !on ? (
        <path d={d} stroke={on ? colors[0] : '#4A4B4E'} strokeWidth="3.4" strokeLinecap="round" fill="none" opacity={on ? 0.35 + 0.65 * intensity : 1} />
      ) : (
        colors.map((c, i) => (
          <path key={c + i} d={d} stroke={c} strokeWidth="4" fill="none" opacity={0.35 + 0.65 * intensity}
            strokeDasharray={`${seg} ${seg * (n - 1)}`} strokeDashoffset={-i * seg} />
        ))
      )}
      {on && chase && <path className="hs-chase" d={d} stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity={0.55 * intensity} strokeDasharray="22 420" />}
    </g>
  );
}

function Block({ x0, x1, yb, h, uid, kind, stucco }) {
  const yt = yb - h;
  const side = `M${x1} ${yt} L${x1 + DX} ${yt + DY} L${x1 + DX} ${yb + DY} L${x1} ${yb} Z`;
  const slabTop = `M${x0 - O} ${yt - T} L${x0 - O + DX} ${yt - T + DY} L${x1 + O + DX} ${yt - T + DY} L${x1 + O} ${yt - T} Z`;
  const slabSide = `M${x1 + O} ${yt - T} L${x1 + O + DX} ${yt - T + DY} L${x1 + O + DX} ${yt + DY} L${x1 + O} ${yt} Z`;
  const soffit = `M${x0 - O} ${yt} L${x1 + O} ${yt} L${x1} ${yt + 6} L${x0} ${yt + 6} Z`;
  const w = x1 - x0;
  const lights = [];
  for (let x = x0 + 34; x < x1 - 20; x += 96) lights.push(x);
  return (
    <g>
      <path d={side} fill={stucco ? '#C9C2B6' : '#24272A'} />
      <rect x={x0} y={yt} width={w} height={h} fill={stucco ? '#EDE6DA' : `url(#${uid}-wall)`} />
      {kind === 'main' && (
        <>
          <rect x={x0 + 26} y={yt + 34} width="36" height={h - 34} fill="#3A2210" />
          <rect x={x0 + 29} y={yt + 37} width="30" height={h - 37} fill={`url(#${uid}-door)`} />
          <rect x={x0 + 86} y={yt + 14} width={w - 150} height={h - 20} fill={`url(#${uid}-glass)`} />
          {[1, 2, 3].map((i) => (
            <rect key={i} x={x0 + 86 + ((w - 150) / 4) * i - 2} y={yt + 14} width="4" height={h - 20} fill="#17191B" />
          ))}
          <rect x={x0 + 86} y={yt + 14} width={w - 150} height="4" fill="#17191B" />
          <rect x={x1 - 52} y={yt} width="44" height={h} fill="#2B2C2F" />
          {[0, 1, 2, 3, 4, 5, 6].map((r) => (
            <line key={r} x1={x1 - 52} x2={x1 - 8} y1={yt + 14 + r * 16} y2={yt + 14 + r * 16} stroke="#1D1E20" strokeWidth="1.4" />
          ))}
          <rect x={x1 - 34} y={yt + 40} width="10" height="7" rx="1.5" fill="#FFCF80" opacity=".85" />
        </>
      )}
      {kind === 'upper' && (
        <>
          <rect x={x0 + 26} y={yt + 20} width={w - 52} height={h - 44} fill={`url(#${uid}-glass)`} />
          {[1, 2, 3, 4].map((i) => (
            <rect key={i} x={x0 + 26 + ((w - 52) / 5) * i - 2} y={yt + 20} width="4" height={h - 44} fill="#17191B" />
          ))}
        </>
      )}
      {kind === 'wing' && (
        <>
          <rect x={x0 + 16} y={yt + 22} width={w - 32} height={h - 22} fill="#2C2E31" />
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <line key={r} x1={x0 + 16} x2={x1 - 16} y1={yt + 32 + r * 10} y2={yt + 32 + r * 10} stroke="#1F2123" strokeWidth="2" />
          ))}
        </>
      )}
      <path d={slabTop} fill="#141517" />
      <rect x={x0 - O} y={yt - T} width={w + 2 * O} height={T} fill="#1E1F22" />
      <path d={slabSide} fill="#18191B" />
      <path d={soffit} fill={`url(#${uid}-wood)`} />
      {lights.map((x) => (
        <g key={x}>
          <path d={`M${x - 3} ${yt + 6} L${x - 22} ${yt + 70} L${x + 22} ${yt + 70} L${x + 3} ${yt + 6} Z`} fill={`url(#${uid}-cone)`} />
          <ellipse cx={x} cy={yt + 6} rx="4" ry="1.6" fill="#FFE6B0" />
        </g>
      ))}
    </g>
  );
}

export default function HouseScene({
  color = 'warm', intensity = 1, coverage = 'front-sides', stories = 1, addons = [],
  variant = 'a', chase = false, title = 'Illustrated home with roofline lights', className = '', stucco = false, fit = 'meet', skyFade = false,
}) {
  const uid = `hs${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const V = VARIANTS[variant] || VARIANTS.a;
  const L = LIGHT_COLORS[color] || LIGHT_COLORS.warm;
  const I = Math.max(0, Math.min(1, intensity));
  const sides = coverage === 'front-sides';
  const two = stories === 2;

  const { x0, x1, h } = V;
  const yt = G - h;
  const up = { x0: x0 + 46, x1: x1 - 84, yb: yt - T, h: 104 };
  const runs = [];
  const roof = (bx0, bx1, byt) => {
    runs.push(`M${bx0 - O} ${byt} L${bx1 + O} ${byt}`);
    if (sides) runs.push(`M${bx1 + O} ${byt} L${bx1 + O + DX} ${byt + DY}`);
  };
  if (V.wing) roof(V.wing.x0, V.wing.x1, G - V.wing.h);
  roof(x0, x1, yt);
  if (two) roof(up.x0, up.x1, up.yb - up.h);

  const washes = [{ x: x0, y: yt, w: x1 - x0 }];
  if (two) washes.push({ x: up.x0, y: up.yb - up.h, w: up.x1 - up.x0 });
  if (V.wing) washes.push({ x: V.wing.x0, y: G - V.wing.h, w: V.wing.x1 - V.wing.x0 });

  const has = (id) => addons.includes(id);
  const doorX = x0 + 44;

  return (
    <svg className={`house-scene ${className}`} viewBox="0 0 800 440" role="img" aria-label={title} preserveAspectRatio={`xMidYMax ${fit}`}>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#03130F" stopOpacity={skyFade ? 0 : 1} />
          <stop offset={skyFade ? '.4' : '0'} stopColor="#03130F" />
          <stop offset=".62" stopColor="#0A2C23" />
          <stop offset="1" stopColor="#123E32" />
        </linearGradient>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A4C4F" />
          <stop offset="1" stopColor="#2F3134" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD08A" />
          <stop offset=".55" stopColor="#E99A3C" />
          <stop offset="1" stopColor="#9B5414" />
        </linearGradient>
        <linearGradient id={`${uid}-door`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7A4214" />
          <stop offset="1" stopColor="#B4691F" />
        </linearGradient>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B15001" />
          <stop offset="1" stopColor="#E89A3A" />
        </linearGradient>
        <linearGradient id={`${uid}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE2A6" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFE2A6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-wash`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.glow} stopOpacity=".5" />
          <stop offset="1" stopColor={L.glow} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-pool`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFD9A0" stopOpacity=".5" />
          <stop offset="1" stopColor="#FFD9A0" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-blur`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {!stucco && <rect width="800" height="440" fill={`url(#${uid}-sky)`} />}
      {!stucco && [[60, 40], [140, 92], [260, 30], [380, 70], [470, 22], [620, 52], [720, 96], [760, 30], [530, 110], [90, 150]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#FFF3D6" opacity=".55" />
      ))}
      {!stucco && (
        <path d="M0 384 Q60 300 110 330 Q150 270 200 320 L200 384 Z M620 384 Q690 290 740 326 Q770 300 800 318 L800 384 Z" fill="#071A15" />
      )}
      <rect y={G} width="800" height={440 - G} fill={stucco ? '#DCD4C6' : '#0A1814'} />
      <path d={`M${doorX - 16} ${G} L${doorX + 16} ${G} L${doorX + 60} 440 L${doorX - 60} 440 Z`} fill={stucco ? '#CFC6B6' : '#26292B'} />

      {V.wing && <Block x0={V.wing.x0} x1={V.wing.x1} yb={G} h={V.wing.h} uid={uid} kind="wing" stucco={stucco} />}
      <Block x0={x0} x1={x1} yb={G} h={h} uid={uid} kind="main" stucco={stucco} />
      {two && <Block x0={up.x0} x1={up.x1} yb={up.yb} h={up.h} uid={uid} kind="upper" stucco={stucco} />}

      {I > 0.02 && washes.map((w) => (
        <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y + 4} width={w.w} height="56" fill={`url(#${uid}-wash)`} opacity={I} />
      ))}
      {runs.map((d) => (
        <Run key={d} d={d} colors={L.run} glow={L.glow} intensity={I} chase={chase} uid={uid} />
      ))}

      {has('wreaths') && [doorX, x0 + 86 + (x1 - x0 - 150) / 2].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy={yt + (i ? 58 : 62)} r="14" fill="none" stroke="#14532D" strokeWidth="7" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <circle key={k} cx={cx + 14 * Math.cos((k * Math.PI) / 4)} cy={yt + (i ? 58 : 62) + 14 * Math.sin((k * Math.PI) / 4)} r="1.8" fill={L.run[k % L.run.length]} />
          ))}
          <path d={`M${cx - 5} ${yt + (i ? 72 : 76)} l5 6 l5 -6`} fill="#B91C1C" />
        </g>
      ))}

      {has('tree-wrap') && (
        <g>
          <rect x="66" y="330" width="8" height="54" fill="#2A1A0C" />
          <circle cx="70" cy="318" r="36" fill="#0F3A2C" />
          <circle cx="48" cy="338" r="22" fill="#0F3A2C" />
          <circle cx="94" cy="336" r="22" fill="#0F3A2C" />
          {Array.from({ length: 22 }).map((_, k) => {
            const a = k * 0.9;
            const r = 8 + (k % 6) * 5.4;
            return <circle key={k} cx={70 + r * Math.cos(a)} cy={322 + r * Math.sin(a) * 0.9} r="2" fill={L.run[k % L.run.length]} opacity={0.4 + 0.6 * I} />;
          })}
          <ellipse cx="96" cy="372" rx="16" ry="10" fill="#0F3A2C" />
          {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={84 + k * 6} cy={368 + (k % 2) * 5} r="1.8" fill={L.run[k % L.run.length]} opacity={0.4 + 0.6 * I} />)}
        </g>
      )}

      {has('pathway') && [0, 1, 2, 3].map((k) => {
        const yy = G + 12 + k * 13;
        const spread = 22 + k * 11;
        return [doorX - spread, doorX + spread].map((x) => (
          <g key={`${k}-${x}`}>
            <ellipse cx={x} cy={yy + 4} rx="12" ry="4" fill={`url(#${uid}-pool)`} />
            <rect x={x - 1} y={yy - 6} width="2" height="10" fill="#1A1A1A" />
            <circle cx={x} cy={yy - 7} r="2.4" fill="#FFE2A6" />
          </g>
        ));
      })}
    </svg>
  );
}

/* Top-down plan with lit edges, used on package cards and in booking. */
export function PlanDiagram({ coverage = 'front', className = '' }) {
  const lit = (edge) => edge === 'front' || (coverage === 'front-sides' && (edge === 'left' || edge === 'right'));
  const edges = [
    { id: 'back', d: 'M30 20 L190 20' },
    { id: 'left', d: 'M30 20 L30 110' },
    { id: 'right', d: 'M190 20 L190 110' },
    { id: 'front', d: 'M30 110 L190 110' },
  ];
  return (
    <svg className={`plan ${className}`} viewBox="0 0 220 140" role="img"
      aria-label={coverage === 'front' ? 'Plan view: front roofline lit' : 'Plan view: front and side rooflines lit'}>
      <rect x="30" y="20" width="160" height="90" className="plan__fill" />
      <path d="M30 65 H190 M110 20 V110" className="plan__grid" />
      {edges.map((e) => (
        <g key={e.id}>
          {lit(e.id) && <path d={e.d} className="plan__glow" />}
          <path d={e.d} className={lit(e.id) ? 'plan__lit' : 'plan__off'} />
        </g>
      ))}
      <text x="110" y="130" textAnchor="middle" className="plan__label">STREET</text>
    </svg>
  );
}
