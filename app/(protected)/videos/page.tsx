"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatSession } from '@/configs/AiModel';
import { Videoprompt } from '@/app/_data/Maindata';
import { VideoProjects } from "@/components/ui/videoProjects";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import VideoTestimonialManager from '@/components/ui/videoTestimonyManager';

const VideoHomepage = () => {
    const [prompt, setPrompt] = useState('');
    const [showTestimonialManager, setShowTestimonialManager] = useState(false);
    const [testimonialData, setTestimonialData] = useState(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitted prompt:', prompt);
        const result = await chatSession.sendMessage(`Provide a JSON structure for: ${prompt}, ${Videoprompt}`);
        const jsonData = JSON.parse(result.response.text());
        setTestimonialData(jsonData);
        setShowTestimonialManager(true);
    };

    if (showTestimonialManager && testimonialData) {
        return <VideoTestimonialManager initialData={testimonialData} />;
    }

    return (
        <div>
            <h2 className="flex items-center justify-center mt-14 font-bold text-[1.55rem]">
                What will you be creating today?
            </h2>
            <div className="flex mt-3 items-center justify-center gap-3">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button>Video Link</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>AI video link creator</AlertDialogTitle>
                        </AlertDialogHeader>
                        <Form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="prompt">Enter your prompt</Label>
                                <Input
                                    id="prompt"
                                    className="mt-1"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Need questions on product feedback"
                                />
                            </div>
                        </Form>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button disabled={true}>Upload Video</Button>
            </div>

            <div className="mt-4">
                <VideoProjects />
            </div>
        </div>
    );
}

export default VideoHomepage;