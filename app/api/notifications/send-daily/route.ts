import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import webPush from 'web-push';
import { getTodayDateString, getTodaysQuestion } from '@/lib/questions';

// Configure web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        'mailto:support@sync-app.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(request: NextRequest) {
    try {
        // Verify this is a legitimate cron request
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const today = getTodayDateString();
        const question = getTodaysQuestion();

        // Get all users with push subscriptions
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        const notifications: Promise<any>[] = [];
        const results = {
            sent: 0,
            failed: 0,
            users: [] as string[],
        };

        // Fetch arrayRemove and updateDoc for cleanup
        const { updateDoc, arrayRemove, doc } = await import('firebase/firestore');

        usersSnap.forEach((userDoc) => {
            const userData = userDoc.data();
            const userId = userDoc.id;

            // Get subscriptions (support legacy field)
            let subscriptions = userData.subscriptions || [];
            if (userData.pushSubscription && subscriptions.length === 0) {
                subscriptions = [userData.pushSubscription];
            }

            if (userData.notificationsEnabled && subscriptions.length > 0) {
                const userName = userId === 'ajay' ? 'Ajay' : 'Akansha';

                const payload = JSON.stringify({
                    title: '🎮 Today\'s Sync is Ready!',
                    body: `Hey ${userName}! Time to connect with your partner. Let's see how well you sync today! 💖`,
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    tag: 'daily-sync',
                    requireInteraction: false,
                    data: {
                        url: `/daily/${today}?uid=${userId}`,
                        date: today,
                        questionPreview: question.question_text.substring(0, 50) + '...',
                    },
                });

                // Send to all devices
                subscriptions.forEach((sub: any) => {
                    const notificationPromise = webPush
                        .sendNotification(sub, payload)
                        .then(() => {
                            results.sent++;
                            // Avoid adding same user multiple times to results if they have multiple devices
                            if (!results.users.includes(userName)) {
                                results.users.push(userName);
                            }
                        })
                        .catch(async (error) => {
                            console.error(`Failed to send to device for ${userName}:`, error);
                            results.failed++;

                            if (error.statusCode === 410 || error.statusCode === 404) {
                                console.log(`Removing expired subscription for ${userName}`);
                                const userRef = doc(db, 'users', userId);
                                await updateDoc(userRef, {
                                    subscriptions: arrayRemove(sub)
                                });
                            }
                        });

                    notifications.push(notificationPromise);
                });
            }
        });

        await Promise.allSettled(notifications);

        return NextResponse.json({
            success: true,
            ...results,
            date: today,
            message: `Sent ${results.sent} notifications, ${results.failed} failed`,
        });
    } catch (error) {
        console.error('Send daily notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to send notifications' },
            { status: 500 }
        );
    }
}
