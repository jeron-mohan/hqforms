import React, { useState } from 'react'
import { X, Plus, Trash2, Copy, FileDown, FileUp, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type QuestionType = 'text' | 'select' | 'radio' | 'scale' | 'emoji' | 'date' | 'file' | 'matrix'

interface Question {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  required: boolean
  conditional?: {
    questionId: string
    value: string
  }
}

const questionTemplates: Record<QuestionType, Omit<Question, 'id'>> = {
  text: { type: 'text', text: 'Enter your answer', required: false },
  select: { type: 'select', text: 'Choose an option', options: ['Option 1', 'Option 2'], required: false },
  radio: { type: 'radio', text: 'Select one option', options: ['Option 1', 'Option 2'], required: false },
  scale: { type: 'scale', text: 'Rate on a scale of 1-5', required: false },
  emoji: { type: 'emoji', text: 'How do you feel about this?', required: false },
  date: { type: 'date', text: 'Select a date', required: false },
  file: { type: 'file', text: 'Upload a file', required: false },
  matrix: { type: 'matrix', text: 'Rate the following', options: ['Row 1', 'Row 2'], required: false },
}

export default function FormEditor() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', type: 'select', text: 'How did you become aware of this feature?', options: ['Email', 'In-app', 'Social media'], required: true },
    { id: '2', type: 'scale', text: 'On a scale of 0 to 10, how satisfied are you with this automation feature?', required: true },
    { id: '3', type: 'emoji', text: 'How easy or difficult is it to use this automation feature?', required: false },
    { id: '4', type: 'radio', text: 'How effective is this automation feature in helping you achieve your goals?', options: ['Very Effective', 'Effective', 'Somewhat Effective', 'Not Effective'], required: true },
  ])

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      ...questionTemplates[type],
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id)
    if (questionToDuplicate) {
      const newQuestion = { ...questionToDuplicate, id: Date.now().toString() }
      setQuestions([...questions, newQuestion])
    }
  }

  const exportForm = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "form_template.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const importForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          try {
            const importedQuestions = JSON.parse(content)
            setQuestions(importedQuestions)
          } catch (error) {
            console.error('Error parsing imported file:', error)
          }
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">Edit Form Options</DialogTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={exportForm}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export Form</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="import-form" className="cursor-pointer">
                    <Button variant="outline" size="icon">
                      <FileUp className="h-4 w-4" />
                    </Button>
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import Form</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <input
              id="import-form"
              type="file"
              accept=".json"
              className="hidden"
              onChange={importForm}
            />
          </div>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Product Feature Automation Feedback</h3>
              <p className="text-gray-600">We value your feedback! Please take a few minutes to share your thoughts on our new automation features.</p>
            </div>
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 flex-grow">
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(question.id, { type: value as QuestionType })}
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
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        className="flex-grow"
                        placeholder="Enter question text"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`required-${question.id}`} className="text-sm">Required</Label>
                              <Switch
                                id={`required-${question.id}`}
                                checked={question.required}
                                onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
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
                            <Button variant="ghost" size="icon" onClick={() => duplicateQuestion(question.id)}>
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
                            <Button variant="ghost" size="icon" onClick={() => deleteQuestion(question.id)}>
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
                  {(question.type === 'select' || question.type === 'radio' || question.type === 'matrix') && (
                    <div className="ml-12 space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])]
                              newOptions[optionIndex] = e.target.value
                              updateQuestion(question.id, { options: newOptions })
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
                                  onClick={() => {
                                    const newOptions = question.options?.filter((_, i) => i !== optionIndex)
                                    updateQuestion(question.id, { options: newOptions })
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
                        onClick={() => {
                          const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
                          updateQuestion(question.id, { options: newOptions })
                        }}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Option
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Tabs defaultValue="common" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="common">Common Questions</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Questions</TabsTrigger>
            </TabsList>
            <TabsContent value="common" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => addQuestion('text')}>Add Text Question</Button>
                <Button onClick={() => addQuestion('select')}>Add Select Question</Button>
                <Button onClick={() => addQuestion('radio')}>Add Radio Question</Button>
                <Button onClick={() => addQuestion('scale')}>Add Scale Question</Button>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => addQuestion('emoji')}>Add Emoji Question</Button>
                <Button onClick={() => addQuestion('date')}>Add Date Question</Button>
                <Button onClick={() => addQuestion('file')}>Add File Upload</Button>
                <Button onClick={() => addQuestion('matrix')}>Add Matrix Question</Button>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <div className="px-6 py-4 border-t flex justify-end">
          <Button variant="default">
            <Check className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}










// import React, { useEffect, useState, useTransition } from 'react';
// import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Checkbox } from './checkbox';
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Smile, Meh, Frown, Angry, FrownIcon, Loader2 } from 'lucide-react';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { X, Plus, Trash2, Copy, FileDown, FileUp, Check } from 'lucide-react'

// type QuestionType = 'longtext' | 'select' | 'radio' | 'rating' | 'opinionscale' | 'matrix' | 'shorttext'


// import { Switch } from "@/components/ui/switch"

// interface Question {
//     id:string;
//     fieldName: string;
//     fieldType: QuestionType;
//     fieldLabel: string;
//     fieldDescription: string;
//     placeholder: string;
//     required: boolean;
//     options: Option[];
//   }




// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import FieldEdit from './updateanddelete';
// import { useRouter } from 'next/navigation';
// import { LoadingComp } from './loading';
// import { createForm } from '@/data/form';



// interface Option {
//     value: string;
//     label: string;
// }


// interface ModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     data: any;
//     onButtonClick: () => void;
//     maxRating?: number;
//     deleteField?: (index: number) => void;

// }

// const FieldCheckModal = ({ isOpen, onClose, data, onButtonClick, maxRating = 10, deleteField }: ModalProps) => {

//     const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
//     const [entireData, setEntireData] = useState<Question[]>(parsedData)
//     const [formData, setFormData] = useState(parsedData)
//     const [selectedRating, setSelectedRating] = useState(null);
//     const [selectedSmiley, setSelectedSmiley] = useState(null);
//     const [isPending, starttansition] = useTransition()
//     const [loading, setLoading] = useState(false)


//     const updateQuestion = (id: string, updates: Partial<Question>) => {
//         setEntireData(entireData.map(q => q.id === id ? { ...q, ...updates } : q))
//       }

//       const deleteQuestion = (id: string) => {
//         setEntireData(entireData.filter(q => q.id !== id))
//       }

//       const duplicateQuestion = (id: string) => {
//         const questionToDuplicate = entireData.find(q => q.id === id)
//         if (questionToDuplicate) {
//           const newQuestion = { ...questionToDuplicate, id: Date.now().toString() }
//           setEntireData([...entireData, newQuestion])
//         }
//       }


//     const route = useRouter();

//     console.log(typeof (data));

//     console.log("This is the newwwww", data);

//     console.log("Entire data", formData);




//     const onFieldUpdate = (value: any) => {

//         console.log("kdjabfus", value);



//         const myData = parsedData
//         console.log(myData);

//         console.log(typeof (myData));


//         setEntireData(myData)
//         console.log("Just checking", myData);
//         console.log("Just checking", entireData);

//         const updatedEntireData = { ...myData };

//         const fieldIndex = updatedEntireData.fields.findIndex(
//             (field: any) => field.fieldName === value.fieldName
//         );

//         console.log("fieldIndex", fieldIndex);


//         if (fieldIndex !== -1) {
//             const field = updatedEntireData.fields[fieldIndex];

//             console.log("field::", field);
//             console.log("value:::", value);








//             if (value.fieldLabel && field.fieldLabel) {
//                 field.fieldLabel = value.fieldLabel;

//             }
//             if (value.placeholder && field.placeholder) {
//                 field.placeholder = value.placeholder;
//             }

//             if (field.options && value.changeoptions) {
//                 console.log("Inside options", field.options);
//                 field.options = field.options.map((option: any) => {
//                     const changedOption = value.changeoptions.find((value: any) => option.value === value.value);
//                     if (changedOption) {
//                         console.log("This is option value", option.value);
//                         console.log("This is changeoption value", changedOption.value);
//                         return { ...option, label: changedOption.label };
//                     }
//                     return option;
//                 });
//             }

//             setEntireData(updatedEntireData);
//             console.log("Just checking 2", updatedEntireData);

//         }


//     };

//     const smileys = [
//         { icon: Smile, label: 'Very Good', color: 'text-yellow-400', selectedColor: 'text-yellow-600' },
//         { icon: Meh, label: 'Good', color: 'text-yellow-300', selectedColor: 'text-yellow-500' },
//         { icon: Frown, label: 'Neutral', color: 'text-orange-400', selectedColor: 'text-orange-600' },
//         { icon: FrownIcon, label: 'Bad', color: 'text-orange-500', selectedColor: 'text-orange-700' },
//         { icon: Angry, label: 'Very Bad', color: 'text-red-500', selectedColor: 'text-red-700' },
//     ];

//     const handleInputChange = (event: any) => {
//         const { name, value } = event.target
//         setFormData({
//             ...formData,
//             [name]: value
//         })
//     }
//     const handleSelectChange = (name: any, value: any) => {

//         setFormData({
//             ...formData,
//             [name]: value
//         })

//     }

//     const handleCheckBoxChange = (fieldName: any, itemName: any, value: any) => {

//         const list = formData?.[fieldName] ? formData?.[fieldName] : [];

//         if (value) {
//             list.push({
//                 label: itemName,
//                 value: value
//             })
//             setFormData({
//                 ...formData,
//                 [fieldName]: list
//             })
//         } else {
//             const result = list.filter((item: any) => item.label == itemName)
//             setFormData({
//                 ...formData,
//                 [fieldName]: result
//             })
//         }


//     }

//     const onFormSubmit = (event: any) => {
//         event.preventDefault()
//         setLoading(true)

//         console.log("I am the new", parsedData);
//         console.log(typeof (parsedData));

//         starttansition(() => {
//             createForm({
//                 jsonForm: JSON.stringify(parsedData),
//                 createdBy: 'someUserId'
//             })
//                 .then((data) => {
//                     console.log(data);
//                     setLoading(false)

//                     console.log("I am the ID", data.id);
//                     route.push('/editform/' + data.id);
//                 });
//         });

//     }

//     if (!formData) {
//         return (
//             <LoadingComp />
//         )
//     }
//     return (
//         <Dialog

//             open={isOpen}
//             onOpenChange={(open) => {
//                 if (!open) {
//                     onClose();
//                 }
//             }}
//             modal={true}
//         >
//             <DialogContent className="sm:max-w-screen-lg h-auto">
//                 <DialogHeader>
//                     <DialogTitle>Edit Form options</DialogTitle>
//                     <DialogClose asChild>

//                     </DialogClose>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4 ">
//                     <ScrollArea className="h-[550px] w-full ">
//                         <form onSubmit={onFormSubmit} className='border p-5 rounded-lg'  >

//                             <h2 className='font-bold text-center text-2xl'>
//                                 {parsedData?.formTitle}
//                             </h2>
//                             <h2 className='text-sm text-gray-500 text-center'>
//                                 {parsedData?.formDescription}
//                             </h2>


//                             {parsedData?.fields?.map((field: any, index: any) => (
//                                 <div key={index} className='flex items-center gap-2'>

// <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-2 flex-grow">
//                       <Select
//                         value={field.fieldType.toLowerCase()}
//                         onValueChange={(value) => updateQuestion(field.id, { fieldType: value as QuestionType })}
//                       >
//                         <SelectTrigger className="w-[180px]">
//                           <SelectValue placeholder="Select question type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="text">Text</SelectItem>
//                           <SelectItem value="select">Select</SelectItem>
//                           <SelectItem value="radio">Radio</SelectItem>
//                           <SelectItem value="scale">Scale</SelectItem>
//                           <SelectItem value="emoji">Emoji</SelectItem>
//                           <SelectItem value="date">Date</SelectItem>
//                           <SelectItem value="file">File Upload</SelectItem>
//                           <SelectItem value="matrix">Matrix</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <Input
//                         value={field.fieldLabel}
//                         onChange={(e) => updateQuestion(field.id, { fieldLabel: e.target.value })}
//                         className="flex-grow"
//                         placeholder="Enter question text"
//                       />
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <div className="flex items-center space-x-2">
//                               <Label htmlFor={`required-${field.id}`} className="text-sm">Required</Label>
//                               <Switch
//                                 id={`required-${field.id}`}
//                                 checked={field.required}
//                                 onCheckedChange={(checked) => updateQuestion(field.id, { required: checked })}
//                               />
//                             </div>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Toggle required</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button variant="ghost" size="icon" onClick={() => duplicateQuestion(field.id)}>
//                               <Copy className="h-4 w-4 text-gray-500" />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Duplicate question</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button variant="ghost" size="icon" onClick={() => deleteQuestion(field.id)}>
//                               <Trash2 className="h-4 w-4 text-red-500" />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Delete question</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>
//                   </div>


//                                     {
//                                         field.fieldType.toLowerCase() === "select" || field.fieldType.toLowerCase() === "dropdown" ?
//                                             <div className='my-3 w-full'>
//                                                 <label className='text-xs text-gray-500'>{field.fieldLabel}</label>


//                                                 <Select onValueChange={(v: string) => handleSelectChange(field.fieldName, v)}>
//                                                     <SelectTrigger className="w-full">
//                                                         <SelectValue placeholder={field.placeholder} />
//                                                     </SelectTrigger>
//                                                     <SelectContent>
//                                                         {field.options?.map((item: Option, optionIndex: number) => (
//                                                             <SelectItem key={optionIndex} value={item.value}>
//                                                                 {item.label}
//                                                             </SelectItem>
//                                                         ))}
//                                                     </SelectContent>
//                                                 </Select>

//                                             </div>

//                                             :



//                                             field.fieldType.toLowerCase() === "radio" ?

//                                                 <div className='my-3 w-full '>
//                                                     <label className='text-xs  text-gray-500'>{field.fieldLabel}</label>
//                                                     <RadioGroup defaultValue="option-one" className="pb-4 py-2" >

//                                                         {field.options.map((item: any, index: any) => (
//                                                             <div className="flex items-center space-x-2" key={index}>
//                                                                 <RadioGroupItem value={item.label} id={item.label} onClick={() => handleSelectChange(field.fieldName, item.label)} />
//                                                                 <Label htmlFor={item.label}>{item.label}</Label>
//                                                             </div>

//                                                         ))}




//                                                     </RadioGroup>



//                                                 </div>

//                                                 :





//                                                 field.fieldType.toLowerCase() === "checkbox" ?

//                                                     <div className='my-3 w-full '>
//                                                         <label className='text-xs text-gray-500 '>{field.fieldLabel}</label>

//                                                         {field?.options ? field?.options?.map((item: any, index: any) => (
//                                                             <div className='flex gap-3 items-center  ' key={index}>

//                                                                 <Checkbox onCheckedChange={(v) => handleCheckBoxChange(field.fieldLabel, item.label, v)} />

//                                                                 <h2>
//                                                                     {item.label}
//                                                                 </h2>

//                                                             </div>

//                                                         ))
//                                                             :
//                                                             <div className='flex gap-2 items-center'>
//                                                                 <Checkbox />
//                                                                 <h2>
//                                                                     {field.fieldLabel}

//                                                                 </h2>

//                                                             </div>

//                                                         }


//                                                     </div>

//                                                     :

//                                                     field.fieldType.toLowerCase() === "longtext" ? (
//                                                         <div className='my-3 w-full '>
//                                                             <label className='text-xs text-gray-500 '>{field.fieldLabel}</label>
//                                                             <Textarea onChange={(e) => handleInputChange(e)} type={field.type} placeholder={field.placeholder} name={field.name} />
//                                                         </div>
//                                                     ) :

//                                                         field.fieldType.toLowerCase() === "rating" ? (
//                                                             <div className='my-3 w-full '>
//                                                                 <label className='text-xs text-gray-500 '>{field.fieldLabel}</label>
//                                                                 <div className='flex gap-2 mt-1'>
//                                                                     {[...Array(maxRating)].map((_, index) => {
//                                                                         const number = index + 1;
//                                                                         return (
//                                                                             <Button
//                                                                                 key={number}
//                                                                                 variant={selectedRating === number ? "default" : "outline"}
//                                                                                 className={`h-8 w-8 p-0 text-sm hover:bg-blue-600 hover:text-white rounded-md
//               ${number === 1 ? 'rounded-l' : number === maxRating ? 'rounded-r' : ''}
//               ${selectedRating === number ? 'z-10' : ''}`}
//                                                                             >
//                                                                                 {number}
//                                                                             </Button>
//                                                                         );
//                                                                     })}
//                                                                 </div>
//                                                             </div>
//                                                         ) :


//                                                             field.fieldType.toLowerCase() === "opinionscale" ? (
//                                                                 <div className='my-3 w-full'>
//                                                                     <label className='text-xs text-gray-500'>{field.fieldLabel}</label>

//                                                                     <div className='flex gap-2 mt-2'>
//                                                                         {smileys.map((smiley, index) => (
//                                                                             <Button
//                                                                                 key={index}
//                                                                                 variant={selectedSmiley === index ? "default" : "outline"}
//                                                                                 className={`w-12 h-12 p-0 text-gray-400 hover:${smiley.color} ${selectedSmiley === index ? smiley.selectedColor : ''}`}

//                                                                             >
//                                                                                 <smiley.icon className="w-6 h-6" />
//                                                                             </Button>
//                                                                         ))}
//                                                                     </div>
//                                                                 </div>
//                                                             ) :

//                                                                 field.fieldType.toLowerCase() === "shorttext" ? (
//                                                                     <div className='my-3 w-full'>
//                                                                         <label className='text-xs text-gray-500'>{field.fieldLabel}</label>

//                                                                         <Input type={field.type} placeholder={field.placeholder} name={field.name} onChange={(e) => handleInputChange(e)} />

//                                                                     </div>
//                                                                 ) : null}

//                                     <div>
//                                         <FieldEdit defaultValue={field} onUpdate={(value) => onFieldUpdate?.(value)} deleteField={() => deleteField?.(index)} />

//                                     </div>






//                                 </div>


//                             ))}
//                             {/* <Button type='submit'>Perform Action</Button> */}

//                             <Button
//                                 className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white `}

//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <>
//                                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                         Processing...
//                                     </>
//                                 ) : (
//                                     'Generate AI form'
//                                 )}
//                             </Button>

//                         </form>
//                     </ScrollArea>



//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// };

// export default FieldCheckModal;








// {
//     field.fieldType.toLowerCase() === "select" || field.fieldType.toLowerCase() === "dropdown" ?
//         <div className='my-3 w-full'>
//             <label className='text-xs text-gray-500'>{field.fieldLabel}</label>


//             <Select onValueChange={(v: string) => handleSelectChange(field.fieldName, v)}>
//                 <SelectTrigger className="w-full">
//                     <SelectValue placeholder={field.placeholder} />
//                 </SelectTrigger>
//                 <SelectContent>
//                     {field.options?.map((item: Option, optionIndex: number) => (
//                         <SelectItem key={optionIndex} value={item.value}>
//                             {item.label}
//                         </SelectItem>
//                     ))}
//                 </SelectContent>
//             </Select>

//         </div>

//         :



//         field.fieldType.toLowerCase() === "radio" ?

//             <div className='my-3 w-full '>
//                 <label className='text-xs  text-gray-500'>{field.fieldLabel}</label>
//                 <RadioGroup defaultValue="option-one" className="pb-4 py-2" >

//                     {field.options.map((item: any, index: any) => (
//                         <div className="flex items-center space-x-2" key={index}>
//                             <RadioGroupItem value={item.label} id={item.label} onClick={() => handleSelectChange(field.fieldName, item.label)} />
//                             <Label htmlFor={item.label}>{item.label}</Label>
//                         </div>

//                     ))}




//                 </RadioGroup>



//             </div>

//             :





//             field.fieldType.toLowerCase() === "checkbox" ?

//                 <div className='my-3 w-full '>
//                     <label className='text-xs text-gray-500 '>{field.fieldLabel}</label>

//                     {field?.options ? field?.options?.map((item: any, index: any) => (
//                         <div className='flex gap-3 items-center  ' key={index}>

//                             <Checkbox onCheckedChange={(v) => handleCheckBoxChange(field.fieldLabel, item.label, v)} />

//                             <h2>
//                                 {item.label}
//                             </h2>

//                         </div>

//                     ))
//                         :
//                         <div className='flex gap-2 items-center'>
//                             <Checkbox />
//                             <h2>
//                                 {field.fieldLabel}

//                             </h2>

//                         </div>

//                     }


//                 </div>

//                 :

//                 field.fieldType.toLowerCase() === "longtext" ? (
//                     <div className='my-3 w-full '>
//                         <label className='text-xs text-gray-500 '>{field.fieldLabel}</label>
//                         <Textarea onChange={(e) => handleInputChange(e)} type={field.type} placeholder={field.placeholder} name={field.name} />
//                     </div>
//                 ) :

//                     field.fieldType.toLowerCase() === "rating" ? (
//                         <div className='my-3 w-full '>
//                             <label className='text-xs text-gray-500 '>{field.fieldLabel}</label>
//                             <div className='flex gap-2 mt-1'>
//                                 {[...Array(maxRating)].map((_, index) => {
//                                     const number = index + 1;
//                                     return (
//                                         <Button
//                                             key={number}
//                                             variant={selectedRating === number ? "default" : "outline"}
//                                             className={`h-8 w-8 p-0 text-sm hover:bg-blue-600 hover:text-white rounded-md
// ${number === 1 ? 'rounded-l' : number === maxRating ? 'rounded-r' : ''}
// ${selectedRating === number ? 'z-10' : ''}`}
//                                         >
//                                             {number}
//                                         </Button>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     ) :


//                         field.fieldType.toLowerCase() === "opinionscale" ? (
//                             <div className='my-3 w-full'>
//                                 <label className='text-xs text-gray-500'>{field.fieldLabel}</label>

//                                 <div className='flex gap-2 mt-2'>
//                                     {smileys.map((smiley, index) => (
//                                         <Button
//                                             key={index}
//                                             variant={selectedSmiley === index ? "default" : "outline"}
//                                             className={`w-12 h-12 p-0 text-gray-400 hover:${smiley.color} ${selectedSmiley === index ? smiley.selectedColor : ''}`}

//                                         >
//                                             <smiley.icon className="w-6 h-6" />
//                                         </Button>
//                                     ))}
//                                 </div>
//                             </div>
//                         ) :

//                             field.fieldType.toLowerCase() === "shorttext" ? (
//                                 <div className='my-3 w-full'>
//                                     <label className='text-xs text-gray-500'>{field.fieldLabel}</label>

//                                     <Input type={field.type} placeholder={field.placeholder} name={field.name} onChange={(e) => handleInputChange(e)} />

//                                 </div>
//                             ) : null}