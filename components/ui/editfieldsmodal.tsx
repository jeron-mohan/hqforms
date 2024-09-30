'use client'

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, X, Plus, Trash2, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createForm } from '@/data/form';
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';
import { LoadingComp } from './loading';

type QuestionType = 'select' | 'multiselect' | 'radio' | 'rating' | 'opinionscale' | 'matrix' | 'text'

interface FormData {
    formTitle: string;
    formDescription: string;
    formName: string;
    fields: Question[];
}

interface Question {
    id: string;
    fieldType: QuestionType;
    fieldLabel: string;
    fieldDescription: string;
    placeholder: string;
    options: Option[];
    required: boolean;
    scaleSize?: number;
}

interface Option {
    value: string | boolean;
    label: string | number;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: FormData | string;
    onButtonClick: () => void;
    maxRating?: number;
    deleteField?: (index: number) => void;
}

const FieldCheckModal: React.FC<ModalProps> = ({ isOpen, onClose, data, onButtonClick, maxRating = 10, deleteField }) => {
    const [isPending, startTransition] = useTransition()
    const [entireData, setEntireData] = useState<FormData>(() => {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('Error parsing data:', error);
                return { formTitle: '', formDescription: '', formName: '', fields: [] };
            }
        }
        return data || { formTitle: '', formDescription: '', formName: '', fields: [] };
    });
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    useEffect(() => {
        if (typeof data === 'string') {
            try {
                setEntireData(JSON.parse(data));
            } catch (error) {
                console.error('Error parsing data:', error);
                setEntireData({ formTitle: '', formDescription: '', formName: '', fields: [] });
            }
        } else {
            setEntireData(data || { formTitle: '', formDescription: '', formName: '', fields: [] });
        }
    }, [data]);

    const updateFormData = useCallback((updates: Partial<FormData>) => {
        setEntireData(prevData => ({
            ...prevData,
            ...updates
        }));
    }, []);

    const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
        setEntireData(prevData => ({
            ...prevData,
            fields: prevData.fields.map(question =>
                question.id === id ? { ...question, ...updates } : question
            )
        }));
    }, []);

    const deleteQuestion = useCallback((id: string) => {
        setEntireData(prevData => ({
            ...prevData,
            fields: prevData.fields.filter(question => question.id !== id)
        }));
    }, []);

    const duplicateQuestion = useCallback((id: string) => {
        setEntireData(prevData => {
            const index = prevData.fields.findIndex(q => q.id === id);
            if (index !== -1) {
                const questionToDuplicate = prevData.fields[index];
                const newQuestion = { ...questionToDuplicate, id: Date.now().toString() };
                const newFields = [...prevData.fields];
                newFields.splice(index + 1, 0, newQuestion);
                return {
                    ...prevData,
                    fields: newFields
                };
            }
            return prevData;
        });
    }, []);

    const onFormSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        console.log(entireData);

        startTransition(() => {
            createForm({
                jsonForm: JSON.stringify(entireData),
                createdBy: 'someUserId'
            })
                .then((data) => {
                    setLoading(false)
                    router.push('/editform/' + data.id);
                })
                .catch((error) => {
                    console.error('Error creating form:', error);
                    setLoading(false);
                    // Handle error (e.g., show error message to user)
                });
        });
    }, [entireData, router]);

    if (!entireData) {
        return <LoadingComp />
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-screen-lg h-auto">
                <DialogHeader>
                    <DialogTitle>Edit Form options</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <ScrollArea className="h-[550px] w-full">
                        <form onSubmit={onFormSubmit} className='border p-5 rounded-lg'>
                            <div className="mb-4">
                                <Label htmlFor="formTitle">Form Title</Label>
                                <Input
                                    id="formTitle"
                                    value={entireData.formTitle}
                                    onChange={(e) => updateFormData({ formTitle: e.target.value })}
                                    placeholder="Enter form title"
                                    className="mt-1"
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="formDescription">Form Description</Label>
                                <Input
                                    id="formDescription"
                                    value={entireData.formDescription}
                                    onChange={(e) => updateFormData({ formDescription: e.target.value })}
                                    placeholder="Enter form description"
                                    className="mt-1"
                                />
                            </div>

                            {entireData.fields && entireData.fields.length > 0 ? (
                                entireData.fields.map((field) => (
                                    <QuestionField
                                        key={field.id}
                                        field={field}
                                        updateQuestion={updateQuestion}
                                        deleteQuestion={deleteQuestion}
                                        duplicateQuestion={duplicateQuestion}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 my-4">No fields available. Add a new field to get started.</p>
                            )}

                            <Button
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
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

interface QuestionFieldProps {
    field: Question;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    deleteQuestion: (id: string) => void;
    duplicateQuestion: (id: string) => void;
}

const QuestionField: React.FC<QuestionFieldProps> = React.memo(({ field, updateQuestion, deleteQuestion, duplicateQuestion }) => {
    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 flex-grow">
                    <Select
                        value={field.fieldType}
                        onValueChange={(value) => updateQuestion(field.id, { fieldType: value as QuestionType })}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                            {['select', 'multiselect', 'radio', 'rating', 'opinionscale', 'matrix', 'text'].map((type) => (
                                <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        value={field.fieldLabel}
                        onChange={(e) => updateQuestion(field.id, { fieldLabel: e.target.value })}
                        className="flex-grow"
                        placeholder="Enter question text"
                    />
                </div>
                <div className="ml-4">
                    <QuestionActions field={field} updateQuestion={updateQuestion} deleteQuestion={deleteQuestion} duplicateQuestion={duplicateQuestion} />
                </div>
            </div>

            <div className="mb-4">
                <Label htmlFor={`fieldDescription-${field.id}`}>Field Description</Label>
                <Input
                    id={`fieldDescription-${field.id}`}
                    value={field.fieldDescription}
                    onChange={(e) => updateQuestion(field.id, { fieldDescription: e.target.value })}
                    placeholder="Enter field description"
                    className="mt-1"
                />
            </div>

            {(field.fieldType === 'rating' || field.fieldType === 'opinionscale') && (
                <RatingScaleOptions field={field} updateQuestion={updateQuestion} />
            )}

            {field.fieldType === 'select' && (
                <SelectOptionsList field={field} updateQuestion={updateQuestion} />
            )}
            {field.fieldType === 'multiselect' && (
                <MultiSelectOptionsList field={field} updateQuestion={updateQuestion} />
            )}
            {field.fieldType === 'radio' && (
                <RadioOptionsList field={field} updateQuestion={updateQuestion} />
            )}
            {field.fieldType === 'matrix' && (
                <MatrixOptionsList field={field} updateQuestion={updateQuestion} />
            )}
            {field.fieldType === 'text' && (
                <div className="mb-4">
                    <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                    <Input
                        id={`placeholder-${field.id}`}
                        value={field.placeholder}
                        onChange={(e) => updateQuestion(field.id, { placeholder: e.target.value })}
                        placeholder="Enter placeholder text"
                        className="mt-1"
                    />
                </div>
            )}
        </div>
    );
});
QuestionField.displayName = 'QuestionField';

interface RatingScaleOptionsProps {
    field: Question;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
}

const RatingScaleOptions: React.FC<RatingScaleOptionsProps> = React.memo(({ field, updateQuestion }) => {
    const handleScaleChange = (value: string) => {
        const scaleSize = parseInt(value);
        updateQuestion(field.id, { 
            scaleSize, 
            options: [
                { value: true, label: scaleSize },
                { value: false, label: scaleSize === 5 ? 10 : 5 }
            ]
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Select Scale</Label>
                <RadioGroup
                    value={field.scaleSize?.toString() || "5"}
                    onValueChange={handleScaleChange}
                    className="flex space-x-4 mt-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id={`scale-5-${field.id}`} />
                        <Label htmlFor={`scale-5-${field.id}`}>0-5</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10" id={`scale-10-${field.id}`} />
                        <Label htmlFor={`scale-10-${field.id}`}>0-10</Label>
                    </div>
                </RadioGroup>
            </div>
            <div>
                <Label>Preview</Label>
                <div className="flex space-x-2 mt-2">
                    {Array.from({ length: field.scaleSize || 5 }, (_, i) => (
                        <div
                            key={i}
                            className="w-8 h-8 text-sm rounded-md border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
RatingScaleOptions.displayName = 'RatingScaleOptions';

interface QuestionActionsProps {
    field: Question;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    deleteQuestion: (id: string) => void;
    duplicateQuestion: (id: string) => void;
}

const QuestionActions: React.FC<QuestionActionsProps> = React.memo(({ field, updateQuestion, deleteQuestion, duplicateQuestion }) => {
    return (
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
            <ActionButton icon={Copy} onClick={() => duplicateQuestion(field.id)} tooltip="Duplicate question" />
            <ActionButton icon={Trash2} onClick={() => deleteQuestion(field.id)} tooltip="Delete question" className="text-red-500" />
        </div>
    );
});
QuestionActions.displayName = 'QuestionActions';

interface ActionButtonProps {
    icon: React.ElementType;
    onClick: () => void;
    tooltip: string;
    className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = React.memo(({ icon: Icon, onClick, tooltip, className }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" type="button" onClick={onClick}>
                        <Icon className={`h-4 w-4 ${className}`} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});
ActionButton.displayName = 'ActionButton';

interface OptionsListProps {
    field: Question;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
}

const SelectOptionsList: React.FC<OptionsListProps> = React.memo(({ field, updateQuestion }) => {
    return (
        <div className="ml-12 space-y-2">
            {field.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2 w-72">
                    <Input
                        value={option.label.toString()}
                        onChange={(e) => {
                            const newOptions = field.options.map((opt, index) =>
                                index === optionIndex ? { value: e.target.value, label: e.target.value } : opt
                            );
                            updateQuestion(field.id, { options: newOptions });
                        }}
                        className="flex-grow"
                        placeholder={`Option ${optionIndex + 1}`}
                    />
                    <ActionButton
                        icon={X}
                        onClick={() => {
                            const newOptions = field.options.filter((_, i) => i !== optionIndex);
                            updateQuestion(field.id, {options: newOptions});
                        }}
                        tooltip="Remove option"
                    />
                </div>
            ))}
            <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                    const newOptions = [...field.options, { value: `option_${field.options.length + 1}`, label: `Option ${field.options.length + 1}` }];
                    updateQuestion(field.id, { options: newOptions });
                }}
                className="mt-2"
            >
                <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
        </div>
    );
});
SelectOptionsList.displayName = 'SelectOptionsList';

const MultiSelectOptionsList: React.FC<OptionsListProps> = React.memo(({ field, updateQuestion }) => {
    return (
        <div className="ml-12 space-y-2">
            {field.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2 w-72">
                    <Checkbox disabled id={`checkbox-${field.id}-${optionIndex}`} />
                    <Input
                        value={option.label.toString()}
                        onChange={(e) => {
                            const newOptions = field.options.map((opt, index) =>
                                index === optionIndex ? { value: e.target.value, label: e.target.value } : opt
                            );
                            updateQuestion(field.id, { options: newOptions });
                        }}
                        className="flex-grow"
                        placeholder={`Option ${optionIndex + 1}`}
                    />
                    <ActionButton
                        icon={X}
                        onClick={() => {
                            const newOptions = field.options.filter((_, i) => i !== optionIndex);
                            updateQuestion(field.id, { options: newOptions });
                        }}
                        tooltip="Remove option"
                    />
                </div>
            ))}
            <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                    const newOptions = [...field.options, { value: `option_${field.options.length + 1}`, label: `Option ${field.options.length + 1}` }];
                    updateQuestion(field.id, { options: newOptions });
                }}
                className="mt-2"
            >
                <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
        </div>
    );
});
MultiSelectOptionsList.displayName = 'MultiSelectOptionsList';

const RadioOptionsList: React.FC<OptionsListProps> = React.memo(({ field, updateQuestion }) => {
    return (
        <div className="ml-12 space-y-2">
            <RadioGroup disabled>
                {field.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value.toString()} id={`radio-${field.id}-${optionIndex}`} />
                            <Input
                                value={option.label.toString()}
                                onChange={(e) => {
                                    const newOptions = field.options.map((opt, index) =>
                                        index === optionIndex ? { value: e.target.value, label: e.target.value } : opt
                                    );
                                    updateQuestion(field.id, { options: newOptions });
                                }}
                                className="flex-grow"
                                placeholder={`Option ${optionIndex + 1}`}
                            />
                        </div>
                        <ActionButton
                            icon={X}
                            onClick={() => {
                                const newOptions = field.options.filter((_, i) => i !== optionIndex);
                                updateQuestion(field.id, { options: newOptions });
                            }}
                            tooltip="Remove option"
                        />
                    </div>
                ))}
            </RadioGroup>
            <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                    const newOptions = [...field.options, { value: `option_${field.options.length + 1}`, label: `Option ${field.options.length + 1}` }];
                    updateQuestion(field.id, { options: newOptions });
                }}
                className="mt-2"
            >
                <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
        </div>
    );
});
RadioOptionsList.displayName = 'RadioOptionsList';

const MatrixOptionsList: React.FC<OptionsListProps> = React.memo(({ field, updateQuestion }) => {
    const [rows, setRows] = useState(field.options.filter(opt => opt.value.toString().startsWith('row_')));
    const [columns, setColumns] = useState(field.options.filter(opt => opt.value.toString().startsWith('col_')));

    const updateOptions = useCallback(() => {
        const newOptions = [...rows, ...columns];
        updateQuestion(field.id, { options: newOptions });
    }, [rows, columns, field.id, updateQuestion]);

    return (
        <div className="ml-12 space-y-4">
            <div>
                <h4 className="font-semibold mb-2">Rows</h4>
                {rows.map((row, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                            value={row.label.toString()}
                            onChange={(e) => {
                                const newRows = rows.map((r, i) =>
                                    i === index ? { ...r, label: e.target.value } : r
                                );
                                setRows(newRows);
                                updateOptions();
                            }}
                            className="flex-grow"
                            placeholder={`Row ${index + 1}`}
                        />
                        <ActionButton
                            icon={X}
                            onClick={() => {
                                const newRows = rows.filter((_, i) => i !== index);
                                setRows(newRows);
                                updateOptions();
                            }}
                            tooltip="Remove row"
                        />
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                        const newRow = { value: `row_${rows.length + 1}`, label: `Row ${rows.length + 1}` };
                        setRows([...rows, newRow]);
                        updateOptions();
                    }}
                    className="mt-2"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Row
                </Button>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Columns</h4>
                {columns.map((column, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                            value={column.label.toString()}
                            onChange={(e) => {
                                const newColumns = columns.map((c, i) =>
                                    i === index ? { ...c, label: e.target.value } : c
                                );
                                setColumns(newColumns);
                                updateOptions();
                            }}
                            className="flex-grow"
                            placeholder={`Column ${index + 1}`}
                        />
                        <ActionButton
                            icon={X}
                            onClick={() => {
                                const newColumns = columns.filter((_, i) => i !== index);
                                setColumns(newColumns);
                                updateOptions();
                            }}
                            tooltip="Remove column"
                        />
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                        const newColumn = { value: `col_${columns.length + 1}`, label: `Column ${columns.length + 1}` };
                        setColumns([...columns, newColumn]);
                        updateOptions();
                    }}
                    className="mt-2"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Column
                </Button>
            </div>
        </div>
    );
});
MatrixOptionsList.displayName = 'MatrixOptionsList';

export default FieldCheckModal;