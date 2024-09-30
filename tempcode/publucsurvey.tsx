"use client"
import React, { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { fakeData } from '@/app/_data/Maindata';
import { Label } from '@/components/ui/label';
import {  getFormById, getFormResult, getLargeTextDataResult, upsertLargeTextDataResult, updateFormResult } from '@/data/form';
import { LoadingComp } from '@/components/ui/loading';
interface PreviewFormsAndEditProps {
    params: any;


}

interface FormData {
    [key: string]: any;
}
interface SurveyData {
    formDescription: any;
    formTitle: any;
    backgroundImage: any;
    fields: any[];
}





type FormField = Record<string, number>;
type FormStructure = {
  formTitle: string;
  formFields: Record<string, FormField | number[]>;
};
type FeedbackItem = Record<string, string | string[] | number>;

interface ProcessFeedbackResult {
  updatedFormStructure: FormStructure;
  unmatchedFields: Record<string, string | string[] | number>;
}





const PreviewFormsAndEdit = ({ params }: PreviewFormsAndEditProps) => {
    // const surveyData = fakeData
    // const [isPending, starttansition] = useTransition()
    const [formDataArray, setFormDataArray] = useState<FormData[]>([]);

    const [surveyData, setSurveyData] = useState<SurveyData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getFormById(params.formid);
                console.log("This is new d headache", data?.jsonForm);
                console.log(typeof (data?.jsonForm));

                if (typeof data?.jsonForm === 'string') {
                    setSurveyData(JSON.parse(data.jsonForm));
                } else {
                    console.error("jsonForm is not a string:", data?.jsonForm);
                }
            } catch (error) {
                console.error("Error fetching survey data:", error);
            }
        };

        fetchData();
    }, [params.formid]);

    const totalSteps = surveyData?.fields?.length ?? 0;


    const [currentStep, setCurrentStep] = useState(-1);
    const [formData, setFormData] = useState<FormData>({});

    const [formFields, setFormFields] = useState<FormStructure>();
    const [unmatchedFields, setUnmatchedFields] = useState<string[]>([]);


    const [direction, setDirection] = useState(1);
    const [selectedValue, setSelectedValue] = useState(null);
    const [selectedNumber, setSelectedNumber] = useState(null);

    // const handleNumberSelect = (fieldName: any, number: any) => {
    //     setSelectedNumber(number);
    //     handleInputChange(fieldName, number,field.fieldType);
    // };


    ;

    const handleStart = () => {
        setDirection(1);
        setCurrentStep(0);
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setDirection(1);
            setCurrentStep(currentStep + 1);
        } else {
            console.log("Survey completed", formData);
            

            getFormResult(params.formid)   
            .then((data) => {
               console.log(data);

            let finallydata = processFeedback(formData,JSON.parse(data.jsonResult))


            updateFormResult(params.formid,JSON.stringify(finallydata.updatedFormStructure)).then((data) => {
                console.log(data);
            })


            console.log("The reuslts sar",finallydata.updatedFormStructure);

            const arrayData = Object.values(finallydata.unmatchedFields) as string[];
            console.log(arrayData);

            upsertLargeTextDataResult(params.formid,arrayData).then((data) => {
                console.log(data);
            })
            

          

            
            

            })



            // createFormResult(params.formid,JSON.stringify(formData))   
            // .then((data) => {
            //    console.log(data);
            // })
            
            // Handle survey completion (e.g., submit data)
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleInputChange = (fieldName: string, value: any,fieldType:any) => {


        setFormData({ ...formData, [fieldName]: value });
    
    };

    function processFeedback(
        feedback: FeedbackItem,
        formStructure: FormStructure
      ): ProcessFeedbackResult {
        const updatedFormStructure = JSON.parse(JSON.stringify(formStructure)) as FormStructure;
        const unmatchedFields: Record<string, string | string[] | number> = {};
      
        Object.entries(feedback).forEach(([key, value]) => {
          if (key in updatedFormStructure.formFields) {
            const field = updatedFormStructure.formFields[key];
            if (Array.isArray(field)) {
              // Handle array fields (like overallRating)
              const rating = typeof value === 'string' ? parseInt(value, 10) : (value as number);
              if (!isNaN(rating) && rating >= 1 && rating <= field.length) {
                field[rating - 1]++;
              } else {
                unmatchedFields[key] = value;
              }
            } else if (typeof field === 'object') {
              // Handle object fields (like genre, instrumentation, mood, memorability)
              if (Array.isArray(value)) {
                // Handle array values (like memorability)
                value.forEach((item) => {
                  if (item in field) {
                    field[item]++;
                  } else {
                    if (!unmatchedFields[key]) {
                      unmatchedFields[key] = [];
                    }
                    (unmatchedFields[key] as string[]).push(item);
                  }
                });
              } else if (typeof value === 'string' && value in field) {
                field[value]++;
              } else {
                unmatchedFields[key] = value;
              }
            }
          } else {
            unmatchedFields[key] = value;
          }
        });
      
        return { updatedFormStructure, unmatchedFields };
      }

    const renderField = (field: any) => {
        switch (field.fieldType.toLowerCase()) {
            case 'shorttext':
                return (
                    <input
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.fieldName, e.target.value,field.fieldType)}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 transition-colors duration-300 placeholder-gray-500"
                    />
                );
            case 'longtext':
                return (
                    <textarea
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.fieldName, e.target.value,field.fieldType)}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 transition-colors duration-300 placeholder-gray-500"
                    />
                );
            case 'radio':
                return (
                    <RadioGroup onValueChange={(value) => handleInputChange(field.fieldName, value,field.fieldType)}>
                        {field.options.map((option: any) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={option.value} />
                                <label htmlFor={option.value}>{option.label}</label>
                            </div>
                        ))}
                    </RadioGroup>


                );
            case 'checkbox':
                return (
                    <div>
                        {field.options.map((option: any) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={option.value}
                                    onCheckedChange={(checked) => {
                                        const currentValues = formData[field.fieldName] || [];
                                        const newValues = checked
                                            ? [...currentValues, option.value]
                                            : currentValues.filter((v: string) => v !== option.value);
                                        handleInputChange(field.fieldName, newValues,field.fieldType);
                                    }}
                                />
                                <label htmlFor={option.value}>{option.label}</label>
                            </div>
                        ))}
                    </div>
                );
            case 'dropdown':

            case 'select':
                return (
                    <Select onValueChange={(value) => handleInputChange(field.fieldName, value,field.fieldType)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options.map((option: any) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'rating':
            case 'opinionscale':
                return (
                    // <Slider
                    //     min={0}
                    //     max={10}
                    //     step={1}
                    //     onValueChange={(value) => handleInputChange(field.fieldName, value[0])}
                    // />

                    <div className='my-3 w-full'>
                        <RadioGroup
                            onValueChange={(value) => handleInputChange(field.fieldName, value,field.fieldType)}
                            className='flex gap-2 mt-1'
                        >
                            {[...Array(10)].map((_, index) => {
                                const number = index + 1;
                                return (
                                    <div key={number} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={number.toString()}
                                            id={`${field.fieldName}-${number}`}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={`${field.fieldName}-${number}`}
                                            className="h-12 w-12 rounded-md border border-gray-200 flex items-center justify-center text-sm peer-data-[state=checked]:bg-blue-600 peer-data-[state=checked]:text-white hover:bg-blue-600 hover:text-white cursor-pointer"
                                        >
                                            {number}
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>
                );
            default:
                return null;
        }
    };

    const variants = {
        enter: (direction: number) => {
            return {
                y: direction > 0 ? 1000 : -1000,
                opacity: 1
            };
        },
        center: {
            zIndex: 1,
            y: 0,
            opacity: 1
        },
        exit: (direction: number) => {
            return {
                zIndex: 0,
                y: direction < 0 ? 1000 : -1000,
                opacity: 1
            };
        }
    };

    const initialVariants = {
        hidden: { y: '100%', opacity: 2 },
        visible: {
            y: 1,
            opacity: 1,
            transition: {
                type: 'tween',
                ease: 'easeInOut',
                duration: 1.5
            }
        }
    };

    const ProgressBar = () => {
        const progress = ((currentStep + 1) / totalSteps) * 100;


        if (!surveyData) {
            return (
                <LoadingComp />
              )
          }

        return (

            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50"
                initial={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                }}
            />

        );
    };

    if (currentStep === -1) {
        if (!surveyData) {
            return (
                <LoadingComp />
              )
          }
        return (
            <>
                <div className="flex items-center justify-center h-screen" style={surveyData.backgroundImage ? { backgroundImage: `url('${surveyData.backgroundImage}')` } : {}}
                >
                    <div

                        className="max-w-2xl  w-full p-6 bg-gray-100 rounded-lg"
                    >
                        <h1 className="text-2xl font-bold mb-4">{surveyData.formTitle}</h1>
                        <p className="mb-4">{surveyData.formDescription}</p>
                        <p className="mb-6">Duration: 2 minutes</p>
                        <Button onClick={handleStart}>Start</Button>
                    </div>
                </div>
            </>
        );
    }

    const currentField = surveyData?.fields?.[currentStep] ;

    if (!surveyData) {
        return (
            <LoadingComp />
          )
      }

    return (
        <>
            <ProgressBar />
            <div style={surveyData.backgroundImage ? { backgroundImage: `url('${surveyData.backgroundImage}')` } : {}}>
                <AnimatePresence custom={direction} initial={false}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 80 },
                            opacity: { duration: 0.7 },
                            duration: 1,
                            ease: [0.50, 1, 0.6, 0.46]
                        }}
                        className='slide-in'
                    >
                        <motion.div
                            className="flex items-center justify-center h-screen"

                            initial="hidden"
                            animate="visible"
                            variants={initialVariants}
                        >
                            <div className="max-w-2xl w-full p-6 bg-gray-100 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2">{currentField.fieldLabel}</h2>
                                <p className="mb-4">{currentField.fieldDescription}</p>
                                {renderField(currentField)}
                                <div className="mt-4 flex  ">
                                    {currentStep > 0 && (
                                        <Button onClick={handlePrevious} className='mr-4'>Previous</Button>
                                    )}
                                    <Button onClick={handleNext}>
                                        {currentStep < totalSteps - 1 ? "Next" : "Submit"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

        </>
    );
}

export default PreviewFormsAndEdit;