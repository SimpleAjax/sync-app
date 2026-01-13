'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DailyRound } from '@/types';

export default function ProgressPage() {
    const router = useRouter();
    const [rounds, setRounds] = useState<DailyRound[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDays: 0,
        totalPoints: 0,
        perfectSyncs: 0,
        partialSyncs: 0,
        noSyncs: 0,
        averageScore: 0,
    });

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            // Fetch last 30 days of completed rounds
            const q = query(
                collection(db, 'daily_rounds'),
                orderBy('date_id', 'desc'),
                limit(30)
            );

            const snapshot = await getDocs(q);
            const roundsData: DailyRound[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status === 'completed') {
                    roundsData.push({
                        ...data,
                        created_at: data.created_at?.toDate(),
                        completed_at: data.completed_at?.toDate(),
                    } as DailyRound);
                }
            });

            setRounds(roundsData);

            // Calculate stats
            const totalDays = roundsData.length;
            const totalPoints = roundsData.reduce((sum, r) => sum + r.points_earned, 0);
            const perfectSyncs = roundsData.filter(r => r.points_earned === 2).length;
            const partialSyncs = roundsData.filter(r => r.points_earned === 1).length;
            const noSyncs = roundsData.filter(r => r.points_earned === 0).length;
            const averageScore = totalDays > 0 ? (totalPoints / totalDays).toFixed(1) : '0';

            setStats({
                totalDays,
                totalPoints,
                perfectSyncs,
                partialSyncs,
                noSyncs,
                averageScore: parseFloat(averageScore),
            });

            setLoading(false);
        } catch (error) {
            console.error('Error loading progress:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">📊</div>
                    <p className="text-xl text-gray-600">Loading your progress...</p>
                </div>
            </div>
        );
    }

    const syncRate = stats.totalDays > 0
        ? parseFloat(((stats.perfectSyncs / stats.totalDays) * 100).toFixed(0))
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pb-8">
            {/* Header */}
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6 mt-4">
                    <div className="text-6xl mb-4">📊</div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Your Progress
                    </h1>
                    <p className="text-gray-600">See how well you're syncing together!</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Total Points */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                            {stats.totalPoints}
                        </div>
                        <div className="text-sm text-gray-600">Total Points</div>
                    </div>

                    {/* Days Played */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-4xl font-bold text-gray-800 mb-1">
                            {stats.totalDays}
                        </div>
                        <div className="text-sm text-gray-600">Days Played</div>
                    </div>

                    {/* Average Score */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-4xl font-bold text-gray-800 mb-1">
                            {stats.averageScore}
                        </div>
                        <div className="text-sm text-gray-600">Avg Score/Day</div>
                    </div>

                    {/* Sync Rate */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div className="text-4xl font-bold text-green-600 mb-1">
                            {syncRate}%
                        </div>
                        <div className="text-sm text-gray-600">Perfect Sync Rate</div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Score Breakdown</h2>

                    <div className="space-y-3">
                        {/* Perfect Syncs */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">🎉</span>
                                <span className="font-semibold text-gray-700">Perfect Syncs</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-green-600 mr-2">{stats.perfectSyncs}</span>
                                <span className="text-sm text-gray-500">×2 points</span>
                            </div>
                        </div>

                        {/* Partial Syncs */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">😊</span>
                                <span className="font-semibold text-gray-700">Partial Syncs</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-yellow-600 mr-2">{stats.partialSyncs}</span>
                                <span className="text-sm text-gray-500">×1 point</span>
                            </div>
                        </div>

                        {/* No Syncs */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">💭</span>
                                <span className="font-semibold text-gray-700">No Syncs</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-gray-600 mr-2">{stats.noSyncs}</span>
                                <span className="text-sm text-gray-500">×0 points</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent History */}
                {rounds.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Games</h2>
                        <div className="space-y-3">
                            {rounds.slice(0, 10).map((round) => (
                                <div
                                    key={round.date_id}
                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-700">
                                            {new Date(round.date_id).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate mt-1">
                                            {round.question_text}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex items-center">
                                        <span className={`
                      text-2xl font-bold px-4 py-2 rounded-lg
                      ${round.points_earned === 2 ? 'bg-green-100 text-green-600' : ''}
                      ${round.points_earned === 1 ? 'bg-yellow-100 text-yellow-600' : ''}
                      ${round.points_earned === 0 ? 'bg-gray-100 text-gray-600' : ''}
                    `}>
                                            {round.points_earned === 2 ? '🎉' : round.points_earned === 1 ? '😊' : '💭'}
                                        </span>
                                        <span className="ml-2 font-bold text-gray-700">+{round.points_earned}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {rounds.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">🎮</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No games yet!</h3>
                        <p className="text-gray-600 mb-6">
                            Start playing daily to see your progress here.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Play Today's Sync
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                        🏠 Back to Home
                    </button>
                </div>

                {/* Motivational Message */}
                {stats.totalDays > 0 && (
                    <div className="mt-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 text-center">
                        <p className="text-gray-700 font-medium">
                            {syncRate >= 70 && "🌟 Amazing! You two are incredibly in sync!"}
                            {syncRate >= 50 && syncRate < 70 && "🎯 Great work! You're building a strong connection!"}
                            {syncRate >= 30 && syncRate < 50 && "💪 Keep going! You're learning more about each other every day!"}
                            {syncRate < 30 && stats.totalDays > 3 && "💭 Keep playing! Understanding each other takes time!"}
                            {stats.totalDays <= 3 && "🚀 Just getting started! Keep playing to see your progress!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
