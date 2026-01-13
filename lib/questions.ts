import { Question } from '@/types';
import questionsData from '@/data/questions.json';

/**
 * Get the question for a specific day number (1-365)
 * Questions cycle through: after day 365, it goes back to day 1
 */
export function getQuestionForDay(dayNumber: number): Question {
    // Ensure dayNumber is between 1-365
    const normalizedDay = ((dayNumber - 1) % 365) + 1;

    // Since we only have 10 questions now, cycle through them
    const totalQuestions = questionsData.length;
    const questionIndex = ((normalizedDay - 1) % totalQuestions);

    return questionsData[questionIndex] as Question;
}

/**
 * Calculate day number from a date
 * Day 1 = January 1st of current year
 */
export function getDayNumberFromDate(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay) + 1;
    return dayOfYear;
}

/**
 * Get today's question
 */
export function getTodaysQuestion(): Question {
    const today = new Date();
    const dayNumber = getDayNumberFromDate(today);
    return getQuestionForDay(dayNumber);
}

/**
 * Get question by date string (YYYY-MM-DD)
 */
export function getQuestionByDate(dateString: string): Question {
    const date = new Date(dateString);
    const dayNumber = getDayNumberFromDate(date);
    return getQuestionForDay(dayNumber);
}

/**
 * Get today's date in YYYY-MM-DD format (for Firestore document ID)
 */
export function getTodayDateString(): string {
    const today = new Date();
    return formatDateString(today);
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
