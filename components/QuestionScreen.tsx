'use client';

import { useState } from 'react';
import { Option, OptionId } from '@/types';

interface QuestionScreenProps {
    question: string;
    options: Option[];
    onSubmit: (answer: OptionId, guess: OptionId) => Promise<void>;
}

export default function QuestionScreen({ question, options, onSubmit }: QuestionScreenProps) {
    const [myAnswer, setMyAnswer] = useState<OptionId | null>(null);
    const [myGuess, setMyGuess] = useState<OptionId | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!myAnswer) {
            setError('Please select your answer');
            return;
        }
        if (!myGuess) {
            setError('Please guess your partner\'s answer');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await onSubmit(myAnswer, myGuess);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit');
            setSubmitting(false);
        }
    };

    const OptionButton = ({ option, selected, onClick }: {
        option: Option;
        selected: boolean;
        onClick: () => void;
    }) => (
        <button
            onClick={onClick}
            className={`
        w-full p-4 rounded-xl text-left transition-all duration-200
        ${selected
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-200'}
        font-medium
      `}
        >
            <span className="font-bold mr-2">{option.id}.</span>
            {option.text}
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 flex flex-col">
            {/* Header */}
            <div className="text-center mb-8 mt-4">
                <div className="inline-block bg-white px-6 py-2 rounded-full shadow-md mb-4">
                    <span className="text-2xl">🎮</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Today's Sync
                </h1>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                    {question}
                </p>
            </div>

            {/* My Answer Section */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🤔</span>
                    What's YOUR answer?
                </h2>
                <div className="space-y-3">
                    {options.map((option) => (
                        <OptionButton
                            key={option.id}
                            option={option}
                            selected={myAnswer === option.id}
                            onClick={() => setMyAnswer(option.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Partner Guess Section */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
                    <span className="text-2xl mr-2">💭</span>
                    What will your PARTNER answer?
                </h2>
                <div className="space-y-3">
                    {options.map((option) => (
                        <OptionButton
                            key={option.id}
                            option={option}
                            selected={myGuess === option.id}
                            onClick={() => setMyGuess(option.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!myAnswer || !myGuess || submitting}
                className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
          ${myAnswer && myGuess && !submitting
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
        `}
            >
                {submitting ? 'Submitting...' : 'Submit Answers'}
            </button>

            {/* Helper Text */}
            <p className="text-center text-sm text-gray-500 mt-4">
                Your partner is answering the same question right now! 🤝
            </p>
        </div>
    );
}
