const offlineSyncService = require('../services/offlineSyncService');

exports.syncProgress = async (req, res) => {
  try {
    const { attempts } = req.body;
    if (!attempts || !Array.isArray(attempts)) {
      return res.status(400).json({ message: 'Attempts array is required for synchronization' });
    }

    const result = await offlineSyncService.syncBatchAttempts(req.user._id, attempts);
    res.json(result);
  } catch (error) {
    console.error('Sync progress error:', error);
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
};
