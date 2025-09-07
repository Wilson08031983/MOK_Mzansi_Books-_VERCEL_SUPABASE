// Local storage-backed payment method storage for development
// Do NOT store full PAN or CVV. Only store last4 and non-sensitive metadata.

export interface SavedPaymentMethod {
  id: string; // unique id for this card (local only)
  last4: string;
  expMonth?: string | number;
  expYear?: string | number; // full year e.g., 2027
  brand?: string;
  cardholderName?: string;
  updatedAt?: string;
  isDefault?: boolean;
}

const STORAGE_PREFIX = 'mokm_payment_method_';

function getStorageKey(userKey: string) {
  return `${STORAGE_PREFIX}${userKey}`;
}

// Internal type for persisted payload
interface StoredCardsPayload {
  cards: SavedPaymentMethod[];
}

function normalizePayload(raw: any): StoredCardsPayload | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // New format already
    if (parsed && Array.isArray(parsed.cards)) {
      return { cards: parsed.cards as SavedPaymentMethod[] };
    }
    // Backward-compat: old format stored a single card object
    if (parsed && typeof parsed === 'object' && parsed.last4) {
      const migrated: SavedPaymentMethod = {
        id: `card_${Date.now()}`,
        last4: parsed.last4,
        expMonth: parsed.expMonth,
        expYear: parsed.expYear,
        brand: parsed.brand,
        cardholderName: parsed.cardholderName,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        isDefault: true,
      };
      return { cards: [migrated] };
    }
    return { cards: [] };
  } catch {
    return { cards: [] };
  }
}

function savePayload(userKey: string, payload: StoredCardsPayload) {
  localStorage.setItem(getStorageKey(userKey), JSON.stringify(payload));
}

export const paymentsStorageService = {
  // Return all cards for a user (default card should be first)
  getAll(userKey: string): SavedPaymentMethod[] {
    try {
      const raw = localStorage.getItem(getStorageKey(userKey));
      const payload = normalizePayload(raw) || { cards: [] };
      const sorted = [...payload.cards].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      return sorted;
    } catch {
      return [];
    }
  },

  // Backward-compat getter for single card (returns default or first)
  get(userKey: string): SavedPaymentMethod | null {
    const cards = this.getAll(userKey);
    if (!cards.length) return null;
    const def = cards.find(c => c.isDefault) || cards[0];
    return def || null;
  },

  // Backward-compat setter: replaces default with provided card
  set(userKey: string, value: Omit<SavedPaymentMethod, 'id'>) {
    try {
      const cards = this.getAll(userKey);
      const id = `card_${Date.now()}`;
      const newCard: SavedPaymentMethod = { ...value, id, isDefault: cards.length === 0 ? true : (value as any).isDefault } as SavedPaymentMethod;
      const payload: StoredCardsPayload = { cards: cards.length ? cards.map(c => ({ ...c, isDefault: false })) : [] };
      payload.cards.unshift(newCard);
      savePayload(userKey, payload);
      return true;
    } catch {
      return false;
    }
  },

  add(userKey: string, value: Omit<SavedPaymentMethod, 'id'>): { ok: boolean; reason?: string; card?: SavedPaymentMethod } {
    const cards = this.getAll(userKey);
    if (cards.length >= 3) return { ok: false, reason: 'limit' };
    const id = `card_${Date.now()}`;
    const isDefault = cards.length === 0 || Boolean(value.isDefault);
    const newCard: SavedPaymentMethod = { ...value, id, isDefault } as SavedPaymentMethod;
    const payload: StoredCardsPayload = { cards: [...cards] };
    if (isDefault) {
      payload.cards = payload.cards.map(c => ({ ...c, isDefault: false }));
      payload.cards.unshift(newCard);
    } else {
      payload.cards.push(newCard);
    }
    savePayload(userKey, payload);
    return { ok: true, card: newCard };
  },

  setDefault(userKey: string, cardId: string) {
    const cards = this.getAll(userKey);
    const payload: StoredCardsPayload = { cards: cards.map(c => ({ ...c, isDefault: c.id === cardId })) };
    savePayload(userKey, payload);
  },

  remove(userKey: string, cardId: string) {
    const cards = this.getAll(userKey);
    let filtered = cards.filter(c => c.id !== cardId);
    if (filtered.length && !filtered.some(c => c.isDefault)) {
      // ensure one default
      filtered = filtered.map((c, idx) => ({ ...c, isDefault: idx === 0 }));
    }
    savePayload(userKey, { cards: filtered });
  }
};