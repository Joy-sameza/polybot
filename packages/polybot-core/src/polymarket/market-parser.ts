export interface YesNoTokens {
  yesTokenId: string;
  noTokenId: string;
}

const VOLUME_FIELDS = [
  'volume',
  'volume24hr',
  'volume24h',
  'volumeUsd',
  'volume_usd',
  'volume24hrUsd',
  'volume24hUsd',
  'volume24hr_usd',
  'volume24h_usd',
];

const END_DATE_FIELDS = [
  'endDate',
  'end_date',
  'endTime',
  'end_time',
  'closeDate',
  'close_date',
  'closingTime',
  'closing_time',
  'endTimestamp',
  'end_timestamp',
  'endTs',
  'end_ts',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonObj = Record<string, any>;

function text(node: JsonObj | null | undefined, field: string): string | null {
  if (node == null || field == null) return null;
  const v = node[field];
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return null;
}

function firstText(node: JsonObj, keys: string[]): string | null {
  for (const k of keys) {
    const v = text(node, k);
    if (v != null && v.trim().length > 0) return v;
  }
  return null;
}

function normalizeOutcome(outcome: string | null): string | null {
  if (outcome == null) return null;
  const trimmed = outcome.trim();
  if (trimmed.length === 0) return null;
  return trimmed.toUpperCase();
}

function parseStringArray(node: unknown): string[] {
  if (node == null) return [];
  if (Array.isArray(node)) {
    return node
      .filter((n) => n != null)
      .map((n) => (typeof n === 'string' ? n : String(n)));
  }
  if (typeof node === 'string') {
    const raw = node.trim();
    if (raw.length === 0) return [];
    try {
      const parsed = JSON.parse(raw);
      return parseStringArray(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

function parseBigDecimal(node: unknown): number | null {
  if (node == null) return null;
  if (typeof node === 'number') return node;
  if (typeof node === 'string') {
    const s = node.trim();
    if (s.length === 0) return null;
    const n = Number(s);
    return isNaN(n) ? null : n;
  }
  return null;
}

function parseEpochMillis(node: unknown): number | null {
  if (node == null) return null;
  if (typeof node === 'number') {
    if (node <= 0) return null;
    return node < 1_000_000_000_000 ? node * 1000 : node;
  }
  if (typeof node === 'string') {
    const trimmed = node.trim();
    if (trimmed.length === 0) return null;
    // Try ISO parse
    const isoMs = Date.parse(trimmed);
    if (!isNaN(isoMs)) return isoMs;
    // Try numeric
    if (/^\d+$/.test(trimmed)) {
      const value = parseInt(trimmed, 10);
      if (value <= 0) return null;
      return value < 1_000_000_000_000 ? value * 1000 : value;
    }
  }
  return null;
}

// --- Public API ---

export function question(market: JsonObj): string | null {
  let q = text(market, 'question');
  if (!q || q.trim().length === 0) q = text(market, 'title');
  if (!q || q.trim().length === 0) q = text(market, 'name');
  return q ? q.trim() : null;
}

export function id(market: JsonObj): string | null {
  let i = text(market, 'id');
  if (!i || i.trim().length === 0) i = text(market, 'marketId');
  if (!i || i.trim().length === 0) i = text(market, 'conditionId');
  return i ? i.trim() : null;
}

export function slug(market: JsonObj): string | null {
  const s = text(market, 'slug');
  return s ? s.trim() : null;
}

export function isLive(market: JsonObj | null | undefined): boolean {
  if (market == null) return false;

  if (market.active != null && !market.active) return false;
  if (market.closed != null && market.closed) return false;
  if (market.archived != null && market.archived) return false;
  if (market.isResolved != null && market.isResolved) return false;
  if (market.resolved != null && market.resolved) return false;

  const status = text(market, 'status');
  if (status != null) {
    const s = status.trim().toLowerCase();
    return !s.includes('resolved') && !s.includes('closed') && !s.includes('final');
  }
  return true;
}

export function volume(market: JsonObj | null | undefined): number | null {
  if (market == null) return null;
  for (const field of VOLUME_FIELDS) {
    const parsed = parseBigDecimal(market[field]);
    if (parsed != null) return parsed;
  }
  return null;
}

export function endEpochMillis(market: JsonObj | null | undefined): number | null {
  if (market == null) return null;
  for (const field of END_DATE_FIELDS) {
    const parsed = parseEpochMillis(market[field]);
    if (parsed != null) return parsed;
  }
  return null;
}

function yesNoTokensFromOutcomesAndClobTokenIds(market: JsonObj): YesNoTokens | null {
  let outcomesNode = market.outcomes;
  let clobTokenIdsNode = market.clobTokenIds;
  if (outcomesNode == null || clobTokenIdsNode == null) {
    outcomesNode = market.outcome;
    clobTokenIdsNode = market.clob_token_ids;
  }
  if (outcomesNode == null || clobTokenIdsNode == null) return null;

  const outcomes = parseStringArray(outcomesNode);
  const tokenIds = parseStringArray(clobTokenIdsNode);
  if (outcomes.length === 0 || tokenIds.length === 0) return null;

  const n = Math.min(outcomes.length, tokenIds.length);
  const tokenByOutcome: Record<string, string> = {};
  for (let i = 0; i < n; i++) {
    const outcome = outcomes[i];
    const tokenId = tokenIds[i];
    if (outcome == null || tokenId == null) continue;
    const o = normalizeOutcome(outcome);
    if (o == null) continue;
    tokenByOutcome[o] = tokenId.trim();
  }

  let yes = tokenByOutcome['YES'];
  let no = tokenByOutcome['NO'];
  if (!yes || !no) {
    yes = tokenByOutcome['UP'];
    no = tokenByOutcome['DOWN'];
  }
  if (!yes || !no) {
    if (outcomes.length === 2 && tokenIds.length >= 2) {
      yes = tokenIds[0]?.trim();
      no = tokenIds[1]?.trim();
    }
  }
  if (!yes || !no) return null;
  return { yesTokenId: yes, noTokenId: no };
}

function yesNoTokensFromTokensArray(market: JsonObj): YesNoTokens | null {
  const tokens = market.tokens;
  if (!Array.isArray(tokens)) return null;

  let yes: string | null = null;
  let no: string | null = null;
  for (const t of tokens) {
    if (t == null) continue;
    let outcome = text(t, 'outcome');
    if (!outcome || outcome.trim().length === 0) outcome = text(t, 'name');
    if (outcome == null) continue;

    let tokenId = text(t, 'token_id');
    if (!tokenId || tokenId.trim().length === 0) tokenId = text(t, 'tokenId');
    if (!tokenId || tokenId.trim().length === 0) tokenId = text(t, 'asset_id');
    if (!tokenId || tokenId.trim().length === 0) continue;

    const o = normalizeOutcome(outcome);
    if (o == null) continue;
    if (o === 'YES' || o === 'UP') yes = tokenId.trim();
    else if (o === 'NO' || o === 'DOWN') no = tokenId.trim();
  }
  if (!yes || !no) return null;
  return { yesTokenId: yes, noTokenId: no };
}

function yesNoTokensFromFlatFields(market: JsonObj): YesNoTokens | null {
  const yes = firstText(market, [
    'yesTokenId',
    'yes_token_id',
    'yesTokenID',
    'yes_token',
  ]);
  const no = firstText(market, [
    'noTokenId',
    'no_token_id',
    'noTokenID',
    'no_token',
  ]);
  if (!yes || yes.trim().length === 0 || !no || no.trim().length === 0) return null;
  return { yesTokenId: yes.trim(), noTokenId: no.trim() };
}

export function yesNoTokens(market: JsonObj | null | undefined): YesNoTokens | null {
  if (market == null) return null;
  return (
    yesNoTokensFromOutcomesAndClobTokenIds(market) ??
    yesNoTokensFromTokensArray(market) ??
    yesNoTokensFromFlatFields(market)
  );
}

function extractMarketsFromEvents(eventsArray: unknown[]): JsonObj[] {
  const markets: JsonObj[] = [];
  for (const event of eventsArray) {
    if (event == null || typeof event !== 'object') continue;
    const m = (event as JsonObj).markets;
    if (Array.isArray(m)) {
      markets.push(...m);
    }
  }
  return markets;
}

export function extractMarkets(root: unknown): JsonObj[] {
  if (root == null) return [];

  if (Array.isArray(root)) {
    let looksLikeEvents = false;
    for (let i = 0; i < Math.min(3, root.length); i++) {
      const n = root[i];
      if (n != null && typeof n === 'object' && Array.isArray(n.markets)) {
        looksLikeEvents = true;
        break;
      }
    }
    if (looksLikeEvents) return extractMarketsFromEvents(root);
    return root as JsonObj[];
  }

  if (typeof root !== 'object') return [];
  const obj = root as JsonObj;

  if (obj.markets && Array.isArray(obj.markets)) {
    return obj.markets as JsonObj[];
  }
  if (obj.events && Array.isArray(obj.events)) {
    return extractMarketsFromEvents(obj.events);
  }
  if (obj.data && Array.isArray(obj.data)) {
    const data = obj.data;
    let looksLikeEvents = false;
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const n = data[i];
      if (n != null && typeof n === 'object' && Array.isArray(n.markets)) {
        looksLikeEvents = true;
        break;
      }
    }
    if (looksLikeEvents) return extractMarketsFromEvents(data);
    return data as JsonObj[];
  }
  if (obj.results && Array.isArray(obj.results)) {
    return obj.results as JsonObj[];
  }
  return [];
}
