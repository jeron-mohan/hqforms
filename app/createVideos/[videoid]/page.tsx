"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MicIcon, VideoIcon, SkipForward, Redo, DownloadIcon, PauseIcon, PlayIcon, CheckIcon, StopCircleIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from "lucide-react"
StopCircleIcon
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getVideoById } from '@/data/form';
import { Progress } from '@/components/ui/progress';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface VideoFormProps {
    params: {
        videoid: string;
    };
}

interface VideoResponseProps {
    stream: MediaStream | null;
    onComplete: () => void;
    questionData?: any;
}

interface Question {
    id: string;
    question: string;
    duration: number;
    notes: string;
}

const VideoResponse: React.FC<VideoResponseProps> = ({ stream, onComplete, questionData }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'preview'>('idle');
    const [timeLeft, setTimeLeft] = useState(0);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const liveVideoRef = useRef<HTMLVideoElement>(null);
    const recordedVideoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());
    const [isNotesOpen, setIsNotesOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (questionData && questionData.questions) {
            setQuestions(questionData.questions);
        }
    }, [questionData]);

    useEffect(() => {
        if (stream && liveVideoRef.current && !liveVideoRef.current.srcObject) {
            liveVideoRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (recordingState === 'recording' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (recordingState === 'recording' && timeLeft === 0) {
            stopRecording();
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [recordingState, timeLeft]);

    const startRecording = useCallback(() => {
        if (!stream) return;

        chunksRef.current = [];
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.onstop = handleStop;
        mediaRecorderRef.current.start();
        setRecordingState('recording');
        if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
            setTimeLeft(questions[currentQuestionIndex].duration);
        } else {
            console.error('Invalid question index:', currentQuestionIndex);
            setTimeLeft(60); // Default to 60 seconds if there's an error
        }
    }, [stream, currentQuestionIndex, questions]);

    const pauseRecording = () => {
        if (mediaRecorderRef.current && recordingState === 'recording') {
            mediaRecorderRef.current.pause();
            setRecordingState('paused');
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && recordingState === 'paused') {
            mediaRecorderRef.current.resume();
            setRecordingState('recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleDataAvailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
            chunksRef.current.push(event.data);
        }
    };

    const handleStop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordingState('preview');
    };

    const handleSubmitAndNext = async () => {
        if (recordedBlob) {
            try {
                // Simulating upload to server
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast({
                    title: "Response Submitted",
                    description: "Your response has been successfully uploaded.",
                });
            } catch (error) {
                console.error('Error uploading video:', error);
                toast({
                    title: "Upload Failed",
                    description: "There was an error uploading your response. Please try again.",
                    variant: "destructive",
                });
                return;
            }
        }
        moveToNextQuestion();
    };

    const moveToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setRecordingState('idle');
            setRecordedVideoUrl(null);
            setRecordedBlob(null);
        } else {
            onComplete();
        }
    };

    const handleStartVideoResponse = () => {
        setCurrentQuestionIndex(0);
    };

    const handleSkipQuestion = () => {
        setSkippedQuestions(prev => new Set(prev).add(currentQuestionIndex));
        moveToNextQuestion();
    };

    const handleRedoRecording = () => {
        setRecordingState('idle');
        setRecordedVideoUrl(null);
        setRecordedBlob(null);
    };

    const downloadRecordedVideo = () => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `question_${currentQuestionIndex + 1}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className="flex flex-col w-full bg-gray-900 text-white min-h-screen">
            <div className="flex-grow flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-grow">
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                        <video
                            ref={liveVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {recordingState === 'preview' && (
                            <video
                                ref={recordedVideoRef}
                                src={recordedVideoUrl || undefined}
                                controls
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        {recordingState === 'recording' && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xl font-bold p-2 rounded">
                                {timeLeft}
                            </div>
                        )}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {currentQuestionIndex !== -1 && recordingState === 'idle' && (
                                <Button
                                    onClick={startRecording}
                                    className="bg-green-600 hover:bg-green-700 transition duration-300"
                                >
                                    Start Recording
                                </Button>
                            )}
                            {recordingState === 'recording' && (
                                <>
                                    <Button
                                        onClick={pauseRecording}
                                        className="bg-yellow-600 hover:bg-yellow-700 transition duration-300"
                                    >
                                        <PauseIcon className="mr-2 h-4 w-4" /> Pause
                                    </Button>
                                    <Button
                                        onClick={stopRecording}
                                        className="bg-red-600 hover:bg-red-700 transition duration-300"
                                    >
                                        <StopCircleIcon className="mr-2 h-4 w-4" /> Stop
                                    </Button>
                                </>
                            )}
                            {recordingState === 'paused' && (
                                <Button
                                    onClick={resumeRecording}
                                    className="bg-green-600 hover:bg-green-700 transition duration-300"
                                >
                                    <PlayIcon className="mr-2 h-4 w-4" /> Resume
                                </Button>
                            )}
                        </div>
                    </div>
                    {/* <div className="mt-4 flex justify-end items-center">
                        <Button onClick={toggleFullscreen}>
                            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        </Button>
                    </div> */}
                </div>

                <div className="w-full lg:w-96 bg-gray-800 rounded-xl p-4 flex flex-col">
                    <div className="flex-grow">
                        {currentQuestionIndex === -1 ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">{questionData?.title}</h2>
                                <p className="text-sm text-gray-300 mb-4">{questionData?.description}</p>
                                <ul className="space-y-3 p-4 bg-gray-700 rounded-md shadow-md">
                                    {questions.map((q: Question, index: number) => (
                                        <li
                                            key={q.id}
                                            className="flex items-start space-x-2 text-gray-200 hover:bg-gray-600 p-2 rounded-md transition-colors duration-200 cursor-pointer"
                                        >
                                            <span className="text-indigo-400 font-medium">{index + 1}.</span>
                                            <span className="flex-1">{q.question}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-md shadow-md space-y-4">
                                <h2 className="text-lg font-bold text-white">{questions[currentQuestionIndex].question}</h2>

                                {recordingState !== 'preview' && (
                                    <div className="space-y-2">
                                        <p className="text-base font-semibold text-indigo-400">
                                            Time left: <span className="text-white">{timeLeft} seconds</span>
                                        </p>
                                        <Progress value={(questions[currentQuestionIndex].duration - timeLeft) / questions[currentQuestionIndex].duration * 100} />
                                    </div>
                                )}

                                {questions[currentQuestionIndex].notes && (
                                    <Collapsible 
                                        defaultOpen={true} 
                                        className="w-full bg-gray-600 rounded-md"
                                        onOpenChange={(open) => setIsNotesOpen(open)}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <button className="flex items-center justify-between w-full p-3 text-sm font-medium text-left text-gray-200 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-700">
                                                <span className="flex items-center space-x-2">
                                                    <svg
                                                        className="w-5 h-5 text-indigo-400"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M18 10c0 4.418-3.582 8-8 8S2 14.418 2 10 5.582 2 10 2s8 3.582 8 8zm-9 4h2v-2H9v2zm0-4h2V6H9v4z" />
                                                    </svg>
                                                    <span>Question Notes</span>
                                                </span>
                                                {isNotesOpen ? (
                                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="p-3 text-sm text-gray-300 leading-relaxed border-t border-gray-500">
                                            {questions[currentQuestionIndex].notes.split('\n').map((note, index) => (
                                                <p key={index} className="mb-2 last:mb-0">
                                                    {note}
                                                </p>
                                            ))}
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 space-y-2">
                        {currentQuestionIndex === -1 ? (
                            <Button
                                onClick={handleStartVideoResponse}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition duration-300"
                            >
                                Start Video Response
                            </Button>
                        ) : recordingState === 'preview' && (
                            <>
                                <Button
                                    onClick={handleSubmitAndNext}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition duration-300"
                                >
                                    <CheckIcon className="mr-2 h-4 w-4" />
                                    {currentQuestionIndex < questions.length - 1 ? 'Save and Next Question' : 'Submit Responses'}
                                </Button>
                                <Button
                                    onClick={handleRedoRecording}
                                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 transition duration-300"
                                >
                                    <Redo className="mr-2 h-4 w-4" /> Redo Recording
                                </Button>
                                <Button
                                    onClick={downloadRecordedVideo}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 transition duration-300"
                                >
                                    <DownloadIcon className="mr-2 h-4 w-4" /> Download Recording
                                </Button>
                            </>
                        )}
                        {currentQuestionIndex !== -1 && recordingState === 'idle' && (
                            <Button
                                onClick={handleSkipQuestion}
                                className="w-full py-3 bg-gray-600 hover:bg-gray-700 transition duration-300"
                            >
                                <SkipForward className="mr-2 h-4 w-4" /> Skip Question
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function HomePage({ params }: VideoFormProps) {
    const [isPermissionGranted, setIsPermissionGranted] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
    const [showVideoResponse, setShowVideoResponse] = useState(false);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const [videoQuestions, setVideoQuestions] = useState();
    const [designation, setDesignation] = useState('');
    const [linkedinProfile, setLinkedinProfile] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getVideoById(params.videoid);
                if (typeof data?.jsonForm === 'string') {
                    try {
                        const parsedJson = JSON.parse(data.jsonForm);
                        setVideoQuestions(parsedJson);
                    } catch (parseError) {
                        try {
                            const fixedJsonString = data.jsonForm.replace(/(\w+):/g, '"$1":');
                            const parsedJson = JSON.parse(fixedJsonString);
                            setVideoQuestions(parsedJson);
                        } catch (fixError) {
                            console.error("Error parsing fixed JSON:", fixError);
                            console.log("Problematic JSON string:", data.jsonForm);
                        }
                    }
                } else if (typeof data?.jsonForm === 'object') {
                    setVideoQuestions(data.jsonForm);
                } else {
                    console.error("jsonForm is neither a string nor an object:", data?.jsonForm);
                }
            } catch (error) {
                console.error("Error fetching survey data:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch survey data. Please try again later.",
                    variant: "destructive",
                });
            }
        };

        fetchData();
    }, [params.videoid]);

    useEffect(() => {
        if (isPermissionGranted) {
            enumerateDevices()
        }
    }, [isPermissionGranted]);

    useEffect(() => {
        if (stream && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const enumerateDevices = async () => {
        try {
            const deviceInfos = await navigator.mediaDevices.enumerateDevices();
            setDevices(deviceInfos);

            const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
            const audioDevices = deviceInfos.filter(device => device.kind === 'audioinput');

            if (videoDevices.length > 0 && !selectedCamera) {
                setSelectedCamera(videoDevices[0].deviceId);
            }
            if (audioDevices.length > 0 && !selectedMicrophone) {
                setSelectedMicrophone(audioDevices[0].deviceId);
            }
        } catch (error) {
            console.error('Error enumerating devices:', error);
            setError('Failed to enumerate devices. Please check your browser settings.');
        }
    };

    const handleRequestPermissions = async () => {
        try {
            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            newStream.getTracks().forEach(track => {
                peerConnection.current?.addTrack(track, newStream);
            });

            setStream(newStream);
            setIsPermissionGranted(true);
            setError(null);

            const videoTrack = newStream.getVideoTracks()[0];
            const audioTrack = newStream.getAudioTracks()[0];
            if (videoTrack) {
                setSelectedCamera(videoTrack.getSettings().deviceId || '');
            }
            if (audioTrack) {
                setSelectedMicrophone(audioTrack.getSettings().deviceId || '');
            }

            enumerateDevices()
        } catch (err: any) {
            console.error('Error accessing media devices:', err);
            if (err.name === 'NotAllowedError') {
                setError(
                    'Permission denied. Please allow access to your camera and microphone in your browser settings.'
                );
            } else if (err.name === 'NotFoundError') {
                setError(
                    'No camera or microphone devices found. Please connect them and try again.'
                );
            } else {
                setError(
                    'An unexpected error occurred. Please check your device settings and try again.'
                );
            }
        }
    };

    const handleDeviceChange = async (deviceId: string, kind: MediaDeviceKind) => {
        if (!stream || !peerConnection.current) return;

        const newConstraints: MediaStreamConstraints = {
            audio: kind === 'audioinput' ? { deviceId: { exact: deviceId } } : stream.getAudioTracks()[0].enabled,
            video: kind === 'videoinput' ? { deviceId: { exact: deviceId } } : stream.getVideoTracks()[0].enabled,
        };

        try {
            const newStream = await navigator.mediaDevices.getUserMedia(newConstraints);

            if (kind === 'videoinput') {
                const videoTrack = newStream.getVideoTracks()[0];
                const oldVideoTrack = stream.getVideoTracks()[0];
                stream.removeTrack(oldVideoTrack);
                stream.addTrack(videoTrack);
                setSelectedCamera(deviceId);

                const sender = peerConnection.current.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            } else if (kind === 'audioinput') {
                const audioTrack = newStream.getAudioTracks()[0];
                const oldAudioTrack = stream.getAudioTracks()[0];
                stream.removeTrack(oldAudioTrack);
                stream.addTrack(audioTrack);
                setSelectedMicrophone(deviceId);

                const sender = peerConnection.current.getSenders().find(s => s.track?.kind === 'audio');
                if (sender) {
                    sender.replaceTrack(audioTrack);
                }
            }

            setStream(stream);
        } catch (error) {
            console.error('Error switching device:', error);
            setError('Failed to switch device. Please try again.');
        }
    };

    const handleVideoResponseComplete = () => {
        setShowVideoResponse(false);
        toast({
            title: "Video Response Completed",
            description: "Thank you for completing the video response.",
        });
    };

    const startVideoResponse = () => {
        if (!designation || !linkedinProfile) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields before starting the video response.",
                variant: "destructive",
            });
            return;
        }
        setShowVideoResponse(true);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-6">
            {!isPermissionGranted ? (
                <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-bold">Lets check your cam and mic</h2>

                    <Button
                        onClick={handleRequestPermissions}
                        className="bg-purple-500 text-white py-2 px-4 rounded"
                    >
                        Request camera permissions
                    </Button>
                    {error && (
                        <p className="text-red-500 mt-2">{error}</p>
                    )}
                </div>
            ) : showVideoResponse ? (
                <VideoResponse
                    stream={stream}
                    onComplete={handleVideoResponseComplete}
                    questionData={videoQuestions}
                />
            ) : (
                <div className="flex flex-col items-center space-y-4 w-full max-w-4xl">
                    <div className="w-full lg:flex lg:space-x-8">
                        <div className="flex-1">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-100">Personal Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="designation" className="text-gray-200">Designation</Label>
                                            <Input
                                                id="designation"
                                                type="text"
                                                placeholder="Senior Director"
                                                value={designation}
                                                onChange={(e) => setDesignation(e.target.value)}
                                                required
                                                className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="linkedin" className="text-gray-200">LinkedIn Profile link</Label>
                                            <Input
                                                id="linkedin"
                                                type="url"
                                                placeholder="https://www.linkedin.com/in/yourprofile"
                                                value={linkedinProfile}
                                                onChange={(e) => setLinkedinProfile(e.target.value)}
                                                required
                                                className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                                            />
                                        </div>
                                        <Button
                                            onClick={startVideoResponse}
                                            className="w-full bg-purple-600 hover:bg-purple-700 transition duration-300"
                                        >
                                            Start Video Response
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex-1 mt-4 lg:mt-0">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-100">Device Setup</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-48 object-cover rounded-md bg-gray-700"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="camera" className="text-gray-200">Camera</Label>
                                            <Select value={selectedCamera} onValueChange={(e) => handleDeviceChange(e, 'videoinput')}>
                                                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-100">
                                                    <VideoIcon className="w-4 h-4 mr-2" />
                                                    <SelectValue placeholder="Select a Camera" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {devices
                                                            .filter((device) => device.kind === 'videoinput')
                                                            .map((device) => (
                                                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                                                    {device.label || 'Camera'}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="microphone" className="text-gray-200">Microphone</Label>
                                            <Select value={selectedMicrophone} onValueChange={(e) => handleDeviceChange(e, 'audioinput')}>
                                                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-100">
                                                    <MicIcon className="w-4 h-4 mr-2" />
                                                    <SelectValue placeholder="Select microphone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {devices
                                                            .filter((device) => device.kind === 'audioinput')
                                                            .map((device) => (
                                                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                                                    {device.label || 'Microphone'}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}