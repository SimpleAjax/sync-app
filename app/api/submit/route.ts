import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubmitAnswerRequest, OptionId, UserId } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: SubmitAnswerRequest = await request.json();
        const { date, userId, answer, guess } = body;

        // Validate inputs
        if (!date || !userId || !answer || !guess) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Map friendly userIds to database fields
        const incomingUserId = userId as string;
        let dbUserId = incomingUserId;
        if (incomingUserId === 'ajay') dbUserId = 'p1';
        if (incomingUserId === 'akansha') dbUserId = 'p2';

        if (!['p1', 'p2'].includes(dbUserId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        if (!['A', 'B', 'C'].includes(answer) || !['A', 'B', 'C'].includes(guess)) {
            return NextResponse.json(
                { error: 'Invalid answer or guess' },
                { status: 400 }
            );
        }

        // Get the daily round document
        const docRef = doc(db, 'daily_rounds', date);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return NextResponse.json(
                { error: 'Daily round not found' },
                { status: 404 }
            );
        }

        const data = snapshot.data();

        // Check if user has already submitted
        if (data[`${dbUserId}_status`] === true) {
            return NextResponse.json(
                { error: 'You have already submitted your answers' },
                { status: 400 }
            );
        }

        // Update with user's answers
        const updates: any = {
            [`${dbUserId}_answer`]: answer,
            [`${dbUserId}_guess`]: guess,
            [`${dbUserId}_status`]: true,
        };

        // Check if partner has already submitted
        const partnerDbId = dbUserId === 'p1' ? 'p2' : 'p1';
        const partnerStatus = data[`${partnerDbId}_status`];

        if (partnerStatus) {
            // Both have submitted! Calculate score
            const p1_answer = dbUserId === 'p1' ? answer : data.p1_answer;
            const p2_answer = dbUserId === 'p2' ? answer : data.p2_answer;
            const p1_guess = dbUserId === 'p1' ? guess : data.p1_guess;
            const p2_guess = dbUserId === 'p2' ? guess : data.p2_guess;

            const p1_correct = p1_guess === p2_answer;
            const p2_correct = p2_guess === p1_answer;

            let points = 0;
            if (p1_correct && p2_correct) {
                points = 2; // Perfect Sync
            } else if (p1_correct || p2_correct) {
                points = 1; // Partial Sync
            }

            updates.points_earned = points;
            updates.status = 'completed';
            updates.completed_at = serverTimestamp();

            // TODO: Send notification to partner about results
        } else {
            // Partner hasn't submitted yet
            // TODO: Send notification to partner to complete their answers
        }

        // Update Firestore
        await updateDoc(docRef, updates);

        return NextResponse.json({
            success: true,
            both_completed: partnerStatus === true,
            points_earned: updates.points_earned,
        });

    } catch (error) {
        console.error('Submit API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
