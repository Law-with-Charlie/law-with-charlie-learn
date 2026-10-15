type Question = {
  id: number;
  topic_id: number;
};

type Attempt = {
  question_id: number;
  correct: boolean;
  created_at: string;
};

export function selectPracticeQuestions(
  questions: Question[],
  attempts: Attempt[],
  questionsPerSession: number
) {
  if (questions.length <= questionsPerSession) {
    return questions;
  }

  /*
   * Because attempts are expected to be supplied
   * newest-first, the first attempt we encounter
   * for each question is its latest result.
   */
  const latestAttempts = new Map<number, Attempt>();

  for (const attempt of attempts) {
    if (!latestAttempts.has(attempt.question_id)) {
      latestAttempts.set(attempt.question_id, attempt);
    }
  }

  const incorrect: Question[] = [];
  const unanswered: Question[] = [];
  const correct: Question[] = [];

  for (const question of questions) {
    const latestAttempt =
      latestAttempts.get(question.id);

    if (!latestAttempt) {
      unanswered.push(question);
    } else if (!latestAttempt.correct) {
      incorrect.push(question);
    } else {
      correct.push(question);
    }
  }

  /*
   * Shuffle each group so that repeated sessions
   * do not always produce exactly the same order.
   */
  const shuffle = <T,>(items: T[]) => {
    return [...items].sort(
      () => Math.random() - 0.5
    );
  };

  const selected: Question[] = [];

  for (const question of shuffle(incorrect)) {
    if (selected.length >= questionsPerSession) {
      break;
    }

    selected.push(question);
  }

  for (const question of shuffle(unanswered)) {
    if (selected.length >= questionsPerSession) {
      break;
    }

    selected.push(question);
  }

  for (const question of shuffle(correct)) {
    if (selected.length >= questionsPerSession) {
      break;
    }

    selected.push(question);
  }

  return selected;
}