import SignUp from '../models/SignUp.js';

export async function getLeaderboard(req, res) {
  try {
    const { scope, page = 1, limit = 50 } = req.query; // 'global' or 'friends'
    const currentUser = await SignUp.findById(req.userId);

    let query = {};
    if (scope === 'friends' && currentUser) {
      const friendIds = [...currentUser.friends, currentUser._id];
      query = { _id: { $in: friendIds } };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await SignUp.countDocuments(query);

    const leaderboard = await SignUp.find(query)
      .select('username avatar level xp title isPremium badges')
      .sort({ xp: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedLeaderboard = leaderboard.map((user, index) => {
      let rankBadge = `${index + 1 + skip}`;
      if (index + skip === 0) rankBadge = '🥇 Gold';
      else if (index + skip === 1) rankBadge = '🥈 Silver';
      else if (index + skip === 2) rankBadge = '🥉 Bronze';

      return {
        rank: index + 1 + skip,
        rankDisplay: rankBadge,
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        title: user.title,
        badgeCount: user.badges.length,
        isPremium: user.isPremium,
        isCurrentUser: user._id.toString() === req.userId
      };
    });

    res.json({
      data: formattedLeaderboard,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard.', error: error.message });
  }
}
