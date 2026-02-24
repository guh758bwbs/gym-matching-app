// src/utils/matchScore.js

export function calcMatchScore(trainer, learner) {
  let score = 0;
  const details = [];

  // ① 鍛えたい部位 × トレーナーの得意部位
  const muscleMatches = learner.targetMuscles?.filter(
    muscle => trainer.specialties?.includes(muscle)
  ) || [];
  
  const muscleScore = muscleMatches.length * 15;
  score += muscleScore;
  if (muscleScore > 0) {
    details.push(`得意部位が${muscleMatches.length}つ一致 +${muscleScore}点`);
  }

  // ② 同じジム
  if (trainer.gym === learner.gym) {
    score += 25;
    details.push(`同じジム +25点`);
  }

  // ③ 空き曜日の一致
  const dayMatches = learner.availableDays?.filter(
    day => trainer.availableDays?.includes(day)
  ) || [];
  
  const dayScore = dayMatches.length * 8;
  score += dayScore;
  if (dayScore > 0) {
    details.push(`空き曜日が${dayMatches.length}日一致 +${dayScore}点`);
  }

  // ④ 時間帯の一致
  if (trainer.availableTime && trainer.availableTime === learner.availableTime) {
    score += 20;
    details.push(`時間帯が一致 +20点`);
  }

  // ⑤ 指導経験ボーナス
  if (trainer.experience && parseInt(trainer.experience) >= 3) {
    score += 10;
    details.push(`経験豊富なトレーナー +10点`);
  }

  // 相性ランクを判定
  let rank = '';
  if (score >= 70) rank = '🔥 最高の相性！';
  else if (score >= 50) rank = '✨ 相性が良い';
  else if (score >= 30) rank = '👍 まずまず';
  else rank = '🤔 相性は低め';

  return { score, rank, details };
}