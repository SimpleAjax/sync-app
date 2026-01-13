'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OptionId } from '@/types';
import confetti from 'canvas-confetti';

interface ResultCardProps {
    question: string;
    p1_answer: OptionId;
    p2_answer: OptionId;
    p1_guess: OptionId;
    p2_guess: OptionId;
    points_earned: number;
    userIsP1: boolean; // To determine which side to show as "You"
}

export default function ResultCard({
    question,
    p1_answer,
    p2_answer,
    p1_guess,
    p2_guess,
    points_earned,
    userIsP1,
}: ResultCardProps) {
    const router = useRouter();

    const p1_correct = p1_guess === p2_answer;
    const p2_correct = p2_guess === p1_answer;

    const yourAnswer = userIsP1 ? p1_answer : p2_answer;
    const partnerAnswer = userIsP1 ? p2_answer : p1_answer;
    const yourGuess = userIsP1 ? p1_guess : p2_guess;
    const partnerGuess = userIsP1 ? p2_guess : p1_guess;
    const youCorrect = userIsP1 ? p1_correct : p2_correct;
    const partnerCorrect = userIsP1 ? p2_correct : p1_correct;

    // Trigger confetti for perfect sync
    useEffect(() => {
        if (points_earned === 2) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#6366f1', '#8b5cf6', '#ec4899'],
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#6366f1', '#8b5cf6', '#ec4899'],
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [points_earned]);

    const getSyncMessage = () => {
        if (points_earned === 2) return { emoji: '🎉', text: 'Perfect Sync!', color: 'text-green-600' };
        if (points_earned === 1) return { emoji: '😊', text: 'Partial Sync', color: 'text-yellow-600' };
        return { emoji: '💭', text: 'No Sync', color: 'text-gray-600' };
    };

    const syncMessage = getSyncMessage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pb-safe">
            {/* Header */}
            <div className="text-center mb-6 mt-4">
                <div className="text-6xl mb-4 animate-bounce-slow">{syncMessage.emoji}</div>
                <h1 className={`text-4xl font-bold ${syncMessage.color} mb-2`}>
                    {syncMessage.text}
                </h1>
                <div className="inline-block bg-white px-6 py-3 rounded-full shadow-lg">
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        +{points_earned} Point{points_earned !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Question Reminder */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Today's Question:</p>
                <p className="text-lg font-semibold text-gray-800">{question}</p>
            </div>

            {/* Results */}
            <div className="space-y-4 mb-6">
                {/* Your Result */}
                <div className="bg-white rounded-2xl shadow-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm font-semibold text-indigo-600">YOU</p>
                            <p className="text-lg font-bold text-gray-800">Answered: {yourAnswer}</p>
                        </div>
                        <div className={`text-3xl ${partnerCorrect ? 'animate-pulse' : ''}`}>
                            {partnerCorrect ? '✅' : '❌'}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        Partner guessed: <span className="font-semibold">{partnerGuess}</span>
                    </p>
                </div>

                {/* Partner Result */}
                <div className="bg-white rounded-2xl shadow-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm font-semibold text-purple-600">PARTNER</p>
                            <p className="text-lg font-bold text-gray-800">Answered: {partnerAnswer}</p>
                        </div>
                        <div className={`text-3xl ${youCorrect ? 'animate-pulse' : ''}`}>
                            {youCorrect ? '✅' : '❌'}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        You guessed: <span className="font-semibold">{yourGuess}</span>
                    </p>
                </div>
            </div>

            {/* Insight Message */}
            <div className={`rounded-2xl p-5 mb-6 ${points_earned === 2 ? 'bg-green-50 border-2 border-green-200' :
                    points_earned === 1 ? 'bg-yellow-50 border-2 border-yellow-200' :
                        'bg-gray-50 border-2 border-gray-200'
                }`}>
                <p className="text-center font-medium text-gray-700">
                    {points_earned === 2 && "You're completely in sync! Perfect teamwork! 🤝"}
                    {points_earned === 1 && "Almost there! Keep learning about each other. 💪"}
                    {points_earned === 0 && "Time for a chat! Talk about this over dinner. 🍽️"}
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button
                    onClick={() => router.push('/progress')}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                    📊 View Progress
                </button>

                <button
                    onClick={() => router.push('/')}
                    className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                    🏠 Back to Home
                </button>
            </div>
        </div>
    );
}
