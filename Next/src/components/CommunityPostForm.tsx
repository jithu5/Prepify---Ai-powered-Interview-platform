import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { Textarea } from './ui/textarea';
import { Loader2, Upload, X } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onClose: () => void;
    refetchPosts: () => void; // 👈 Accept it
}

interface CommunityPostFormData {
    question: string;
    answer: string;
    tags: string[];
}


function CommunityPostForm({ open, onClose,refetchPosts }: Props) {
    const { handleSubmit, register, reset, setValue, formState: { isSubmitting, errors } } = useForm<CommunityPostFormData>();
    const [tagValue, setTagValue] = useState<string>('');
    const [tagLists, setTagLists] = useState<string[]>([]);

    const addTagList = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagValue.trim()) {
            e.preventDefault();
            const tag = tagValue.trim();
            if (!tagLists.includes(tag)) {
                const updated = [tag,...tagLists];
                setTagLists(updated);
                setValue('tags', updated);
            }
            setTagValue('');
        }
    };

    const removeTag = (tag: string) => {
        const updatedTagList = tagLists.filter(t => t !== tag);
        setTagLists(updatedTagList);
        setValue('tags', updatedTagList);
    };

    const onSubmit = async (formData: CommunityPostFormData) => {
        console.log(formData);
        try {
            const {data}= await axios.post("/api/create-post",formData,{
                headers:{'Content-Type':'application/json'},
                withCredentials:true
            })
            if (data.success) {
                toast.success(data.message)
                refetchPosts(); // 👈 Refresh posts
                onClose(); // 👈 Also close the modal
                reset();   // 👈 Optional: Reset form
                setTagLists([]); // 👈 Optional: Reset tags
                return
            }
            toast.error(data.message)
        } catch (err:AxiosError|unknown) {
            if (axios.isAxiosError(err)) {

                const errMsg = err?.response?.data?.message;
                toast.error(errMsg);
            } else {
                toast.error("Server error in submitting")
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[850px] h-auto p-6 rounded-2xl shadow-lg">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-3xl text-center font-bold">Create a Post</DialogTitle>
                    <DialogDescription className="text-stone-700 text-md font-medium text-center max-w-sm mx-auto">
                        Share your question and answer with the community.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Question */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="question" className="text-md font-medium">
                            Your Question
                        </Label>
                        <Textarea
                            {...register('question', { required: true })}
                            placeholder="Type your question here..."
                            className="resize-none h-28 focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.question && (
                            <span className="text-red-500 text-sm">Question is required.</span>
                        )}
                    </div>

                    {/* Answer */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="answer" className="text-md font-medium">
                            Your Answer
                        </Label>
                        <Textarea
                            {...register('answer', { required: true, maxLength: 450 })}
                            placeholder="Type your answer here..."
                            className="resize-none h-40 focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.answer && (
                            <span className="text-red-500 text-sm">Answer is required (Max 450 characters).</span>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="tags" className="text-md font-medium">
                            Tags
                        </Label>
                        <Input
                            type="text"
                            value={tagValue}
                            onChange={(e) => setTagValue(e.target.value)}
                            onKeyDown={addTagList}
                            placeholder="Press Enter to add tags (e.g., React, TypeScript)"
                            className="focus:ring-2 focus:ring-blue-400"
                        />

                        {/* Tags List */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tagLists.map((tag, index) => (
                                <span
                                    key={index}
                                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm gap-1"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} className="cursor-pointer" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <DialogFooter className="mt-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant={'default'}
                            className="w-full cursor-pointer text-white font-semibold py-3 rounded-lg transition-all"
                        >
                            {isSubmitting ? (<div className='w-full flex justify-center items-center gap-2'>
                                Posting...<Loader2 className='animate-spin' />
                            </div>) : (
                                <div className='w-full flex justify-center items-center gap-2'>
                                    Post <Upload />
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CommunityPostForm;
