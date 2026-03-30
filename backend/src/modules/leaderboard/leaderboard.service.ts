import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  username?: string;
  pnl: number;
  winrate: number;
  totalBets: number;
  wins: number;
  losses: number;
  duelWins: number;
  duelLosses: number;
  xp: number;
  level: number;
  streak: number;
  badges?: string[];
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: number;
  userEntry?: LeaderboardEntry;
  total: number;
  period: string;
  sortBy: string;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  
  // Simple in-memory cache with TTL
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  constructor(
    @InjectConnection() private connection: Connection,
  ) {}

  private get usersCollection() {
    return this.connection.collection('users');
  }

  private get positionsCollection() {
    return this.connection.collection('positions');
  }

  private get duelsCollection() {
    return this.connection.collection('duels');
  }

  private get userStatsCollection() {
    return this.connection.collection('user_stats');
  }

  /**
   * Get leaderboard with different types
   * @param type - 'global' | 'weekly' | 'profit' | 'duels' | 'xp'
   * @param limit - number of entries
   * @param userWallet - optional wallet to get user's position
   */
  async getLeaderboard(
    type: 'global' | 'weekly' | 'profit' | 'duels' | 'xp' = 'global',
    limit: number = 20,
    userWallet?: string,
  ): Promise<LeaderboardResponse> {
    const normalizedWallet = userWallet?.toLowerCase();
    const cacheKey = `leaderboard_${type}_${limit}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      const result = cached.data as LeaderboardResponse;
      // Still need to find user position if requested
      if (normalizedWallet) {
        const userEntry = result.entries.find(e => e.wallet === normalizedWallet);
        if (userEntry) {
          result.userRank = userEntry.rank;
          result.userEntry = userEntry;
        }
      }
      return result;
    }

    let entries: LeaderboardEntry[] = [];
    let sortBy = 'pnl';

    switch (type) {
      case 'global':
      case 'profit':
        entries = await this.getProfitLeaderboard(limit);
        sortBy = 'pnl';
        break;
      case 'weekly':
        entries = await this.getWeeklyLeaderboard(limit);
        sortBy = 'weeklyPnl';
        break;
      case 'duels':
        entries = await this.getDuelsLeaderboard(limit);
        sortBy = 'duelWins';
        break;
      case 'xp':
        entries = await this.getXpLeaderboard(limit);
        sortBy = 'xp';
        break;
    }

    // Find user's position if wallet provided
    let userRank: number | undefined;
    let userEntry: LeaderboardEntry | undefined;

    if (normalizedWallet) {
      // Check if user is in top entries
      const inTop = entries.find(e => e.wallet === normalizedWallet);
      if (inTop) {
        userRank = inTop.rank;
        userEntry = inTop;
      } else {
        // Get user's actual position
        userEntry = await this.getUserStats(normalizedWallet);
        if (userEntry) {
          userRank = await this.getUserRank(normalizedWallet, type);
          userEntry.rank = userRank;
        }
      }
    }

    const result = {
      entries,
      userRank,
      userEntry,
      total: entries.length,
      period: type === 'weekly' ? 'This Week' : 'All Time',
      sortBy,
    };
    
    // Store in cache
    this.cache.set(cacheKey, { data: result, expiry: Date.now() + this.CACHE_TTL });

    return result;
  }

  /**
   * Get profit-based leaderboard (all time) - OPTIMIZED
   */
  private async getProfitLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    // Aggregate positions to get PnL per wallet with all data in single query
    const pipeline = [
      {
        $match: {
          status: { $in: ['won', 'lost', 'claimed'] },
        },
      },
      {
        $group: {
          _id: '$wallet',
          totalPnl: { $sum: '$profit' },
          totalBets: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
          claimed: { $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          winrate: {
            $cond: [
              { $gt: [{ $add: ['$wins', '$losses'] }, 0] },
              { $multiply: [{ $divide: ['$wins', { $add: ['$wins', '$losses'] }] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { totalPnl: -1 } },
      { $limit: limit },
    ];

    const results = await this.positionsCollection.aggregate(pipeline).toArray();
    
    // Get all wallets for bulk fetch
    const wallets = results.map(r => r._id);
    
    // Fetch XP stats and duel stats in parallel for all wallets
    const [xpStatsArray, duelStatsArray] = await Promise.all([
      this.userStatsCollection.find({ wallet: { $in: wallets } }).toArray(),
      this.duelsCollection.aggregate([
        {
          $match: {
            status: 'finished',
            $or: [
              { winnerWallet: { $in: wallets } },
              { creatorWallet: { $in: wallets } },
              { opponentWallet: { $in: wallets } },
            ],
          },
        },
        {
          $facet: {
            wins: [
              { $match: { winnerWallet: { $in: wallets } } },
              { $group: { _id: '$winnerWallet', count: { $sum: 1 } } },
            ],
            total: [
              {
                $group: {
                  _id: null,
                  participants: {
                    $push: {
                      $cond: [
                        { $in: ['$creatorWallet', wallets] },
                        '$creatorWallet',
                        '$opponentWallet',
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ]).toArray(),
    ]);

    // Build lookup maps
    const xpMap = new Map(xpStatsArray.map(x => [x.wallet, x]));
    const duelWinsMap = new Map<string, number>(
      (duelStatsArray[0]?.wins || []).map((d: any) => [d._id, d.count as number])
    );

    // Build entries
    const entries: LeaderboardEntry[] = results.map((result, index) => {
      const wallet = result._id;
      const xpStats = xpMap.get(wallet);
      const duelWins: number = duelWinsMap.get(wallet) || 0;

      return {
        rank: index + 1,
        wallet,
        pnl: Math.round(result.totalPnl * 100) / 100,
        winrate: Math.round(result.winrate),
        totalBets: result.totalBets,
        wins: result.wins + result.claimed,
        losses: result.losses,
        duelWins,
        duelLosses: 0,
        xp: xpStats?.xp || 0,
        level: xpStats?.level || 1,
        streak: xpStats?.currentStreak || 0,
        badges: xpStats?.badges || [],
      };
    });

    return entries;
  }

  /**
   * Get weekly leaderboard (last 7 days) - OPTIMIZED
   */
  private async getWeeklyLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const pipeline = [
      {
        $match: {
          status: { $in: ['won', 'lost', 'claimed'] },
          resolvedAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: '$wallet',
          totalPnl: { $sum: '$profit' },
          totalBets: { $sum: 1 },
          wins: { $sum: { $cond: [{ $in: ['$status', ['won', 'claimed']] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          winrate: {
            $cond: [
              { $gt: [{ $add: ['$wins', '$losses'] }, 0] },
              { $multiply: [{ $divide: ['$wins', { $add: ['$wins', '$losses'] }] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { totalPnl: -1 } },
      { $limit: limit },
    ];

    const results = await this.positionsCollection.aggregate(pipeline).toArray();
    const wallets = results.map(r => r._id);

    // Parallel fetch
    const [xpStatsArray, duelWinsArray] = await Promise.all([
      this.userStatsCollection.find({ wallet: { $in: wallets } }).toArray(),
      this.duelsCollection.aggregate([
        { $match: { status: 'finished', winnerWallet: { $in: wallets } } },
        { $group: { _id: '$winnerWallet', count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    const xpMap = new Map(xpStatsArray.map(x => [x.wallet, x]));
    const duelWinsMap = new Map(duelWinsArray.map((d: any) => [d._id, d.count]));

    return results.map((result, index) => {
      const wallet = result._id;
      const xpStats = xpMap.get(wallet);

      return {
        rank: index + 1,
        wallet,
        pnl: Math.round(result.totalPnl * 100) / 100,
        winrate: Math.round(result.winrate),
        totalBets: result.totalBets,
        wins: result.wins,
        losses: result.losses,
        duelWins: duelWinsMap.get(wallet) || 0,
        duelLosses: 0,
        xp: xpStats?.xp || 0,
        level: xpStats?.level || 1,
        streak: xpStats?.currentStreak || 0,
      };
    });
  }

  /**
   * Get duels leaderboard - OPTIMIZED
   */
  private async getDuelsLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const pipeline = [
      {
        $match: {
          status: 'finished',
          winnerWallet: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$winnerWallet',
          duelWins: { $sum: 1 },
        },
      },
      { $sort: { duelWins: -1 } },
      { $limit: limit },
    ];

    const results = await this.duelsCollection.aggregate(pipeline).toArray();
    
    if (results.length === 0) return [];

    const wallets = results.map(r => r._id);

    // Parallel fetch
    const [xpStatsArray, positionStatsArray] = await Promise.all([
      this.userStatsCollection.find({ wallet: { $in: wallets } }).toArray(),
      this.positionsCollection.aggregate([
        { $match: { wallet: { $in: wallets }, status: { $in: ['won', 'lost', 'claimed'] } } },
        {
          $group: {
            _id: '$wallet',
            totalPnl: { $sum: '$profit' },
            totalBets: { $sum: 1 },
            wins: { $sum: { $cond: [{ $in: ['$status', ['won', 'claimed']] }, 1, 0] } },
            losses: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
          },
        },
      ]).toArray(),
    ]);

    const xpMap = new Map(xpStatsArray.map(x => [x.wallet, x]));
    const positionMap = new Map(positionStatsArray.map(p => [p._id, p]));

    return results.map((result, index) => {
      const wallet = result._id;
      const xpStats = xpMap.get(wallet);
      const posStats = positionMap.get(wallet) || { totalPnl: 0, totalBets: 0, wins: 0, losses: 0 };
      const totalDecided = posStats.wins + posStats.losses;
      const winrate = totalDecided > 0 ? (posStats.wins / totalDecided) * 100 : 0;

      return {
        rank: index + 1,
        wallet,
        pnl: Math.round((posStats.totalPnl || 0) * 100) / 100,
        winrate: Math.round(winrate),
        totalBets: posStats.totalBets,
        wins: posStats.wins,
        losses: posStats.losses,
        duelWins: result.duelWins,
        duelLosses: 0,
        xp: xpStats?.xp || 0,
        level: xpStats?.level || 1,
        streak: xpStats?.currentStreak || 0,
      };
    });
  }

  /**
   * Get XP leaderboard - OPTIMIZED
   */
  private async getXpLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const users = await this.userStatsCollection
      .find({})
      .sort({ xp: -1 })
      .limit(limit)
      .toArray();

    if (users.length === 0) return [];

    const wallets = users.map(u => u.wallet);

    // Parallel fetch position stats and duel stats
    const [positionStatsArray, duelWinsArray] = await Promise.all([
      this.positionsCollection.aggregate([
        { $match: { wallet: { $in: wallets }, status: { $in: ['won', 'lost', 'claimed'] } } },
        {
          $group: {
            _id: '$wallet',
            totalPnl: { $sum: '$profit' },
            totalBets: { $sum: 1 },
            wins: { $sum: { $cond: [{ $in: ['$status', ['won', 'claimed']] }, 1, 0] } },
            losses: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
          },
        },
      ]).toArray(),
      this.duelsCollection.aggregate([
        { $match: { status: 'finished', winnerWallet: { $in: wallets } } },
        { $group: { _id: '$winnerWallet', count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    const positionMap = new Map(positionStatsArray.map(p => [p._id, p]));
    const duelWinsMap = new Map(duelWinsArray.map((d: any) => [d._id, d.count]));

    return users.map((user, index) => {
      const wallet = user.wallet;
      const posStats = positionMap.get(wallet) || { totalPnl: 0, totalBets: 0, wins: 0, losses: 0 };
      const totalDecided = posStats.wins + posStats.losses;
      const winrate = totalDecided > 0 ? (posStats.wins / totalDecided) * 100 : 0;

      return {
        rank: index + 1,
        wallet,
        pnl: Math.round((posStats.totalPnl || 0) * 100) / 100,
        winrate: Math.round(winrate),
        totalBets: user.totalBets || posStats.totalBets,
        wins: user.totalWins || posStats.wins,
        losses: user.totalLosses || posStats.losses,
        duelWins: duelWinsMap.get(wallet) || 0,
        duelLosses: 0,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.currentStreak || 0,
        badges: user.badges || [],
      };
    });
  }

  /**
   * Get duel stats for a wallet
   */
  private async getDuelStats(wallet: string): Promise<{ wins: number; losses: number }> {
    const wins = await this.duelsCollection.countDocuments({
      winnerWallet: wallet,
      status: 'finished',
    });

    const totalDuels = await this.duelsCollection.countDocuments({
      $or: [
        { creatorWallet: wallet },
        { opponentWallet: wallet },
      ],
      status: 'finished',
    });

    return {
      wins,
      losses: totalDuels - wins,
    };
  }

  /**
   * Get position stats for a wallet
   */
  private async getPositionStats(wallet: string): Promise<{
    pnl: number;
    winrate: number;
    totalBets: number;
    wins: number;
    losses: number;
  }> {
    const pipeline = [
      {
        $match: {
          wallet,
          status: { $in: ['won', 'lost', 'claimed'] },
        },
      },
      {
        $group: {
          _id: null,
          totalPnl: { $sum: '$profit' },
          totalBets: { $sum: 1 },
          wins: { $sum: { $cond: [{ $in: ['$status', ['won', 'claimed']] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
        },
      },
    ];

    const results = await this.positionsCollection.aggregate(pipeline).toArray();
    const result = results[0] || { totalPnl: 0, totalBets: 0, wins: 0, losses: 0 };

    const totalDecided = result.wins + result.losses;
    const winrate = totalDecided > 0 ? (result.wins / totalDecided) * 100 : 0;

    return {
      pnl: Math.round(result.totalPnl * 100) / 100,
      winrate: Math.round(winrate),
      totalBets: result.totalBets,
      wins: result.wins,
      losses: result.losses,
    };
  }

  /**
   * Get user stats for leaderboard entry
   */
  private async getUserStats(wallet: string): Promise<LeaderboardEntry | null> {
    const xpStats = await this.userStatsCollection.findOne({ wallet });
    const duelStats = await this.getDuelStats(wallet);
    const positionStats = await this.getPositionStats(wallet);

    if (!xpStats && positionStats.totalBets === 0) {
      return null;
    }

    return {
      rank: 0, // Will be set by caller
      wallet,
      pnl: positionStats.pnl,
      winrate: positionStats.winrate,
      totalBets: positionStats.totalBets,
      wins: positionStats.wins,
      losses: positionStats.losses,
      duelWins: duelStats.wins,
      duelLosses: duelStats.losses,
      xp: xpStats?.xp || 0,
      level: xpStats?.level || 1,
      streak: xpStats?.currentStreak || 0,
      badges: xpStats?.badges || [],
    };
  }

  /**
   * Get user's rank in leaderboard
   */
  private async getUserRank(wallet: string, type: string): Promise<number> {
    const positionStats = await this.getPositionStats(wallet);

    if (type === 'xp') {
      const xpStats = await this.userStatsCollection.findOne({ wallet });
      const xp = xpStats?.xp || 0;
      const higher = await this.userStatsCollection.countDocuments({ xp: { $gt: xp } });
      return higher + 1;
    }

    // For profit-based rankings
    const pipeline = [
      {
        $match: { status: { $in: ['won', 'lost', 'claimed'] } },
      },
      {
        $group: {
          _id: '$wallet',
          totalPnl: { $sum: '$profit' },
        },
      },
      {
        $match: { totalPnl: { $gt: positionStats.pnl } },
      },
      {
        $count: 'higher',
      },
    ];

    const results = await this.positionsCollection.aggregate(pipeline).toArray();
    const higher = results[0]?.higher || 0;

    return higher + 1;
  }
}
