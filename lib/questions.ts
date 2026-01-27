import { Question } from '@/types';
import questionsData from '@/data/questions.json';

// Game day starts at 8 AM
const GAME_DAY_START_HOUR = 8;

/**
 * Get the logical "Game Date" based on 8 AM cutoff.
 * If strictly before 8 AM, it belongs to the previous calendar day.
 */
export function getGameDate(date: Date = new Date()): Date {
    // Clone date to avoid mutation
    const adjusted = new Date(date.getTime());
    // Subtract 8 hours
    // e.g. Jan 2 07:59 AM -> Jan 1 11:59 PM (Game Day = Jan 1)
    // e.g. Jan 2 08:01 AM -> Jan 2 00:01 AM (Game Day = Jan 2)
    adjusted.setHours(adjusted.getHours() - GAME_DAY_START_HOUR);
    return adjusted;
}

/**
 * Get the question for a specific day number (1-365)
 * Questions cycle through: after day 365, it goes back to day 1
 */
export function getQuestionForDay(dayNumber: number): Question {
    // Ensure dayNumber is between 1-365
    const normalizedDay = ((dayNumber - 1) % 365) + 1;

    // Cycle through available questions
    const totalQuestions = questionsData.length;
    // Use modulo to wrap around if we have fewer than 365 questions
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
 * Get today's question (Game Day starts at 8 AM)
 */
export function getTodaysQuestion(): Question {
    const gameDate = getGameDate(new Date());
    const dayNumber = getDayNumberFromDate(gameDate);
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
 * Get today's logical Game Date string in YYYY-MM-DD format
 * This is used for the Firestore document ID.
 */
export function getTodayDateString(): string {
    const gameDate = getGameDate(new Date());
    return formatDateString(gameDate);
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
