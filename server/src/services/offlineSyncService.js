const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const quizEvaluationService = require('./quizEvaluationService');

class OfflineSyncService {
  async syncBatchAttempts(userId, attempts = []) {
    const syncedIds = [];
    const errors = [];

    for (const item of attempts) {
      try {
        const { quizId, answers, tempId } = item;

        // Check if already synced using offlineTempId
        if (tempId) {
          const existing = await QuizAttempt.findOne({ offlineTempId: tempId });
          if (existing) {
            syncedIds.push(tempId);
            continue;
          }
        }

        const quiz = await Quiz.findById(quizId).populate('subject');
        if (!quiz) {
          errors.push({ tempId, error: 'Quiz not found on server' });
          continue;
        }

        await quizEvaluationService.evaluateQuizAttempt({
          userId,
          quiz,
          submittedAnswers: answers,
          isOffline: true,
          offlineTempId: tempId,
        });

        syncedIds.push(tempId);
      } catch (err) {
        errors.push({ tempId: item.tempId, error: err.message });
      }
    }

    return {
      success: true,
      syncedCount: syncedIds.length,
      syncedIds,
      errors,
    };
  }
}

module.exports = new OfflineSyncService();
