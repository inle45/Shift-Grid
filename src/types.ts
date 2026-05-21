export type GameId =
  | 'tap-rush'
  | 'swipe-chain'
  | 'clicker'
  | 'pulse-collector'
  | 'combo-blitz';

export interface GameConfig {
  id: GameId;
  name: string;
  tagline: string;
  duration: number;
  color: string;
  icon: string;
}

export interface GameProps {
  isActive: boolean;
  onScore: (delta: number) => void;
}

export const GAME_CONFIGS: Record<GameId, GameConfig> = {
  'tap-rush': {
    id: 'tap-rush',
    name: 'TAP RUSH',
    tagline: 'Tape les cercles le plus vite possible!',
    duration: 10,
    color: '#00D4FF',
    icon: '◎',
  },
  'swipe-chain': {
    id: 'swipe-chain',
    name: 'SWIPE CHAIN',
    tagline: 'Enchaîne les carrés dans le bon ordre!',
    duration: 15,
    color: '#00FF87',
    icon: '⬡',
  },
  'clicker': {
    id: 'clicker',
    name: 'CLICKER',
    tagline: 'Tape sans arrêt, le multiplicateur monte!',
    duration: 20,
    color: '#FFD600',
    icon: '◉',
  },
  'pulse-collector': {
    id: 'pulse-collector',
    name: 'PULSE',
    tagline: 'Tape quand le cercle est dans la zone !',
    duration: 15,
    color: '#FF0066',
    icon: '◈',
  },
  'combo-blitz': {
    id: 'combo-blitz',
    name: 'COMBO BLITZ',
    tagline: 'Alterne gauche / droite aussi vite que tu peux!',
    duration: 12,
    color: '#A855F7',
    icon: '⬡',
  },
};

export const GAME_ORDER: GameId[] = [
  'tap-rush',
  'swipe-chain',
  'clicker',
  'pulse-collector',
  'combo-blitz',
];
