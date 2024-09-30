"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Input } from './input';
import { Separator } from './separator';
import { FilterIcon, Search, SortAsc, SortDesc, Video } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface Project {
    id: number;
    title: string;
    thumbnail: string;
    timeAgo: string;
    recordings: number;
    edits: number;
}

const mockProjects: Project[] = [
    {
        id: 1,
        title: "Welcome to our product",
        thumbnail: "https://i.ibb.co/PGtJMKF/thumbnail.jpg",
        timeAgo: "3 hours ago",
        recordings: 1,
        edits: 4
    },
    {
        id: 2,
        title: "Product Overview",
        thumbnail: "https://i.ibb.co/Qbtysm9/thumbnail-1.jpg",
        timeAgo: "5 hours ago",
        recordings: 2,
        edits: 3
    }
    
    
];

export function VideoProjects() {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        setProjects(mockProjects);
    }, []);

    return (
        <div className='p-10'>
            <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-[1.30rem]">Projects</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost">+ New Project</Button>
                    <div className="border-l border-black h-6"></div>
                    <div className='flex gap-5 '>
                        <Search className='h-5 w-5 ml-4' />
                        <FilterIcon className='h-5 w-5' />
                        <SortDesc className='h-5 w-5' />
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {projects.map((project) => (
                    <div key={project.id}>
                        <Card className="w-full h-[220px] cursor-pointer group relative overflow-hidden rounded-lg shadow-md">
                            <img
                                src={project.thumbnail}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                            />
                            <div className="hidden group-hover:flex items-center justify-center absolute inset-0">
                                <button className="bg-white p-2 rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-110">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-black"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.752 11.168l-6.518-3.558A1 1 0 007 8.618v6.764a1 1 0 001.234.95l6.518-3.558a1 1 0 000-1.764z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </Card>
                        <div className='mt-3 ml-1'>
                            <h4 className='font-bold text-sm'>{project.title}</h4>
                            <p className='text-gray-400 flex text-xs'>
                                {project.timeAgo} . {project.recordings} Rec . {project.edits} Edits
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}