import React from 'react';
import ChatBubble from './ChatBubble';
import { AnimatePresence, motion } from 'framer-motion';

type Response = {
    feedback: string;
    score?: number;
};

type Session = {
    question?: string;
    answer?: string;
    response?: Response;
    id?: string;
};

type Props = {
    session: Session;
    isQuestionLoading?: boolean;
    isFeedbackLoading?: boolean;
};

const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
};

export default function ChatSession({ session, isQuestionLoading, isFeedbackLoading }: Props) {
    return (
        <div className="space-y-4">
            {/* For the Question */}
            <AnimatePresence mode="wait" key={'questionContainer'}>
                {isQuestionLoading && (
                    <motion.div key="questionLoading" {...fadeIn}>
                        <ChatBubble sender="questionPlaceholder" message="Loading question..." />
                    </motion.div>
                )}

                {session.question && (
                    <motion.div key="question" {...fadeIn}>
                        <ChatBubble sender="ai" message={session.question} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* For the Answer */}
            <AnimatePresence mode="wait" key={'answerContainer'}>
                {session.answer && (
                    <motion.div key="answer" {...fadeIn}>
                        <ChatBubble sender="user" message={session.answer} />
                    </motion.div>
                )}

                {!session.answer && !isQuestionLoading && (
                    <motion.div key="waitingAnswer" {...fadeIn}>
                        <ChatBubble sender="placeholder" message="Waiting for your answer..." />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* For the Feedback */}
            <AnimatePresence mode="wait" key={'feedbackContainer'}>
                {isFeedbackLoading && !session.response && (
                    <motion.div key="feedbackLoading" {...fadeIn}>
                        <ChatBubble sender="feedbackPlaceholder" message="AI is analyzing your answer..." />
                    </motion.div>
                )}

                {session.response && (
                    <motion.div key="feedback" {...fadeIn}>
                        <ChatBubble sender="feedback" message={session.response.feedback} />
                    </motion.div>
                )}

                {session.response?.score && (
                    <motion.div key="score" {...fadeIn} className="text-center text-lg text-stone-700">
                        Score: {session.response.score} / 10
                    </motion.div>
                )}
            </AnimatePresence>

            <hr className="border-t border-gray-200 mt-6" />
        </div>
    );
}
