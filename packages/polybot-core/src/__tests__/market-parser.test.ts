import { yesNoTokens, extractMarkets, question } from '../polymarket/market-parser';

describe('PolymarketMarketParser', () => {
  describe('yesNoTokens', () => {
    it('reads array outcomes and clobTokenIds', () => {
      const market = {
        question: 'Will BTC be up in 15 minutes?',
        outcomes: ['Yes', 'No'],
        clobTokenIds: ['111', '222'],
      };
      const result = yesNoTokens(market);
      expect(result).toEqual({ yesTokenId: '111', noTokenId: '222' });
    });

    it('reads JSON string fields', () => {
      const market = {
        question: 'Will ETH be up in 15 minutes?',
        outcomes: '["Yes","No"]',
        clobTokenIds: '["333","444"]',
      };
      const result = yesNoTokens(market);
      expect(result).toEqual({ yesTokenId: '333', noTokenId: '444' });
    });

    it('supports Up/Down outcomes', () => {
      const market = {
        active: true,
        outcomes: '["Up", "Down"]',
        clobTokenIds: '["111", "222"]',
      };
      const result = yesNoTokens(market);
      expect(result).not.toBeNull();
      expect(result!.yesTokenId).toBe('111');
      expect(result!.noTokenId).toBe('222');
    });
  });

  describe('extractMarkets', () => {
    it('extracts from events payload', () => {
      const root = {
        events: [
          {
            id: 'e1',
            markets: [
              { question: 'Q1', outcomes: ['Yes', 'No'], clobTokenIds: ['1', '2'] },
              { question: 'Q2', outcomes: ['Yes', 'No'], clobTokenIds: ['3', '4'] },
            ],
          },
        ],
      };
      const markets = extractMarkets(root);
      expect(markets).toHaveLength(2);
      expect(question(markets[0])).toBe('Q1');
    });
  });
});
