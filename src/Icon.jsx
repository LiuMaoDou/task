import {
  CalendarCheck, CalendarRange, Calendar, Inbox, Clock,
  Plus, Flag, FileText, Trash2, Check, X, AlignLeft,
  MoreHorizontal, ChevronDown, ChevronRight, Star, Bell,
  Search, ListChecks, Tag, CornerDownRight, LayoutList, Sun, Moon,
  // List icon variants used for lists
  Briefcase, Home, Dumbbell, BookOpen, Target, Lightbulb, ShoppingCart,
  Music, Leaf, Heart, Bookmark, Puzzle, Rocket, Palette, Coffee, Camera,
  Globe, Zap, Pen, Gift, Plane, Layers, Code, Film, Flower, Trophy,
} from 'lucide-react';

const NAME_MAP = {
  CalendarCheck, CalendarRange, Calendar, Inbox, Clock,
  Plus, Flag, FileText, Trash2, Check, X, AlignLeft,
  MoreHorizontal, ChevronDown, ChevronRight, Star, Bell,
  Search, ListChecks, Tag, CornerDownRight, LayoutList, Sun, Moon,
  Briefcase, Home, Dumbbell, BookOpen, Target, Lightbulb, ShoppingCart,
  Music, Leaf, Heart, Bookmark, Puzzle, Rocket, Palette, Coffee, Camera,
  Globe, Zap, Pen, Gift, Plane, Layers, Code, Film, Flower, Trophy,
};

// Internal alias → Lucide component name
const ALIAS = {
  today:    'CalendarCheck',
  week:     'CalendarRange',
  calendar: 'Calendar',
  inbox:    'Inbox',
  summary:  'Clock',
  add:      'Plus',
  flag:     'Flag',
  note:     'FileText',
  trash:    'Trash2',
  done:     'Check',
  close:    'X',
  sort:     'AlignLeft',
  more:     'MoreHorizontal',
  chevron:  'ChevronDown',
  chevronR: 'ChevronRight',
  star:     'Star',
  bell:     'Bell',
  search:   'Search',
  list:     'ListChecks',
  tag:      'Tag',
  subtask:  'CornerDownRight',
  timeline: 'LayoutList',
  sun:      'Sun',
  moon:     'Moon',
};

export function Icon({ name, size = 16, color = 'currentColor', style = {} }) {
  const resolved = ALIAS[name] || name;
  const Comp = NAME_MAP[resolved];
  if (!Comp) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', width: size, height: size, flexShrink: 0, ...style }}>
      <Comp size={size} color={color} strokeWidth={1.6} />
    </span>
  );
}

// Renders any Lucide icon by its PascalCase name (for dynamic list icons)
export function LucideIcon({ name, size = 16, color = 'currentColor' }) {
  const Comp = NAME_MAP[name];
  if (!Comp) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', width: size, height: size, flexShrink: 0 }}>
      <Comp size={size} color={color} strokeWidth={1.6} />
    </span>
  );
}
