import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import webPush from 'web-push';
import { getTodayDateString, getTodaysQuestion } from '@/lib/questions';

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        'mailto:support@sync-app.com',
        process.env.VAPID_PUBLIC_KEY,
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

        usersSnap.forEach((doc) => {
            const userData = doc.data();
            if (userData.notificationsEnabled && userData.pushSubscription) {
                const userId = doc.id;
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

                const notificationPromise = webPush
                    .sendNotification(userData.pushSubscription, payload)
                    .then(() => {
                        results.sent++;
                        results.users.push(userName);
                    })
                    .catch((error) => {
                        console.error(`Failed to send notification to ${userName}:`, error);
                        results.failed++;
                    });

                notifications.push(notificationPromise);
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
