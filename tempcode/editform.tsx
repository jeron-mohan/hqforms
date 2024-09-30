"use client"
import { fakeData, newImagefromUnsplash } from "@/app/_data/Maindata";
import { useEffect, useState, useTransition } from "react";

import * as React from "react"

import { Button } from "@/components/ui/button"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Label } from "@/components/ui/label"
import {  Copy } from 'lucide-react';

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import ImageGallery from "@/components/ui/imageGallery";
import { Loader2, RocketIcon, Send, SendHorizonal } from "lucide-react";
import { createForm, getFormById, updateForm, createFormResult } from "@/data/form";
import { LoadingComp } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
interface ImageData {
    url: string;
    alt?: string;
    width: number;
    height: number;
}

interface PostData {
    jsonForm: string;


}

interface Field {
    fieldName: string;
    fieldType: string;
    fieldLabel: string;
    fieldDescription: string;
    placeholder?: string;
    required: boolean;
    options?: { value: string; label: string }[];
}
const formJson = fakeData
interface FormData {
    formTitle: string;
    formDescription: string;
    formName: string;
    fields: Field[];
    backgroundImage?: string;
}
interface PreviewFormsAndEditProps {
    params: any;
}

interface TransformedFormData {
    formTitle: string;
    formFields: {
        [key: string]: TransformedField;
    };
}

type TransformedField = { [key: string]: number } | number[];


interface SurveyData {
    formTitle: string;
    formDescription: string;
    formName: string;
    fields: Field[];
    backgroundImage?: string;
}
const useCopyToClipboard = () => {
    const [copied, setCopied] = useState(false);
  
    const copy = async (text: string) => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard not supported');
        return false;
      }
  
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        return true;
      } catch (error) {
        console.warn('Copy failed', error);
        setCopied(false);
        return false;
      }
    };
  
    return { copied, copy };
  };

const EditFormBackground = ({ params }: PreviewFormsAndEditProps) => {

    const [formData, setFormData] = useState<SurveyData | null>(null);

    const [loading, setLoader] = useState(false)
    const [showAlert, setShowAlert] = useState(false);
    const [formLink, setFormLink] = useState('');
    const { copied, copy } = useCopyToClipboard();

    const handleCopy = async () => {
        const success = await copy(formLink);
        if (success) {
            console.log("Copied");
            
          }
        
      };

    // const [formData, setFormData] = useState<FormData>(formJson);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getFormById(params.formid);
                console.log("This is new headache", data?.jsonForm);
                console.log(typeof (data?.jsonForm));

                if (typeof data?.jsonForm === 'string') {
                    setFormData(JSON.parse(data.jsonForm));
                } else {
                    console.error("jsonForm is not a string:", data?.jsonForm);
                }
            } catch (error) {
                console.error("Error fetching survey data:", error);
            }
        };

        fetchData();
    }, [params.formid]);

    const [images, setImages] = useState<ImageData[]>([]);
    const [image, setImage] = useState("")
    const [isPending, starttansition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")




    useEffect(() => {
        // Simulate fetching images from an API
        const fetchImages = async () => {
            // Replace this with your actual image fetching logic

            setImages(newImagefromUnsplash);

        };

        fetchImages();
    }, [image]);



    const [selectedField, setSelectedField] = useState(null);

    const saveForm = async () => {
        setLoader(true)
        
        console.log(formData);
        try {
            const postInDb: PostData = {
                jsonForm: JSON.stringify(formData),


            };

            console.log("Inside");

            starttansition(() => {
                updateForm(params.formid, postInDb)
                    .then((data) => {
                        console.log(data);
                        setShowAlert(true);
                        setFormLink("http://localhost:3000/forms/"+params.formid);

                        setLoader(false)
                        //    setError(data.error)
                        // setSuccess(data.success)

                        console.log("I am the ID", data.id);

                        let transformedData = transformFormData(formData)
                        console.log("This is the transformers bro", transformedData);

                        createFormResult(data.id, JSON.stringify(transformedData)).then((data) => {
                            console.log(data);

                        })




                    })



            })

            // const newForm = await createForm(postInDb);

        } catch (error) {
            setLoader(true)
            setShowAlert(true);


            console.error('Error saving form:', error);
        }

    }


    const transformFormData = (data: SurveyData | null): TransformedFormData | null => {
        if (!data) return null;

        const transformedData: TransformedFormData = {
            formTitle: data.formTitle,
            formFields: {},
        };

        data.fields.forEach((field) => {
            if (['dropdown', 'select', 'radio', 'checkbox'].includes(field.fieldType.toLowerCase())) {
                transformedData.formFields[field.fieldName] = {};
                field.options?.forEach((option) => {
                    (transformedData.formFields[field.fieldName] as { [key: string]: number })[option.value] = 0;
                });
            } else if (field.fieldType.toLowerCase() === 'rating' || field.fieldType.toLowerCase() === 'opinionscale') {
                transformedData.formFields[field.fieldName] = Array.from({ length: 11 }, () => 0);
            }
        });

        return transformedData;
    };


    const handleFieldSelect = (index: any, field: any) => {
        console.log("Insideee the fiels", index);
        console.log("Insideee the fiels1", field);



        setSelectedField(index);
    };
    const handleImageClick = (imageUrl: string) => {
        console.log("This is imgURL", imageUrl);

        setFormData(prevData => {
            if (prevData === null) {
                // Handle the case where prevData is null
                return {
                    backgroundImage: imageUrl,
                    formTitle: '',
                    formDescription: '',
                    formName: '',
                    fields: []
                };
            }
            return {
                ...prevData,
                backgroundImage: imageUrl
            };
        });
        console.log(formData);
    };

    // const handleFieldUpdate = (index: any, updatedField: any) => {
    //     const updatedFields = [...formData.fields];
    //     updatedFields[index] = updatedField;
    //     setFormData({ ...formData, fields: updatedFields });
    // };

    const renderFieldPreview = (field: any, index: any) => {

       

        if (!formData) {
            return (
                <LoadingComp />
            )
        }
        return (
            <div className="hover:border-l-2 hover:border-blue-500"
                key={index}>
                {
                    field.fieldType.toLowerCase() === "checkbox" ?
                        <div
                            onClick={() => handleFieldSelect(index, field)}
                            key={index}
                            className="flex items-center space-x-4 max-w-lg mx-auto p-2 cursor-pointer"
                        >
                            <div className="text-sm font-bold text-gray-800 pointer-events-none">{index + 1}</div>
                            <div
                                className="bg-white text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat"
                                style={formData.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}}
                            >
                                {/* <div className="bg-white text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none"> */}
                                {/* <div 
  className="bg-white text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('https://images.unsplash.com/23/pink-sky.JPG?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }} >*/}
                                <div className="p-3 w-44  bg-gray-100 pointer-events-none">
                                    <p className="text-[7px] font-bold pointer-events-none">{field.fieldLabel}</p>
                                    <p className="text-[5px] pointer-events-none">{field.fieldDescription}</p>
                                    <div className="mt-2">

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="terms" className="h-3 w-3" />
                                            <label
                                                htmlFor="terms"
                                                className="text-[7px] "
                                            >
                                                Accept terms and conditions
                                            </label>
                                        </div>


                                    </div>

                                </div>
                            </div>
                        </div> :
                        field.fieldType.toLowerCase() === "radio" ?
                            <div
                                onClick={() => handleFieldSelect(index, field)}
                                key={index}
                                className="flex items-center space-x-4 max-w-lg mx-auto p-2 cursor-pointer"
                            >
                                <div className="text-sm font-bold text-gray-800 pointer-events-none">{index + 1}</div>
                                <div className="bg-white text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat" style={formData.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}}>
                                    <div className="p-3 w-44 bg-gray-100 pointer-events-none">
                                        <p className="text-[7px] font-bold pointer-events-none">{field.fieldLabel}</p>
                                        <p className="text-[5px] pointer-events-none">{field.fieldDescription}</p>
                                        <div className="mt-2">

                                            <RadioGroup defaultValue="option-one" className="space-y-0.1">
                                                <div className="flex items-center space-x-1">
                                                    <RadioGroupItem value="option-one" id="option-one" className="h-2 w-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                                    <Label htmlFor="option-one" className="text-[8px] cursor-pointer">Option One</Label>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <RadioGroupItem value="option-two" id="option-two" className="h-2 w-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                                    <Label htmlFor="option-two" className="text-[8px] cursor-pointer">Option Two</Label>
                                                </div>
                                            </RadioGroup>


                                        </div>

                                    </div>
                                </div>
                            </div>
                            :
                            field.fieldType.toLowerCase() === "select" ?
                                <div
                                    onClick={() => handleFieldSelect(index, field)}
                                    key={index}
                                    className="flex items-center space-x-4 max-w-lg mx-auto p-2 cursor-pointer"
                                >
                                    <div className="text-sm font-bold text-gray-800 pointer-events-none">{index + 1}</div>
                                    <div className="bg-white text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat" style={formData.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}}>
                                        <div className="p-3 w-44 bg-gray-100 pointer-events-none">
                                            <p className="text-[7px] font-bold pointer-events-none">{field.fieldLabel}</p>
                                            <p className="text-[5px] pointer-events-none">{field.fieldDescription}</p>
                                            <div className="mt-2">

                                                <Select >
                                                    <SelectTrigger className="w-24 h-6 text-[6px]">
                                                        <SelectValue placeholder={field.fieldDescription} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="light" className="text-xs py-1">Light</SelectItem>
                                                        <SelectItem value="dark" className="text-xs py-1">Dark</SelectItem>
                                                        <SelectItem value="system" className="text-xs py-1">System</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                :
                                field.fieldType.toLowerCase() === "opinionscale" ?
                                    <div
                                        onClick={() => handleFieldSelect(index, field)}
                                        key={index}
                                        className="flex items-center space-x-4 max-w-lg mx-auto p-2 cursor-pointer"
                                    >
                                        <div className="text-sm font-bold text-gray-800 pointer-events-none">{index + 1}</div>
                                        <div className="bg-white text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat" style={formData.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}}>
                                            <div className="p-3 w-44 bg-gray-100 pointer-events-none">
                                                <p className="text-[7px] font-bold pointer-events-none">{field.fieldLabel}</p>
                                                <p className="text-[5px] pointer-events-none">{field.fieldDescription}</p>
                                                <div className='flex gap-2 mt-2'>
                                                    {[...Array(10)].map((_, index) => {
                                                        const number = index + 1;
                                                        return (
                                                            <Button
                                                                key={number}
                                                                variant="outline"
                                                                className={`h-full w-full p-0 text-[4px] hover:bg-blue-600 hover:text-white rounded-md`}
                                                            >
                                                                {number}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    field.fieldType.toLowerCase() === "rating" ? <div
                                        onClick={() => handleFieldSelect(index, field)}
                                        key={index}
                                        className="flex items-center space-x-4 max-w-lg mx-auto p-2 cursor-pointer"
                                    >
                                        <div className="text-sm font-bold text-gray-800 pointer-events-none">{index + 1}</div>
                                        <div className="bg-white text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat" style={formData.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}}>
                                            <div className="p-3 w-44 bg-gray-100 pointer-events-none">
                                                <p className="text-[7px] font-bold pointer-events-none">{field.fieldLabel}</p>
                                                <p className="text-[5px] pointer-events-none">{field.fieldDescription}</p>
                                                <div className='flex gap-2 mt-2'>
                                                    {[...Array(10)].map((_, index) => {
                                                        const number = index + 1;
                                                        return (
                                                            <Button
                                                                key={number}
                                                                variant="outline"
                                                                className={`h-full w-full p-0 text-[4px] hover:bg-blue-600 hover:text-white rounded-md`}
                                                            >
                                                                {number}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        :

                                        (field.fieldType.toLowerCase() === "shorttext" || field.fieldType.toLowerCase() === "longtext") &&

                                        <div
                                            onClick={() => handleFieldSelect(index, field)}
                                            key={index}
                                            className="flex items-center space-x-4 max-w-lg mx-auto p-2 cursor-pointer"
                                        >
                                            <div className=" text-sm font-bold text-gray-800 pointer-events-none">{index + 1}</div>
                                            <div className="bg-white  text-black p-6 h-[150px] rounded-lg flex-grow flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat" style={formData.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}}>
                                                <div className="p-3 w-44 bg-gray-100 pointer-events-none">
                                                    <p className="text-[7px] font-bold pointer-events-none">{field.fieldLabel}</p>
                                                    <p className="text-[5px] pointer-events-none">{field.fieldDescription}</p>
                                                    <input
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-0.5 text-xs transition-colors duration-300 placeholder:text-[7px] placeholder:text-gray-400 h-6 pointer-events-none"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>



                }
            </div>
            // <div 
            //   key={index}
            //   className={`p-4 border rounded mb-2 cursor-pointer ${selectedField === index ? 'bg-blue-100' : ''}`}
            //   onClick={() => handleFieldSelect(index)}
            // ><small>{index+1}</small>
            //   <h3 className="font-bold">{field.fieldLabel}</h3>
            //   <p className="text-sm text-gray-600">{field.fieldType}</p>
            // </div>
        );
    };

    const renderFieldEditor = () => {
        console.log("This i scheksoon", formData);
        console.log("Seluuu", selectedField);

        if (!formData) {
            return (
                <LoadingComp />
            )
        }
        if (selectedField === null) return (

            <div className="flex items-center justify-center bg-cover bg-center bg-no-repeat  border rounded-lg h-[650px]" style={formData?.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}}>

                <div className="max-w-2xl w-full p-6 bg-gray-100 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">{formData?.formTitle}</h2>
                    <p className="mb-4">{formData?.formDescription}</p>


                </div>

            </div>)
        const field = formData?.fields?.[selectedField];
        if (!formData) {
            return (
                <LoadingComp />
            )
        }

        return (

            // <div className="border h-[650px] bg-cover bg-center bg-no-repeat  p-4 rounded-lg"  style={{ backgroundImage: "url('https://images.unsplash.com/23/pink-sky.JPG?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
            <div className="border h-[650px] bg-cover bg-center bg-no-repeat  p-4 rounded-lg" style={formData?.backgroundImage ? { backgroundImage: `url('${formData.backgroundImage}')` } : {}} >

                {
                    field?.fieldType.toLowerCase() === "select" ?

                        <div className="flex items-center justify-center h-full">
                            <div className="max-w-2xl w-full p-6 bg-gray-100 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2">{field.fieldLabel}</h2>
                                <p className="mb-4">{field.fieldDescription}</p>
                                <div className='my-3 w-full'>
                                    <Select >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options && field.options.length > 0 ? (
                                                field.options.map((option: any) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))) : (
                                                <p>No options available</p>
                                            )}

                                        </SelectContent>
                                    </Select>

                                </div>

                                <div className="mt-4 flex  ">
                                    <Button className='mr-4'>Previous</Button>

                                    <Button >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div> :


                        field?.fieldType.toLowerCase() === "radio" ?

                            <div className="flex items-center justify-center h-full">
                                <div className="max-w-2xl w-full p-6 bg-gray-100 rounded-lg">
                                    <h2 className="text-xl font-semibold mb-2">{field.fieldLabel}</h2>
                                    <p className="mb-4">{field.fieldDescription}</p>
                                    <div className='my-3 w-full'>
                                        <RadioGroup >
                                            {field.options && field.options.length > 0 ? (
                                                field.options.map((option: any) => (
                                                    <div key={option.value} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={option.value} id={option.value} />
                                                        <label htmlFor={option.value}>{option.label}</label>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No options available</p>
                                            )}
                                        </RadioGroup>

                                    </div>

                                    <div className="mt-4 flex  ">
                                        <Button className='mr-4'>Previous</Button>

                                        <Button >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div> :
                            field?.fieldType.toLowerCase() === "checkbox" ?

                                <div className="flex items-center justify-center h-full">
                                    <div className="max-w-2xl w-full p-6 bg-gray-100 rounded-lg">
                                        <h2 className="text-xl font-semibold mb-2">{field.fieldLabel}</h2>
                                        <p className="mb-4">{field.fieldDescription}</p>
                                        <div className='my-3 w-full'>
                                            {field.options && field.options.length > 0 ? (
                                                field.options.map((option: any) => (
                                                    <div key={option.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={option.value}

                                                        />
                                                        <label htmlFor={option.value}>{option.label}</label>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No options available</p>
                                            )}

                                        </div>

                                        <div className="mt-4 flex  ">
                                            <Button className='mr-4'>Previous</Button>

                                            <Button >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                :
                                (field?.fieldType.toLowerCase() === "rating" || field?.fieldType.toLowerCase() === "opinionscale") ?

                                    <div className="flex items-center justify-center h-full">
                                        <div className="max-w-2xl w-full p-6 bg-gray-100 rounded-lg">
                                            <h2 className="text-xl font-semibold mb-2">{field.fieldLabel}</h2>
                                            <p className="mb-4">{field.fieldDescription}</p>
                                            <div className='my-3 w-full'>
                                                <RadioGroup

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

                                            <div className="mt-4 flex  ">
                                                <Button className='mr-4'>Previous</Button>

                                                <Button >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </div> :

                                    (field?.fieldType.toLowerCase() === "shorttext" || field?.fieldType.toLowerCase() === "longtext") &&

                                    <div className="flex items-center justify-center h-full">
                                        <div className="max-w-2xl w-full p-6 bg-gray-100 rounded-lg">
                                            <h2 className="text-xl font-semibold mb-2">{field.fieldLabel}</h2>
                                            <p className="mb-4">{field.fieldDescription}</p>
                                            <input
                                                placeholder={field.placeholder}

                                                className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 transition-colors duration-300 placeholder-gray-500"
                                            />
                                            <div className="mt-4 flex  ">


                                                <Button >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                }
            </div>
        );
    };

    if (!formData) {
        return (
            <LoadingComp />
        )
    }

    return (
        <div className="flex h-screen">
            {/* Left sidebar */}
            <div className="w-1/4 bg-gray-100 p-4 ">
                <ScrollArea className="h-full  rounded-md border p-3">
                    <div className="p-5 ml-3 mr-[-7px]">
                        <Button className="w-full">+ Add fields</Button>

                    </div>

                    {formData?.fields.map((field, index) => renderFieldPreview(field, index))}

                </ScrollArea >
            </div>

            {/* Main content area */}
            <div className="w-full p-4 overflow-y-auto mt-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{formData?.formTitle}</h1>
                        <p className="text-gray-600">{formData?.formDescription}</p>
                    </div>
                    {/* <Button onClick={saveForm} className="ml-4 mt-3">Publish <SendHorizonal className="ml-2 w-4 h-4" /></Button> */}
                    <Button
                        className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white `}
                        onClick={saveForm}
                        disabled={loading}
                    ><SendHorizonal className="mr-2 w-4 h-4" />
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Publish'
                        )}
                    </Button>
                    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Form Published Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your form has been published. You can share it using the link below:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={formLink} readOnly />
            <Button onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
<div>
            <Button onClick={()=>{
                    window.open('http://localhost:3000/forms/'+params.formid, '_blank', 'noopener,noreferrer');

            }}>
              
              Open in a new tab
            </Button>
            </div>

          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

                   
                </div>
                {renderFieldEditor()}
            </div>

            <div className="w-1/6 bg-gray-100 rounded-md p-4">
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Image Gallery</h1>
                    <ImageGallery images={images} onImageClick={handleImageClick} />
                </div>
            </div>



        </div>
    );
};
export default EditFormBackground;