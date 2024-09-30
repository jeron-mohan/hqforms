"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VideoCreatingPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);

    const MAX_RECORDING_TIME = 60; // 60 seconds
    const INITIAL_COUNTDOWN_TIME = 5; // 5 seconds countdown
    const END_COUNTDOWN_TIME = 10; // 10 seconds end countdown
    const ASPECT_RATIO = 16 / 9; // 16:9 aspect ratio

    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, []);

    const startCountdown = (duration: number, onComplete: () => void) => {
        setCountdown(duration);
        const timer = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount === null || prevCount <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return null;
                }
                return prevCount - 1;
            });
        }, 1000);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setRecordedBlob(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = window.setInterval(() => {
                setRecordingTime((prevTime) => {
                    const newTime = prevTime + 1;
                    if (newTime === MAX_RECORDING_TIME - END_COUNTDOWN_TIME) {
                        startCountdown(END_COUNTDOWN_TIME, stopRecording);
                    }
                    if (newTime >= MAX_RECORDING_TIME) {
                        stopRecording();
                        return MAX_RECORDING_TIME;
                    }
                    return newTime;
                });
            }, 1000);

        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsRecording(false);
        setCountdown(null);
    };

    const deleteRecording = () => {
        setRecordedBlob(null);
        setRecordingTime(0);
    };

    const downloadVideo = () => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recorded-video.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    const handleStartRecording = () => {
        startCountdown(INITIAL_COUNTDOWN_TIME, startRecording);
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <CardContent className="p-6">
                    <div className="relative w-full" style={{ paddingTop: `${(1 / ASPECT_RATIO) * 70}%` }}>
                        {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold bg-black bg-opacity-50 text-white z-10">
                                {countdown}
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            autoPlay
                            muted
                            playsInline
                        />
                    </div>
                    <div className="mt-4 flex justify-center space-x-4">
                        <Button onClick={handleStartRecording} disabled={isRecording || countdown !== null}>
                            Record
                        </Button>
                        <Button onClick={stopRecording} disabled={!isRecording}>
                            Stop
                        </Button>
                        <Button onClick={deleteRecording} disabled={!recordedBlob}>
                            Delete
                        </Button>
                        <Button onClick={downloadVideo} disabled={!recordedBlob}>
                            Download
                        </Button>
                    </div>
                    {isRecording && (
                        <div className="mt-2 text-center">
                            Recording Time: {recordingTime}s / {MAX_RECORDING_TIME}s
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="notes">
                <TabsList>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="notes">
                    <Card className='p-5 pt-10'>
                        <CardContent>
                            <ul className="list-disc pl-5">
                                <li>Reduce response times with automations (45% faster first response)</li>
                                <li>Improve self-service options (65% issues resolved without agents)</li>
                                <li>Optimize chatbot performance (40% successful resolution rate)</li>
                                <li>Enhance ticket categorization accuracy (92% accuracy, 15% productivity boost)</li>
                                <li>Maintain high CSAT scores (4.3/5 overall, 4.0/5 for automated interactions)</li>
                                <li>Focus on increasing NPS (currently at 42, trending upward)</li>
                                <li>Continue efforts to lower Customer Effort Score (currently 2.1/5)</li>
                                <li>Bridge the gap between automated (4.0/5) and human (4.5/5) interaction satisfaction</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="preview">
                    <Card>
                        <CardContent>
                            {recordedBlob && (
                                <div className="w-full" style={{ paddingTop: `${(1 / ASPECT_RATIO) * 100}%`, position: 'relative' }}>
                                    <video
                                        src={URL.createObjectURL(recordedBlob)}
                                        controls
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default VideoCreatingPage;