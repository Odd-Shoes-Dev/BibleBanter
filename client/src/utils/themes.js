export const THEMES = [
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    emoji: '🌌',
    free: true,
    bg: 'linear-gradient(180deg, #0d0918 0%, #111228 60%, #0d0918 100%)',
    gameBg: '#0d0918',
    accent: '#7c3aed',
    accentText: '#a78bfa',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    emoji: '🌊',
    free: true,
    bg: 'linear-gradient(180deg, #0a0f1e 0%, #0d1630 60%, #0a0f1e 100%)',
    gameBg: '#0a1020',
    accent: '#2563eb',
    accentText: '#93c5fd',
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌿',
    free: true,
    bg: 'linear-gradient(180deg, #071a10 0%, #0d2416 60%, #071a10 100%)',
    gameBg: '#081810',
    accent: '#16a34a',
    accentText: '#86efac',
  },
  {
    id: 'holy-gold',
    name: 'Holy Gold',
    emoji: '✨',
    free: false,
    bg: 'linear-gradient(180deg, #1a1200 0%, #231a00 60%, #1a1200 100%)',
    gameBg: '#18110a',
    accent: '#d97706',
    accentText: '#fcd34d',
  },
  {
    id: 'crimson-fire',
    name: 'Crimson Fire',
    emoji: '🔥',
    free: false,
    bg: 'linear-gradient(180deg, #1a0505 0%, #230a0a 60%, #1a0505 100%)',
    gameBg: '#160505',
    accent: '#dc2626',
    accentText: '#fca5a5',
  },
  {
    id: 'celestial',
    name: 'Celestial',
    emoji: '☁️',
    free: false,
    bg: 'linear-gradient(180deg, #0c1628 0%, #0f1f3d 60%, #0c1628 100%)',
    gameBg: '#0b1525',
    accent: '#7dd3fc',
    accentText: '#bae6fd',
  },
];

const STORAGE_KEY = 'bb_theme';

export function getSavedTheme() {
  const id = localStorage.getItem(STORAGE_KEY) || 'dark-purple';
  return THEMES.find(t => t.id === id) || THEMES[0];
}

export function saveTheme(id) {
  localStorage.setItem(STORAGE_KEY, id);
}
