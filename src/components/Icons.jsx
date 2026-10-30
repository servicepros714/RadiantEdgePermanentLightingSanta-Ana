const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const I = (paths) => function Icon(props) { return <svg {...base} {...props}>{paths}</svg>; };

export const Phone = I(<path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z" />);
export const Arrow = I(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);
export const Back = I(<><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>);
export const Check = I(<path d="m5 12.5 4.5 4.5L19 7" />);
export const Close = I(<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>);
export const Menu = I(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M10 17h10" /></>);
export const Chevron = I(<path d="m6 9 6 6 6-6" />);
export const ChevronL = I(<path d="m15 6-6 6 6 6" />);
export const ChevronR = I(<path d="m9 6 6 6-6 6" />);
export const Calendar = I(<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>);
export const Clock = I(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>);
export const Pin = I(<><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>);
export const Lock = I(<><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>);
export const Home = I(<><path d="M3 11h18" /><path d="M5 11v9h14v-9" /><path d="M2 8h20" /><path d="M10 20v-5h4v5" /></>);
export const Tree = I(<><path d="M12 3 6 11h3l-4 6h14l-4-6h3Z" /><path d="M12 17v4" /></>);
export const Wreath = I(<><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3.5" /><path d="m10 19 2 2.5 2-2.5" /></>);
export const Path = I(<><path d="M8 21 10 3M16 21 14 3" /><circle cx="5" cy="9" r="1.2" /><circle cx="19" cy="9" r="1.2" /><circle cx="4" cy="16" r="1.2" /><circle cx="20" cy="16" r="1.2" /></>);
export const Bulb = I(<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></>);
export const Box = I(<><path d="M3 8 12 3l9 5v8l-9 5-9-5Z" /><path d="M3 8l9 5 9-5M12 13v8" /></>);
export const Stack = I(<><rect x="4" y="12" width="16" height="8" /><rect x="7" y="4" width="10" height="8" /></>);
export const Sun = I(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const Spark = I(<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />);

export const ADDON_ICONS = { tree: Tree, wreath: Wreath, path: Path, bulb: Bulb, box: Box };
