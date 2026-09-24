/**
 * Names and monsters: the data the sim draws from. Placeholder content,
 * meant to be edited freely.
 */

export const NAMES: readonly string[] = [
  'Ada',
  'Bram',
  'Cass',
  'Dorran',
  'Edda',
  'Fenn',
  'Greta',
  'Hale',
  'Ilse',
  'Jory',
  'Kestrel',
  'Lark',
  'Mara',
  'Nils',
  'Orla',
  'Pell',
  'Quill',
  'Rowan',
  'Sabine',
  'Tamsin',
  'Ulric',
  'Vesna',
  'Wyn',
  'Ysolde',
  'Aldous',
  'Briar',
  'Corin',
  'Dagny',
  'Esme',
  'Farro',
  'Gideon',
  'Hesper',
  'Ivo',
  'Juniper',
  'Kit',
  'Linnea',
  'Magnus',
  'Nell',
  'Oswin',
  'Petra',
  'Rook',
  'Sten',
  'Thea',
  'Una',
  'Viggo',
  'Wren',
  'Yarrow',
  'Zelda',
]

export interface EnemyKind {
  name: string
  /** First depth this kind can appear at. */
  minDepth: number
  hp: number
  damage: number
  /** Seconds between its attacks. */
  attackSeconds: number
}

/** Ordered weakest first. Stats scale up with depth; see `scaleEnemy`. */
export const ENEMY_KINDS: readonly EnemyKind[] = [
  { name: 'Murkling', minDepth: 1, hp: 12, damage: 2, attackSeconds: 2 },
  { name: 'Hollow', minDepth: 3, hp: 30, damage: 4, attackSeconds: 3 },
  { name: 'Fogbeast', minDepth: 7, hp: 60, damage: 7, attackSeconds: 3.5 },
  {
    name: 'Drowned Knight',
    minDepth: 11,
    hp: 110,
    damage: 11,
    attackSeconds: 4,
  },
]

/** Per node past the first: enemies grow this much tougher and harder-hitting. */
export const ENEMY_HP_GROWTH = 0.08
export const ENEMY_DAMAGE_GROWTH = 0.06

/** Most enemies a single node can hold. */
export const MAX_ENEMIES = 5
