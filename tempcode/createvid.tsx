"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MicIcon, VideoIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { db } from '@/lib/db';
import { getVideoById } from '@/data/form';

interface VideoFormProps {
    params: any;
}

interface VideoResponseProps {
    stream: MediaStream | null;
    onComplete: () => void;
    param?: {
        videoid: string;
    };
    questionData?: any;

}



const sampleQuestions = {
    questions: [
        {
            question: "What do you think of our product?",
            duration: 20,
            notes: "You have used this for 200 tickets"
        },
        {
            question: "What do you think of our automation?",
            duration: 180,
            notes: "You have used this for 100 tickets"
        },
        {
            question: "What do you think of our AI?",
            duration: 60,
            notes: "You have used this for 50 tickets"
        }
    ]
};




const VideoResponse: React.FC<VideoResponseProps> = ({ stream, onComplete, param, questionData }) => {
    console.log("Form ID:", param?.videoid ?? "Not provided");

    const [testQuestions] = useState(questionData);
    console.log("This is summa from database test", testQuestions);


    const [questions] = useState(sampleQuestions.questions);
    // const [questions] = useState(sampleQuestions.questions);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [recordingState, setRecordingState] = useState<'idle' | 'countdown' | 'recording' | 'preview'>('idle');
    const [countdown, setCountdown] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
    const liveVideoRef = useRef<HTMLVideoElement>(null);
    const recordedVideoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);


    useEffect(() => {
        if (stream) {
            setupWebRTC();
        }
    }, [stream]);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (recordingState === 'countdown' && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (recordingState === 'countdown' && countdown === 0) {
            startRecording();
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [recordingState, countdown]);

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

    const setupWebRTC = async () => {
        if (!stream) return;

        peerConnectionRef.current = new RTCPeerConnection();

        stream.getTracks().forEach(track => {
            peerConnectionRef.current?.addTrack(track, stream);
        });

        peerConnectionRef.current.ontrack = (event) => {
            if (liveVideoRef.current) {
                liveVideoRef.current.srcObject = event.streams[0];
            }
        };

        if (liveVideoRef.current) {
            liveVideoRef.current.srcObject = stream;
        }

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("New ICE candidate:", event.candidate);
            }
        };
    };

    const startCountdown = () => {
        setRecordingState('countdown');
        setCountdown(5);
    };

    const startRecording = () => {
        if (stream) {
            chunksRef.current = [];
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = handleDataAvailable;
            mediaRecorderRef.current.onstop = handleStop;
            mediaRecorderRef.current.start();
            setRecordingState('recording');
            setTimeLeft(questions[currentQuestionIndex].duration);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recordingState === 'recording') {
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
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordingState('preview');
    };

    const handleSubmitAndNext = () => {
        if (recordedVideoUrl) {
            downloadVideo(recordedVideoUrl);
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setRecordingState('idle');
            setRecordedVideoUrl(null);
        } else {
            onComplete();
        }
    };

    const downloadVideo = (url: string) => {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `question_${currentQuestionIndex + 1}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    const handleStartVideoResponse = () => {
        setCurrentQuestionIndex(0);
    };

    return (
        <div className="flex flex-col w-full bg-gray-900 text-white">
            {/* Header */}
            {/* <header className="flex items-center justify-between p-4 bg-gray-800">
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                J
              </div>
            </div>
          </header> */}

            {/* Main content */}
            <div className="flex-grow flex">
                {/* Video area */}
                <div className="flex-grow p-4">
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                        <video
                            ref={liveVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${recordingState === 'preview' ? 'hidden' : ''}`}
                        />
                        <video
                            ref={recordedVideoRef}
                            src={recordedVideoUrl || undefined}
                            controls
                            className={`w-full h-full object-cover ${recordingState !== 'preview' ? 'hidden' : ''}`}
                        />
                        {recordingState === 'countdown' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-6xl font-bold">
                                {countdown}
                            </div>
                        )}
                        {recordingState === 'recording' && timeLeft <= 10 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xl font-bold p-2 rounded">
                                {timeLeft}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 rounded-xl aspect-video bg-gray-800 p-4 flex flex-col">
                    <div className="flex-grow">
                        {currentQuestionIndex === -1 ? (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Questions Overview</h2>
                                <ul className="space-y-3 p-4 bg-gray-800 rounded-md shadow-md">
                                    {questions.map((q: any, index: any) => (
                                        <li
                                            key={index}
                                            className="flex items-start space-x-2 text-gray-200 hover:bg-gray-700 p-2 rounded-md transition-colors duration-200 cursor-pointer"
                                        >
                                            <span className="text-indigo-400 font-medium">{index + 1}.</span>
                                            <span className="flex-1">{q.question}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-800 rounded-md shadow-md space-y-4">
                            <h2 className="text-lg font-bold text-white">{questions[currentQuestionIndex].question}</h2>
                          
                            {recordingState !== 'preview' && (
                              <p className="text-base font-semibold text-indigo-400">
                                Time left:{" "}
                                <span className="text-white">
                                  {recordingState === 'recording' ? timeLeft : questions[currentQuestionIndex].duration} seconds
                                </span>
                              </p>
                            )}
                          
                            <div className="bg-gray-700 p-3 rounded-md border-l-4 border-indigo-500 flex items-start space-x-2">
                              <svg
                                className="w-5 h-5 text-indigo-400 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M18 10c0 4.418-3.582 8-8 8S2 14.418 2 10 5.582 2 10 2s8 3.582 8 8zm-9 4h2v-2H9v2zm0-4h2V6H9v4z" />
                              </svg>
                              <p className="text-sm text-gray-300 leading-relaxed">
                                <span className="font-semibold text-indigo-400">Note:</span> {questions[currentQuestionIndex].notes}
                              </p>
                            </div>
                          </div>
                          
                        )}
                    </div>
                    <div className="mt-4">
                        {currentQuestionIndex === -1 ? (
                            <Button
                                onClick={handleStartVideoResponse}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition duration-300"
                            >
                                Start Video Response
                            </Button>
                        ) : recordingState === 'idle' ? (
                            <Button
                                onClick={startCountdown}
                                className="w-full py-3  bg-green-600 hover:bg-green-700 transition duration-300"
                            >
                                Start Recording
                            </Button>
                        ) : recordingState === 'recording' ? (
                            <Button
                                onClick={stopRecording}
                                className="w-full py-3  bg-red-600 hover:bg-red-700 transition duration-300"
                            >
                                Stop Recording
                            </Button>
                        ) : recordingState === 'preview' && (
                            <Button
                                onClick={handleSubmitAndNext}
                                className="w-full py-3  bg-blue-600 hover:bg-blue-700 transition duration-300"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Save and Next Question' : 'Submit Responses'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            {/* <footer className="bg-gray-800 p-4 flex justify-center space-x-4">
            <button className="p-2 rounded-full bg-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </footer> */}
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



    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getVideoById(params.videoid);
                // console.log("Raw jsonForm data:", data?.jsonForm);

                if (typeof data?.jsonForm === 'string') {
                    try {
                        const parsedJson = JSON.parse(data.jsonForm);
                        setVideoQuestions(parsedJson);
                    } catch (parseError) {
                        // console.log("Standard JSON parsing failed, attempting to fix the format");
                        try {
                            const fixedJsonString = data.jsonForm.replace(/(\w+):/g, '"$1":');
                            const parsedJson = JSON.parse(fixedJsonString);
                            // console.log("Parsed JSON after fixing:", parsedJson);
                            setVideoQuestions(parsedJson);
                        } catch (fixError) {
                            console.error("Error parsing fixed JSON:", fixError);
                            console.log("Problematic JSON string:", data.jsonForm);
                        }
                    }
                } else if (typeof data?.jsonForm === 'object') {
                    // If it's already an object, use it directly
                    setVideoQuestions(data.jsonForm);
                } else {
                    console.error("jsonForm is neither a string nor an object:", data?.jsonForm);
                }
            } catch (error) {
                console.error("Error fetching survey data:", error);
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
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const enumerateDevices = async () => {
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
    };

    const handleRequestPermissions = async () => {
        try {
            peerConnection.current = new RTCPeerConnection();

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
        }
    };

    const handleVideoResponseComplete = () => {
        setShowVideoResponse(false);
        console.log("Video response completed");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
            {!isPermissionGranted ? (
                <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-bold">Let's check your cam and mic</h2>

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
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-full lg:flex lg:min-h-[600px] xl:min-h-[800px] justify-center items-center space-x-24">
                        <div className="flex items-center justify-center py-6">
                            <div className="mx-auto grid w-[350px] gap-6">
                                <div className="grid gap-2 text-center">
                                    <h1 className="text-3xl font-bold">Personal Information</h1>
                                    <p className="text-balance text-muted-foreground ">
                                        Please enter additional details
                                    </p>
                                </div>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="designation">Designation</Label>
                                        <Input
                                            id="designation"
                                            type="text"
                                            placeholder="Senior Director"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="linkedin">LinkedIn Profile link</Label>
                                        </div>
                                        <Input id="linkedin" type="url" required />
                                    </div>
                                    <Button
                                        onClick={() => setShowVideoResponse(true)}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        Record Video
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center py-6">
                            <div className="mx-auto grid w-[350px] gap-6">
                                <Card className="overflow-hidden bg-gray-900">
                                    <CardContent className='mt-5'>
                                        <div className="grid gap-2">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                height="100"
                                                width="300"
                                                className="aspect-square w-full h-44 rounded-md object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col space-y-2 mt-5">
                                            <div>
                                                <Select value={selectedCamera} onValueChange={(e) => handleDeviceChange(e, 'videoinput')}>
                                                    <SelectTrigger className="w-full text-white">
                                                        <VideoIcon className='w-4 h-4' />
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
                                                <Select value={selectedMicrophone} onValueChange={(e) => handleDeviceChange(e, 'audioinput')}>
                                                    <SelectTrigger className="w-full text-white">
                                                        <MicIcon className='w-4 h-4' />
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
                </div>
            )}
        </div>
    );
}