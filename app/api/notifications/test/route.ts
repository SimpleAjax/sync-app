import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import webPush from 'web-push';
import { getTodayDateString } from '@/lib/questions';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        'mailto:support@sync-app.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Get user's push subscription from Firestore
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data().pushSubscription) {
            return NextResponse.json(
                { error: 'No push subscription found' },
                { status: 404 }
            );
        }

        const subscription = userSnap.data().pushSubscription;
        const userName = userId === 'ajay' ? 'Ajay' : 'Akansha';
        const today = getTodayDateString();

        const payload = JSON.stringify({
            title: '🎮 Sync - Daily Connection',
            body: `Hey ${userName}! Today's question is ready. Let's see how well you sync! 💖`,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'daily-sync-test',
            data: {
                url: `/daily/${today}?uid=${userId}`,
            },
        });

        await webPush.sendNotification(subscription, payload);

        return NextResponse.json({ success: true, message: 'Test notification sent!' });
    } catch (error: any) {
        console.error('Test notification error:', error);

        // Handle specific errors
        if (error.statusCode === 410) {
            return NextResponse.json(
                { error: 'Push subscription has expired' },
                { status: 410 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to send test notification', details: error.message },
            { status: 500 }
        );
    }
}
