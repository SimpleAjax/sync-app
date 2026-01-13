import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        const { userId, subscription } = await request.json();

        if (!userId || !subscription) {
            return NextResponse.json(
                { error: 'Missing userId or subscription' },
                { status: 400 }
            );
        }

        // Store subscription in Firestore
        // For simplicity, we'll store in a users collection
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        // Use setDoc with merge: true to handle both create and update
        await setDoc(userRef, {
            userId,
            pushSubscription: subscription,
            notificationsEnabled: true,
            updatedAt: new Date().toISOString(),
            ...(userSnap.exists() ? {} : { createdAt: new Date().toISOString() })
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}
