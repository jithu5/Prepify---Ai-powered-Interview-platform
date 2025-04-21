// components/ChatInput.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    answer: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
};

export default function ChatInput({ answer, onChange, onSubmit }: Props) {
    return (
        <div className="fixed bottom-0 w-full left-0 bg-white border-t border-gray-200 px-4 md:px-12 lg:px-48 py-4 flex items-center gap-4">
            <Input
                value={answer}
                onChange={onChange}
                className="flex-1"
                placeholder="Type your answer..."
            />
            <Button onClick={onSubmit}>Send</Button>
        </div>
    );
}
