import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import webPush from 'web-push';
import { getTodayDateString } from '@/lib/questions';

export async function POST(request: NextRequest) {
    console.log('=== Test notification route called ===');

    try {
        // Configure web-push with VAPID keys (moved inside function to avoid module-level errors)
        if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webPush.setVapidDetails(
                'mailto:support@sync-app.com',
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            );
        }

        const { userId } = await request.json();
        console.log('userId:', userId);

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Get user's push subscription from Firestore
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userSnap.data();
        // Support both new array format and legacy single object
        let subscriptions = userData.subscriptions || [];
        if (userData.pushSubscription && subscriptions.length === 0) {
            subscriptions = [userData.pushSubscription];
        }

        if (subscriptions.length === 0) {
            console.log('No subscription found for user:', userId);
            return NextResponse.json(
                { error: 'No push subscriptions found' },
                { status: 404 }
            );
        }

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

        console.log(`Sending notification to ${subscriptions.length} devices for ${userName}`);

        const { updateDoc, arrayRemove } = await import('firebase/firestore');

        const results = await Promise.allSettled(
            subscriptions.map((sub: any) =>
                webPush.sendNotification(sub, payload)
                    .catch(async (err) => {
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            // Subscription invalid/gone, remove it
                            console.log('Removing expired subscription');
                            await updateDoc(userRef, {
                                subscriptions: arrayRemove(sub)
                            });
                        }
                        throw err;
                    })
            )
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Successfully sent ${successCount} notifications`);

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
