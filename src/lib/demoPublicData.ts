/**
 * Демо-стан рівно як у `supabase/seed_investor_demo.sql` (сезон 14), лише для `isDemoMode()`.
 */
import type { Database, Json } from '@/lib/database.types'
import type { PublicProfileRow } from '@/hooks/usePublicProfile'

type Season = Database['public']['Tables']['seasons']['Row']
type Bachelor = Database['public']['Tables']['bachelors']['Row']
type Episode = Database['public']['Tables']['episodes']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type BetEvent = Database['public']['Tables']['bet_events']['Row']
type BetOption = Database['public']['Tables']['bet_options']['Row']
type Bet = Database['public']['Tables']['bets']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type CoinTx = Database['public']['Tables']['coin_transactions']['Row']

const T0 = '2026-01-15T10:00:00.000Z'

/**
 * Тарас: офіційне фото з Wikimedia Commons. Учасниці: портрети Unsplash (ліцензія Unsplash) — **не** намагаються бути
 * кадрами STB; для преси/сайту підставте свої `photo_url` тут і в `seed_investor_demo.sql`.
 */
const DEMO_PH_BACHELOR =
  'https://upload.wikimedia.org/wikipedia/commons/a/ae/Taras_Tsymbaliuk.jpg'

const DEMO_PH_PARTICIPANT: string[] = [
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bdf8a7e9e0e0?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517209254367-0e7f0345e8e4?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=500&h=625&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=625&fit=crop&q=80',
]

export const DEMO_SEASON_ID = 'a0000000-0000-4000-8000-000000000140' as const
const B = 'a0000000-0000-4000-8000-000000000141' as const

const EP1 = 'a0000000-0000-4000-8000-000000000201' as const
const EP2 = 'a0000000-0000-4000-8000-000000000202' as const
const EP3 = 'a0000000-0000-4000-8000-000000000203' as const
const EP4 = 'a0000000-0000-4000-8000-000000000204' as const
const EP5 = 'a0000000-0000-4000-8000-000000000205' as const
const EP6 = 'a0000000-0000-4000-8000-000000000206' as const

const EV1 = 'c0000000-0000-4000-8000-000000000301' as const
const EV2 = 'c0000000-0000-4000-8000-000000000302' as const
const EV3 = 'c0000000-0000-4000-8000-000000000303' as const

export const U_ADMIN = 'b1111111-1111-4111-8111-111111111101'
export const U_ANNA = 'b1111111-1111-4111-8111-111111111102'
const U_OLEH = 'b1111111-1111-4111-8111-111111111103'
const U_IRA = 'b1111111-1111-4111-8111-111111111104'
const U_KATYA = 'b1111111-1111-4111-8111-111111111105'

const season: Season = {
  id: DEMO_SEASON_ID,
  number: 14,
  title: 'Холостяк 14',
  status: 'active',
  starts_at: T0,
  ends_at: null,
  created_at: T0,
}

const bachelors: Bachelor[] = [
  {
    id: B,
    season_id: DEMO_SEASON_ID,
    name: 'Тарас Цимбалюк',
    order_index: 1,
    photo_url: DEMO_PH_BACHELOR,
    bio: 'Актор кіно та серіалу; веде демо-історію 14-го сезону (дані з відкритих джерел).',
    created_at: T0,
  },
]

const episodes: Episode[] = [
  {
    id: EP1,
    season_id: DEMO_SEASON_ID,
    number: 1,
    title: 'Випуск 1',
    status: 'finalized',
    airs_at: T0,
    cover_url: null,
    created_at: T0,
    status_changed_at: T0,
  },
  {
    id: EP2,
    season_id: DEMO_SEASON_ID,
    number: 2,
    title: 'Випуск 2',
    status: 'finalized',
    airs_at: T0,
    cover_url: null,
    created_at: T0,
    status_changed_at: T0,
  },
  {
    id: EP3,
    season_id: DEMO_SEASON_ID,
    number: 3,
    title: 'Випуск 3',
    status: 'open',
    airs_at: T0,
    cover_url: null,
    created_at: T0,
    status_changed_at: T0,
  },
  {
    id: EP4,
    season_id: DEMO_SEASON_ID,
    number: 4,
    title: 'Випуск 4',
    status: 'locked',
    airs_at: T0,
    cover_url: null,
    created_at: T0,
    status_changed_at: T0,
  },
  {
    id: EP5,
    season_id: DEMO_SEASON_ID,
    number: 5,
    title: 'Випуск 5',
    status: 'draft',
    airs_at: null,
    cover_url: null,
    created_at: T0,
    status_changed_at: T0,
  },
  {
    id: EP6,
    season_id: DEMO_SEASON_ID,
    number: 6,
    title: 'Випуск 6',
    status: 'draft',
    airs_at: null,
    cover_url: null,
    created_at: T0,
    status_changed_at: T0,
  },
]

const P = (i: number) =>
  `a0000000-0000-4000-8000-${(150 + i).toString().padStart(12, '0')}` as string

const participants: Participant[] = [
  { id: P(1), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Анастасія Половинкіна', age: 26, city: 'Київ', photo_url: DEMO_PH_PARTICIPANT[0]!, bio: 'PR, демо', status: 'eliminated', eliminated_episode_id: EP1, created_at: T0 },
  { id: P(2), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Софія Шамія', age: 25, city: 'Львів', photo_url: DEMO_PH_PARTICIPANT[1]!, bio: 'Психологиня', status: 'eliminated', eliminated_episode_id: EP1, created_at: T0 },
  { id: P(3), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Яна Андрієнко', age: 28, city: 'Одеса', photo_url: DEMO_PH_PARTICIPANT[2]!, bio: 'Event-менеджер', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(4), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Діана Зотова', age: 24, city: 'Дніпро', photo_url: DEMO_PH_PARTICIPANT[3]!, bio: 'Маркетологиня', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(5), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Вікторія Крилас', age: 27, city: 'Харків', photo_url: DEMO_PH_PARTICIPANT[4]!, bio: 'Декораторка', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(6), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Оксана Шанюк', age: 29, city: 'Вінниця', photo_url: DEMO_PH_PARTICIPANT[5]!, bio: 'Підприємиця', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(7), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Дар’я Романець', age: 23, city: 'Чернівці', photo_url: DEMO_PH_PARTICIPANT[6]!, bio: 'Студентка', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(8), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Валерія Жуковська', age: 30, city: 'Київ', photo_url: DEMO_PH_PARTICIPANT[7]!, bio: 'Юристка', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(9), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Надія Авраменко', age: 26, city: 'Полтава', photo_url: DEMO_PH_PARTICIPANT[8]!, bio: 'IT-рекрутерка', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(10), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Ірина Кулешина', age: 27, city: 'Запоріжжя', photo_url: DEMO_PH_PARTICIPANT[9]!, bio: 'Флористка', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(11), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Ольга Дзундза', age: 32, city: 'Тернопіль', photo_url: DEMO_PH_PARTICIPANT[10]!, bio: 'Кухарка', status: 'active', eliminated_episode_id: null, created_at: T0 },
  { id: P(12), season_id: DEMO_SEASON_ID, current_bachelor_id: B, name: 'Марина Дурицька', age: 28, city: 'Рівне', photo_url: DEMO_PH_PARTICIPANT[11]!, bio: 'Дизайнерка', status: 'active', eliminated_episode_id: null, created_at: T0 },
]

function betEvBase(
  id: string,
  episode_id: string,
  type: string,
  title: string,
  status: string,
  total_staked: number,
  total_bets: number,
  winning: string[],
  closesIso: string,
): BetEvent {
  return {
    id,
    episode_id,
    type,
    bachelor_id: B,
    title,
    description: 'Демо.',
    opens_at: T0,
    closes_at: closesIso,
    status,
    is_live: false,
    is_lightning: false,
    is_multi_choice: false,
    winning_option_ids: winning,
    max_bet_amount: 500,
    total_staked,
    total_bets,
    created_at: T0,
    resolved_at: status === 'resolved' ? T0 : null,
    resolved_by: null,
  }
}

const opt = (
  id: string,
  event_id: string,
  pid: string | null,
  label: string,
  odds: number,
  oi: number,
  win: boolean,
  staked: number,
  cnt: number,
): BetOption => ({
  id,
  event_id,
  participant_id: pid,
  custom_label: label,
  odds,
  order_index: oi,
  is_winning: win,
  option_total_staked: staked,
  option_bets_count: cnt,
})

const o311 = 'a0000000-0000-4000-8000-000000000311'
const o312 = 'a0000000-0000-4000-8000-000000000312'
const o313 = 'a0000000-0000-4000-8000-000000000313'
const o314 = 'a0000000-0000-4000-8000-000000000314'
const o321 = 'a0000000-0000-4000-8000-000000000321'
const o322 = 'a0000000-0000-4000-8000-000000000322'
const o323 = 'a0000000-0000-4000-8000-000000000323'
const o331 = 'a0000000-0000-4000-8000-000000000331'
const o332 = 'a0000000-0000-4000-8000-000000000332'

const optionsByEvent = new Map<string, BetOption[]>()
optionsByEvent.set(EV1, [
  opt(o311, EV1, P(1), 'Анастасія', 2.2, 1, false, 100, 1),
  opt(o312, EV1, P(2), 'Софія', 2.3, 2, false, 80, 1),
  opt(o313, EV1, P(3), 'Яна', 2.5, 3, true, 320, 2),
  opt(o314, EV1, P(4), 'Діана', 2.0, 4, false, 0, 0),
])
optionsByEvent.set(EV2, [
  opt(o321, EV2, P(3), 'Яна', 1.8, 1, false, 100, 1),
  opt(o322, EV2, P(5), 'Вікторія', 2.1, 2, true, 200, 1),
  opt(o323, EV2, P(6), 'Оксана', 1.7, 3, false, 0, 0),
])
optionsByEvent.set(EV3, [
  opt(o331, EV3, P(7), 'Дар’я', 1.5, 1, false, 0, 0),
  opt(o332, EV3, P(8), 'Валерія', 1.5, 2, false, 0, 0),
])

const betEvents: BetEvent[] = [
  betEvBase(EV1, EP1, 'first_rose', 'Перша троянда: хто отримає квітку від Тараса?', 'resolved', 650, 5, [o313], T0),
  betEvBase(EV2, EP2, 'eliminated', 'Хто покине проєкт у 2 випуску?', 'resolved', 300, 2, [o322], T0),
  betEvBase(EV3, EP3, 'custom', 'Хто отримає додаткове побачення в 3 випуску?', 'open', 0, 0, [], T0),
]

const bets: Bet[] = [
  { id: 'd0000000-0000-4000-8000-000000000401', user_id: U_ADMIN, event_id: EV1, option_id: o311, amount: 100, odds_snapshot: 2.2, potential_payout: 220, status: 'lost', payout: 0, placed_at: T0, settled_at: T0 },
  { id: 'd0000000-0000-4000-8000-000000000402', user_id: U_ANNA, event_id: EV1, option_id: o313, amount: 200, odds_snapshot: 2.5, potential_payout: 500, status: 'won', payout: 500, placed_at: T0, settled_at: T0 },
  { id: 'd0000000-0000-4000-8000-000000000403', user_id: U_OLEH, event_id: EV1, option_id: o311, amount: 150, odds_snapshot: 2.2, potential_payout: 330, status: 'lost', payout: 0, placed_at: T0, settled_at: T0 },
  { id: 'd0000000-0000-4000-8000-000000000404', user_id: U_IRA, event_id: EV1, option_id: o313, amount: 120, odds_snapshot: 2.5, potential_payout: 300, status: 'won', payout: 300, placed_at: T0, settled_at: T0 },
  { id: 'd0000000-0000-4000-8000-000000000405', user_id: U_KATYA, event_id: EV1, option_id: o312, amount: 80, odds_snapshot: 2.3, potential_payout: 184, status: 'lost', payout: 0, placed_at: T0, settled_at: T0 },
  { id: 'd0000000-0000-4000-8000-000000000406', user_id: U_ADMIN, event_id: EV2, option_id: o322, amount: 200, odds_snapshot: 2.1, potential_payout: 420, status: 'won', payout: 420, placed_at: T0, settled_at: T0 },
  { id: 'd0000000-0000-4000-8000-000000000407', user_id: U_OLEH, event_id: EV2, option_id: o321, amount: 100, odds_snapshot: 1.8, potential_payout: 180, status: 'lost', payout: 0, placed_at: T0, settled_at: T0 },
]

const demoProfiles: Record<string, Profile> = {
  [U_ADMIN]: { id: U_ADMIN, nickname: 'admin_demo', avatar_url: 'https://picsum.photos/seed/du1/120/120', balance: 2120, correct_bets: 1, total_bets: 2, total_won: 420, streak_current: 1, streak_best: 1, role: 'admin', is_banned: false, created_at: T0 },
  [U_ANNA]: { id: U_ANNA, nickname: 'anna_demo', avatar_url: 'https://picsum.photos/seed/du2/120/120', balance: 2300, correct_bets: 1, total_bets: 1, total_won: 500, streak_current: 1, streak_best: 1, role: 'user', is_banned: false, created_at: T0 },
  [U_OLEH]: { id: U_OLEH, nickname: 'oleh_demo', avatar_url: 'https://picsum.photos/seed/du3/120/120', balance: 1750, correct_bets: 0, total_bets: 2, total_won: 0, streak_current: 0, streak_best: 0, role: 'user', is_banned: false, created_at: T0 },
  [U_IRA]: { id: U_IRA, nickname: 'ira_demo', avatar_url: 'https://picsum.photos/seed/du4/120/120', balance: 2180, correct_bets: 1, total_bets: 1, total_won: 300, streak_current: 1, streak_best: 1, role: 'user', is_banned: false, created_at: T0 },
  [U_KATYA]: { id: U_KATYA, nickname: 'katya_demo', avatar_url: 'https://picsum.photos/seed/du5/120/120', balance: 1920, correct_bets: 0, total_bets: 1, total_won: 0, streak_current: 0, streak_best: 0, role: 'user', is_banned: false, created_at: T0 },
}

const nickToProfile = new Map(
  Object.values(demoProfiles)
    .filter((p) => p.nickname)
    .map((p) => [p.nickname as string, p] as const),
)

/** All-time: як у `leaderboard_all_time` (ранг за total_won) */
const lbAll = [
  { user_id: U_ANNA, total_won: 500, rank: 1 },
  { user_id: U_ADMIN, total_won: 420, rank: 2 },
  { user_id: U_IRA, total_won: 300, rank: 3 },
  { user_id: U_OLEH, total_won: 0, rank: 4 },
  { user_id: U_KATYA, total_won: 0, rank: 5 },
] as const

function rowAll(uid: string) {
  const p = demoProfiles[uid]!
  const acc = p.total_bets > 0 ? p.correct_bets / p.total_bets : 0
  const rank = lbAll.find((x) => x.user_id === uid)?.rank ?? 99
  return {
    user_id: uid,
    nickname: p.nickname,
    avatar_url: p.avatar_url,
    total_won: p.total_won,
    total_bets: p.total_bets,
    correct_bets: p.correct_bets,
    accuracy: acc,
    streak_best: p.streak_best,
    rank_by_won: rank,
    achievement_count: 0,
  }
}

const seasonWon: Record<string, { sw: number; sb: number; sc: number }> = {
  [U_ANNA]: { sw: 500, sb: 1, sc: 1 },
  [U_ADMIN]: { sw: 420, sb: 2, sc: 1 },
  [U_IRA]: { sw: 300, sb: 1, sc: 1 },
  [U_OLEH]: { sw: 0, sb: 2, sc: 0 },
  [U_KATYA]: { sw: 0, sb: 1, sc: 0 },
}

function rowSeason(uid: string) {
  const p = demoProfiles[uid]!
  const s = seasonWon[uid] ?? { sw: 0, sb: 0, sc: 0 }
  const acc = s.sb > 0 ? s.sc / s.sb : 0
  const order = [U_ANNA, U_ADMIN, U_IRA, U_OLEH, U_KATYA]
  const rank = order.indexOf(uid) + 1
  return {
    user_id: uid,
    nickname: p.nickname,
    avatar_url: p.avatar_url,
    season_total_won: s.sw,
    season_bets: s.sb,
    season_correct: s.sc,
    accuracy: acc,
    streak_best: p.streak_best,
    rank_by_won: rank,
    achievement_count: 0,
  }
}

const coinByUser = new Map<string, CoinTx[]>()
const tx = (u: string, id: string, d: number, after: number, k: string, ref: string | null): CoinTx => ({
  id,
  user_id: u,
  delta: d,
  balance_after: after,
  kind: k,
  ref_id: ref,
  admin_id: null,
  note: null,
  created_at: T0,
})

coinByUser.set(U_ADMIN, [
  tx(U_ADMIN, 't1', 2000, 2000, 'admin_grant', null),
  tx(U_ADMIN, 't2', -100, 1900, 'bet_placed', 'd0000000-0000-4000-8000-000000000401'),
  tx(U_ADMIN, 't3', -200, 1700, 'bet_placed', 'd0000000-0000-4000-8000-000000000406'),
  tx(U_ADMIN, 't4', 420, 2120, 'bet_won', 'd0000000-0000-4000-8000-000000000406'),
])
coinByUser.set(U_ANNA, [tx(U_ANNA, 'a1', 2000, 2000, 'admin_grant', null), tx(U_ANNA, 'a2', -200, 1800, 'bet_placed', 'd0000000-0000-4000-8000-000000000402'), tx(U_ANNA, 'a3', 500, 2300, 'bet_won', 'd0000000-0000-4000-8000-000000000402')])
coinByUser.set(
  U_OLEH,
  [tx(U_OLEH, 'o1', 2000, 2000, 'admin_grant', null), tx(U_OLEH, 'o2', -150, 1850, 'bet_placed', 'd0000000-0000-4000-8000-000000000403'), tx(U_OLEH, 'o3', -100, 1750, 'bet_placed', 'd0000000-0000-4000-8000-000000000407')],
)
coinByUser.set(
  U_IRA,
  [tx(U_IRA, 'i1', 2000, 2000, 'admin_grant', null), tx(U_IRA, 'i2', -120, 1880, 'bet_placed', 'd0000000-0000-4000-8000-000000000404'), tx(U_IRA, 'i3', 300, 2180, 'bet_won', 'd0000000-0000-4000-8000-000000000404')],
)
coinByUser.set(U_KATYA, [tx(U_KATYA, 'k1', 2000, 2000, 'admin_grant', null), tx(U_KATYA, 'k2', -80, 1920, 'bet_placed', 'd0000000-0000-4000-8000-000000000405')])

// --- public API ---

export function getDemoAppSettings(): Record<string, Json> {
  return { active_season_id: JSON.stringify(DEMO_SEASON_ID) as unknown as Json }
}

export function getDemoActiveSeason(): Season {
  return season
}

export function getDemoBachelors(_seasonId: string): Bachelor[] {
  return bachelors
}

export function getDemoEpisodes(seasonId: string): Episode[] {
  if (seasonId !== DEMO_SEASON_ID) return []
  return episodes.slice().sort((a, b) => a.number - b.number)
}

export function getDemoEpisode(
  id: string,
):
  | (Episode & { season: Pick<Season, 'number' | 'title'> | null })
  | null {
  const ep = episodes.find((e) => e.id === id) ?? null
  if (!ep) return null
  return { ...ep, season: { number: season.number, title: season.title } }
}

export function getDemoParticipants(
  seasonId: string,
): (Participant & { bachelor: { name: string } | null })[] {
  if (seasonId !== DEMO_SEASON_ID) return []
  return participants
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
    .map((p) => ({ ...p, bachelor: { name: bachelors[0]!.name } }))
}

export function getDemoBetEventsForEpisode(episodeId: string): (BetEvent & { bet_options: BetOption[] })[] {
  return betEvents
    .filter((e) => e.episode_id === episodeId)
    .map((e) => ({
      ...e,
      bet_options: (optionsByEvent.get(e.id) ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    }))
    .sort((a, b) => new Date(a.closes_at).getTime() - new Date(b.closes_at).getTime())
}

export function getDemoBetEvent(
  eventId: string,
  userId: string | undefined,
): { event: BetEvent & { bet_options: BetOption[] }; myBet: Bet | null } | null {
  const e = betEvents.find((x) => x.id === eventId) ?? null
  if (!e) return null
  const event = { ...e, bet_options: (optionsByEvent.get(e.id) ?? []).slice().sort((a, b) => a.order_index - b.order_index) }
  return { event, myBet: getDemoMyBetForEvent(userId, eventId) }
}

export function getDemoMyBetForEvent(userId: string | undefined, eventId: string): Bet | null {
  if (!userId) return null
  return bets.find((b) => b.user_id === userId && b.event_id === eventId) ?? null
}

export function getDemoProfile(userId: string): Profile | null {
  return demoProfiles[userId] ?? null
}

export function getDemoPublicProfileByNickname(nickname: string): PublicProfileRow | null {
  const p = nickToProfile.get(nickname) ?? null
  if (!p) return null
  return {
    id: p.id,
    nickname: p.nickname,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
    total_won: p.total_won,
    total_bets: p.total_bets,
    correct_bets: p.correct_bets,
    streak_best: p.streak_best,
  }
}

const LB_UIDS = [U_ANNA, U_ADMIN, U_IRA, U_OLEH, U_KATYA] as const

export function getDemoLeaderboardAllRows() {
  return LB_UIDS.map((uid) => rowAll(uid))
}

export function getDemoLeaderboardSeasonLikeRows() {
  return LB_UIDS.map((uid) => rowSeason(uid))
}

export function getDemoMyBets(
  userId: string,
  status: string | null,
  page: number,
  pageSize: number,
): { rows: (Bet & { bet_events: { id: string; title: string; status: string; closes_at: string; episodes: { number: number; title: string | null } | null } | null })[]; total: number; pageSize: number } {
  let list = bets.filter((b) => b.user_id === userId)
  if (status) list = list.filter((b) => b.status === status)
  const evMap = new Map(betEvents.map((e) => [e.id, e]))
  const epMap = new Map(episodes.map((e) => [e.id, e]))
  const withJoin = list.map((b) => {
    const be = evMap.get(b.event_id) ?? null
    const ep = be ? epMap.get(be.episode_id) ?? null : null
    return {
      ...b,
      bet_events: be
        ? {
            id: be.id,
            title: be.title,
            status: be.status,
            closes_at: be.closes_at,
            episodes: ep ? { number: ep.number, title: ep.title } : null,
          }
        : null,
    }
  })
  withJoin.sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime())
  const total = withJoin.length
  const from = page * pageSize
  return { rows: withJoin.slice(from, from + pageSize), total, pageSize }
}

export function getDemoMyBetsForEpisodeMap(userId: string, episodeId: string): Map<string, Bet> {
  const eventIds = betEvents.filter((e) => e.episode_id === episodeId).map((e) => e.id)
  const m = new Map<string, Bet>()
  for (const b of bets) {
    if (b.user_id === userId && eventIds.includes(b.event_id)) m.set(b.event_id, b)
  }
  return m
}

export function getDemoCoinTransactions(
  userId: string,
  page: number,
  pageSize: number,
  kind: string | null,
): { rows: CoinTx[]; total: number; pageSize: number } {
  let rows = (coinByUser.get(userId) ?? []).slice()
  if (kind) rows = rows.filter((r) => r.kind === kind)
  rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const total = rows.length
  const from = page * pageSize
  return { rows: rows.slice(from, from + pageSize), total, pageSize }
}

export function getDemoLightningForEpisode(_episodeId: string) {
  return [] as (BetEvent & { bet_options: BetOption[] })[]
}
