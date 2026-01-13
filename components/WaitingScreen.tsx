'use client';

interface WaitingScreenProps {
    partnerName: string;
}

export default function WaitingScreen({ partnerName }: WaitingScreenProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                {/* Animated Hourglass */}
                <div className="mb-8 animate-bounce">
                    <div className="text-8xl">⏳</div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Waiting for {partnerName}...
                </h1>

                {/* Message */}
                <p className="text-lg text-gray-600 mb-8">
                    You've submitted your answers! 🎉
                    <br />
                    <br />
                    We'll notify you as soon as {partnerName} finishes.
                </p>

                {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        <span className="font-semibold">💡 Did you know?</span>
                        <br />
                        The results will appear automatically when both of you have answered. No need to refresh!
                    </p>
                </div>

                {/* Pulsing Dots */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
}
