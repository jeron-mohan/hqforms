import { Delete, Edit, Trash } from 'lucide-react'
import React, { useState, useCallback } from 'react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


interface FieldEditProps {
    defaultValue: any;
    onUpdate: (value: any) => void;
    deleteField: () => void;
    onOptionsChange?: (newOptions: string[]) => void;

}



function FieldEdit({ defaultValue, onUpdate, deleteField, onOptionsChange }: FieldEditProps) {

    const [fieldLabel, setlabel] = useState(defaultValue?.label);
    const [placeholder, setplaceholder] = useState(defaultValue?.placeholder);
    const [changeoptions, setChangeOptions] = useState([{}]);

    const [fieldName, setfieldName] = useState(defaultValue?.fieldName);


    const [options, setOptions] = useState<string[]>(defaultValue.options || []);
    const [newOption, setNewOption] = useState<string>('');

    const updateOptions = useCallback((updatedOptions: string[]) => {
        const updatedValue = { ...defaultValue, options: updatedOptions };
        onUpdate(updatedValue);
        console.log('Updated defaultValue:', updatedValue);
    }, [defaultValue, onUpdate]);

    const addOption = () => {
        if (newOption.trim() !== '') {
            const updatedOptions = [...defaultValue.options, newOption.trim()];
            updateOptions(updatedOptions);
            setNewOption('');
        }
    };

    const deleteOption = (index: number) => {
        const updatedOptions = defaultValue.options.filter((_: any, i: any) => i !== index);
        updateOptions(updatedOptions);


    };

    return (
        <div className='flex gap-2 mt-4 '>
            <Popover>
                <PopoverTrigger>
                    <Edit className='h-5 w-5 text-gray-500' />
                </PopoverTrigger>
                <PopoverContent>
                    <h2>
                        Edit Fields
                    </h2>
                    <div>
                        <label className='text-xs'>Label Name</label>
                        <Input type="text" defaultValue={defaultValue.fieldLabel} onChange={(e) => setlabel(e.target.value)} />
                    </div>

                    {defaultValue.placeholder &&
                        <div>
                            <label className='text-xs'>Placeholder</label>
                            <Input type="text" defaultValue={defaultValue.placeholder} onChange={(e) => setplaceholder(e.target.value)} />
                        </div>}


                    {
                        defaultValue.fieldType.toLowerCase() === "rating" &&
                        <div className='mt-2'>
                            <label className='text-xs '>Rating Count</label>


                            <RadioGroup defaultValue="option-one" className='mt-1'>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-one" id="option-one" />
                                    <Label htmlFor="option-one">10 Rating</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-two" id="option-two" />
                                    <Label htmlFor="option-two">5 Rating</Label>
                                </div>
                            </RadioGroup>
                        </div>

                    }

                    {
                        ((defaultValue.options && defaultValue.options.length > 0 && defaultValue.fieldType.toLowerCase() !== "easeofuse") ||
                            (defaultValue.fieldType.toLowerCase() === "easeofuse" && (!defaultValue.options || defaultValue.options.length === 0))) &&
                        (
                            <div className="space-y-2 mt-2">
                                <label className='text-xs '>Edit Options</label>


                                {options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <Input defaultValue={option.label} onChange={(e)=>setChangeOptions([{"label":e.target.value,"value":option.value}])} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteOption(index)}
                                        >
                                            <Trash className='w-4 h-4 text-red-600' />
                                        </Button>
                                    </div>
                                ))}

                                <div className="flex space-x-2">
                                    <Input
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        placeholder="Add new option"
                                    />
                                    <Button onClick={addOption}>Add</Button>
                                </div>
                            </div>
                        )
                    }

                    <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => onUpdate({
                            fieldName: fieldName,
                            ...(fieldLabel !== undefined && { fieldLabel }),
                            ...(placeholder !== undefined && { placeholder }),
                            ...( changeoptions!== undefined && { changeoptions }),



                        })}
                    >
                        Update
                    </Button>

                </PopoverContent>
            </Popover>



            <AlertDialog>
                <AlertDialogTrigger>
                    <Trash className='h-5 w-5 text-red-500' />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure to delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this field
                            from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteField()}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>





        </div>
    )
}

export default FieldEdit