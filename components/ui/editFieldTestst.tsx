import React, { useEffect, useState, useTransition } from 'react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Smile, Meh, Frown, Angry, FrownIcon, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X, Plus, Trash2, Copy, FileDown, FileUp, Check } from 'lucide-react'
import { createForm } from '@/data/form';


type QuestionType = 'select' | 'radio' | 'rating' | 'opinionscale' | 'matrix'


import { Switch } from "@/components/ui/switch"

interface FormData {
    formTitle: string;
    formDescription: string;
    formName: string;
    fields: Question[];
}

interface Question {
    id: string;
    fieldType: string;
    fieldLabel: string;
    fieldDescription: string;
    placeholder: string;
    options: Option[];
    required: boolean;
}

interface Option {
    value: string;
    label: string;
}




import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';
import { LoadingComp } from './loading';





interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onButtonClick: () => void;
    maxRating?: number;
    deleteField?: (index: number) => void;

}

const FieldCheckModal = ({ isOpen, onClose, data, onButtonClick, maxRating = 10, deleteField }: ModalProps) => {

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    const [isPending, starttansition] = useTransition()

    const [entireData, setEntireData] = useState<FormData>(() => {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        return parsedData;
    });
    const [formData, setFormData] = useState(parsedData)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        setEntireData(parsedData);
    }, [data]);


    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setEntireData(prevData => ({
            ...prevData,
            fields: prevData.fields.map(question =>
                question.id === id ? { ...question, ...updates } : question
            )
        }));
    };

    const deleteQuestion = (id: string) => {
        console.log(id);

        setEntireData(prevData => ({
            ...prevData,
            fields: prevData.fields.filter(question => question.id !== id)
        }));

        console.log("From delete", entireData);

    };

    const duplicateQuestion = (id: string) => {
        setEntireData(prevData => {
            const questionToDuplicate = prevData.fields.find(q => q.id === id);
            if (questionToDuplicate) {
                const newQuestion = { ...questionToDuplicate, id: Date.now().toString() };
                return {
                    ...prevData,
                    fields: [...prevData.fields, newQuestion]
                };
            }
            return prevData;
        });
    };


    const route = useRouter();

    console.log(typeof (data));

    console.log("This is the newwwww", data);

    console.log("Entire data", formData);




    const onFormSubmit = (event: any) => {
        event.preventDefault()
        setLoading(true)

        console.log(typeof (parsedData));

        console.log("This is the entiree", entireData);


        starttansition(() => {
            createForm({
                jsonForm: JSON.stringify(parsedData),
                createdBy: 'someUserId'
            })
                .then((data) => {
                    console.log(data);
                    setLoading(false)

                    console.log("I am the ID", data.id);
                    route.push('/editform/' + data.id);
                });
        });

    }

    if (!formData) {
        return (
            <LoadingComp />
        )
    }
    return (
        <Dialog

            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            modal={true}
        >
            <DialogContent className="sm:max-w-screen-lg h-auto">
                <DialogHeader>
                    <DialogTitle>Edit Form options</DialogTitle>
                    <DialogClose asChild>

                    </DialogClose>
                </DialogHeader>
                <div className="grid gap-4 py-4 ">
                    <ScrollArea className="h-[550px] w-full ">
                        <form onSubmit={onFormSubmit} className='border p-5 rounded-lg'  >

                            <h2 className='font-bold text-center text-2xl'>
                                {entireData?.formTitle}
                            </h2>
                            <h2 className='text-sm text-gray-500 text-center'>
                                {entireData?.formDescription}
                            </h2>


                            {entireData?.fields?.map((field: any, index: any) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2 flex-grow">
                                            <Select
                                                value={field.fieldType.toLowerCase()}
                                                onValueChange={(value) => updateQuestion(field.id, { fieldType: value as QuestionType })}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select question type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="select">Select</SelectItem>
                                                    <SelectItem value="radio">Radio</SelectItem>
                                                    <SelectItem value="scale">Scale</SelectItem>
                                                    <SelectItem value="emoji">Emoji</SelectItem>
                                                    <SelectItem value="date">Date</SelectItem>
                                                    <SelectItem value="file">File Upload</SelectItem>
                                                    <SelectItem value="matrix">Matrix</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={field.fieldLabel}
                                                onChange={(e) => updateQuestion(field.id, { fieldLabel: e.target.value })}
                                                className="flex-grow"
                                                placeholder="Enter question text"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center space-x-2">
                                                            <Label htmlFor={`required-${field.id}`} className="text-sm">Required</Label>
                                                            <Switch
                                                                id={`required-${field.id}`}
                                                                checked={field.required}
                                                                onCheckedChange={(checked) => updateQuestion(field.id, { required: checked })}
                                                            />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Toggle required</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" type="button" onClick={() => duplicateQuestion(field.id)}>
                                                            <Copy className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Duplicate question</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" type="button" onClick={() => deleteQuestion(field.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Delete question</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    {(field.fieldType.toLowerCase() === 'select' || field.fieldType.toLowerCase() === 'radio' || field.fieldType.toLowerCase() === 'matrix') && (
                                        <div className="ml-12 space-y-2">
                                            {field.options?.map((option: any, optionIndex: any) => (
                                                <div key={optionIndex} className="flex items-center space-x-2">
                                                    <Input
                                                        value={option.label}
                                                        onChange={(e) => {
                                                            const newOptions = field.options.map((opt:any, index:any) =>
                                                              index === optionIndex ? { value: e.target.value, label: e.target.value } : opt
                                                            );
                                                            updateQuestion(field.id, { options: newOptions });
                                                          }}
                                                        className="flex-grow"
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                    />
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newOptions = field.options.filter((_:any, i:any) => i !== optionIndex).map((opt:any, i:any) => ({
                                                                            value: `option_${i + 1}`,
                                                                            label: opt.label
                                                                        }));
                                                                        updateQuestion(field.id, { options: newOptions });
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4 text-gray-500" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Remove option</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={() => {
                                                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                                                    updateQuestion(field.id, { options: newOptions })
                                                }}
                                                className="mt-2"
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Add Option
                                            </Button>
                                        </div>
                                    )}



                                   






                                </div>


                            ))}
                            {/* <Button type='submit'>Perform Action</Button> */}

                            <Button
                                className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white `}

                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Generate AI form'
                                )}
                            </Button>

                        </form>
                    </ScrollArea>



                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FieldCheckModal;

