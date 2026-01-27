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
        // We use arrayUnion to add the new subscription to the list without creating duplicates
        const { arrayUnion } = await import('firebase/firestore');

        await setDoc(userRef, {
            userId,
            subscriptions: arrayUnion(subscription), // Store in an array
            // Keep legacy field for a moment or just rely on subscriptions. 
            // Let's update the legacy field to the *latest* one just in case, 
            // but our logic will primarily use 'subscriptions' now.
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
