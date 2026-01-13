'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DailyRound, UserId, OptionId } from '@/types';
import QuestionScreen from '@/components/QuestionScreen';
import WaitingScreen from '@/components/WaitingScreen';
import ResultCard from '@/components/ResultCard';

export default function DailyQuestionPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const date = params.date as string;
    const userId = (searchParams.get('uid') || 'p1') as UserId;
    const partnerId = userId === 'p1' ? 'p2' : 'p1';

    const [round, setRound] = useState<DailyRound | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Real-time listener to Firestore
    useEffect(() => {
        if (!date) return;

        const docRef = doc(db, 'daily_rounds', date);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setRound({
                        ...data,
                        created_at: data.created_at?.toDate(),
                        completed_at: data.completed_at?.toDate(),
                    } as DailyRound);
                } else {
                    // Document doesn't exist yet - need to initialize
                    setError('Question not ready yet. Please refresh.');
                }
                setLoading(false);
            },
            (err) => {
                console.error('Firestore error:', err);
                setError('Failed to load question. Please try again.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [date]);

    // Handle answer submission
    const handleSubmit = async (answer: OptionId, guess: OptionId) => {
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    userId,
                    answer,
                    guess,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit');
            }

            // Firestore listener will automatically update the UI
        } catch (err) {
            throw err;
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">⏳</div>
                    <p className="text-xl text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !round) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
                    <div className="text-6xl text-center mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Oops!</h1>
                    <p className="text-gray-600 text-center mb-6">{error || 'Something went wrong'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // State machine logic
    const userAnswered = userId === 'p1' ? round.p1_status : round.p2_status;
    const partnerAnswered = partnerId === 'p1' ? round.p1_status : round.p2_status;

    // State 1: User hasn't answered yet
    if (!userAnswered) {
        return (
            <QuestionScreen
                question={round.question_text}
                options={round.options}
                onSubmit={handleSubmit}
            />
        );
    }

    // State 2: User answered, but partner hasn't
    if (userAnswered && !partnerAnswered) {
        return <WaitingScreen partnerName="Your Partner" />;
    }

    // State 3: Both answered - show results
    return (
        <ResultCard
            question={round.question_text}
            p1_answer={round.p1_answer!}
            p2_answer={round.p2_answer!}
            p1_guess={round.p1_guess!}
            p2_guess={round.p2_guess!}
            points_earned={round.points_earned}
            userIsP1={userId === 'p1'}
        />
    );
}
