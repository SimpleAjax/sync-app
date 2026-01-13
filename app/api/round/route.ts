import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getQuestionByDate, getDayNumberFromDate } from '@/lib/questions';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date'); // YYYY-MM-DD format

        if (!date) {
            return NextResponse.json(
                { error: 'Date parameter required' },
                { status: 400 }
            );
        }

        // Check if round already exists
        const docRef = doc(db, 'daily_rounds', date);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            // Return existing round
            return NextResponse.json(snapshot.data());
        }

        // Create new round
        const question = getQuestionByDate(date);
        const dateObj = new Date(date);
        const dayNumber = getDayNumberFromDate(dateObj);

        const newRound = {
            date_id: date,
            day_number: dayNumber,
            question_id: question.id,
            question_text: question.question_text,
            options: question.options,
            p1_answer: null,
            p1_guess: null,
            p1_status: false,
            p2_answer: null,
            p2_guess: null,
            p2_status: false,
            points_earned: 0,
            status: 'pending',
            created_at: serverTimestamp(),
        };

        await setDoc(docRef, newRound);

        return NextResponse.json(newRound);

    } catch (error) {
        console.error('Initialize round error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
