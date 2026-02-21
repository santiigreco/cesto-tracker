import confetti from 'canvas-confetti';

export const triggerVibration = (duration: number = 50) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
    }
};

export const triggerGoalConfetti = () => {
    const duration = 500; // Much shorter duration
    const end = Date.now() + duration;

    const frame = () => {
        confetti({
            particleCount: 3, // Fewer particles
            angle: 60,
            spread: 40, // Narrower spread
            origin: { x: 0, y: 0.8 }, // Start lower
            colors: ['#06b6d4', '#10b981', '#ffffff'],
            scalar: 0.6 // Smaller confetti pieces
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 40,
            origin: { x: 1, y: 0.8 },
            colors: ['#06b6d4', '#10b981', '#ffffff'],
            scalar: 0.6
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };

    frame();
};

export const handleActionFeedback = (action: string | boolean) => {
    // Vibrate on any action
    triggerVibration(50);
    
    // Confetti on positive scoring actions
    if (action === 'goles' || action === 'triples' || action === true) {
        triggerGoalConfetti();
    }
};
