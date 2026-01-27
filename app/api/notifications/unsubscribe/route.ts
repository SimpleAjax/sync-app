import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        const { userId, subscription } = await request.json(); // Get userId and subscription

        // Remove subscription from Firestore
        const { arrayRemove } = await import('firebase/firestore');
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            subscriptions: arrayRemove(subscription),
            // We don't disable notifications globally anymore just because one device unsubscribed
            // unless we want to check if the array is empty, but for now let's keep it simple.
            // If they want to fully disable, they might toggle a switch in UI which calls a different endpoint or we check here.
            // For now, let's assume if they click "Disable" in UI, it calls this for the current device.
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}
