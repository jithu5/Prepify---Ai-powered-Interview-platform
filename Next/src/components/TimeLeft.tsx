
import React, { useEffect, useState } from 'react'

interface Props {
    open: boolean;
    onClose: () => void;
}

function TimeLeft({ open, onClose }: Props) {
    const [timeLeft, setTimeLeft] = useState<number>(120); // 120 seconds = 2 minutes

    // Set an interval to automatically close the dialog after 2 minutes and update the countdown
    useEffect(() => {
        if (!open) return;

        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime === 1) {
                    clearInterval(intervalId);
                    onClose(); // Close the dialog when time runs out
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000); // Update every second

        // Cleanup the interval when the component unmounts or when the dialog is closed
        return () => clearInterval(intervalId);
    }, [open, onClose]);
    return (
        <>

            <div className="mt-4 text-center">
                {/* Countdown Timer Display */}
                <p className="text-lg text-blue-500">
                    Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                </p>
            </div>
        </>
    )
}

export default TimeLeft
