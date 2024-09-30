'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from '@/components/ui/label'
import { getFormById, getFormResult, upsertLargeTextDataResult, updateFormResult } from '@/data/form'
import { LoadingComp } from '@/components/ui/loading'
import { ArrowUp, ArrowDown, Check } from 'lucide-react'
import EnhancedLoading from '@/components/ui/enhancedLoading'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface PreviewFormsAndEditProps {
    params: {
        formid: string
    }
}

interface FormData {
    [key: string]: any
}

interface SurveyData {
    formDescription: string
    formTitle: string
    backgroundImage: string
    fields: any[]
    customTheme: {
        backgroundColor: string
        textColor: string
        optionBackgroundColor: string
        optionTextColor: string
        optionBorderColor: string
        logoUrl: string
        theme: string
        font: string
        questionColor: string
        answerColor: string
        buttonColor: string
        buttonTextColor: string
        backgroundImage: string
        roundedCorners: string
        welcomeScreenSize: string
        questionSize: string
    }
}

interface FeedbackItem {
    [key: string]: string | string[] | number;
}

interface ParsedFormStructure {
    formTitle: string;
    formFields: {
        [key: string]: number[] | { [key: string]: number };
    };
}

interface FormStructure {
    formTitle: string;
    formFields: {
        [key: string]: {
            [key: string]: number;
        };
    };
}

interface ProcessFeedbackResult {
    updatedFormStructure: FormStructure;
    unmatchedFields: Record<string, string | string[] | number>;
}

type FormField = Record<string, number>

export default function Component({ params }: PreviewFormsAndEditProps) {
    const [surveyData, setSurveyData] = useState<SurveyData | null>(null)
    const [currentStep, setCurrentStep] = useState(-1)
    const [formData, setFormData] = useState<FormData>({})
    const [direction, setDirection] = useState(0)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [blinkingOption, setBlinkingOption] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getFormById(params.formid)
                if (typeof data?.jsonForm === 'string') {
                    setSurveyData(JSON.parse(data.jsonForm))
                } else {
                    console.error("jsonForm is not a string:", data?.jsonForm)
                }
            } catch (error) {
                console.error("Error fetching survey data:", error)
            }
        }

        fetchData()

        // Check if the user has already submitted the form
        const hasSubmitted = localStorage.getItem(`formSubmitted_${params.formid}`)
        if (hasSubmitted) {
            setIsSubmitted(true)
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [params.formid])

    const totalSteps = surveyData?.fields?.length ?? 0

    const handleStart = useCallback(() => {
        setDirection(1)
        setCurrentStep(0)
        setErrors({})
    }, [])

    const handleNext = useCallback(async () => {
        const currentField = surveyData?.fields[currentStep]

        if (!currentField) {
            console.error("Current field not found")
            return
        }

        if (currentField.required && !formData[currentField.fieldLabel]) {
            setErrors(prevErrors => ({ ...prevErrors, [currentField.fieldLabel]: 'This field is required' }))
            return
        }

        setErrors(prevErrors => {
            const newErrors = { ...prevErrors }
            delete newErrors[currentField.fieldLabel]
            return newErrors
        })

        if (currentStep < totalSteps - 1) {
            setDirection(1)
            setCurrentStep(prevStep => prevStep + 1)
        } else {
            try {
                const result = await getFormResult(params.formid)
                const parsedResult = JSON.parse(result.jsonResult)
                const finallydata = processFeedback(formData, parsedResult)

                await updateFormResult(params.formid, JSON.stringify(finallydata.updatedFormStructure))

                const arrayData = Object.values(finallydata.unmatchedFields) as string[]
                await upsertLargeTextDataResult(params.formid, arrayData)

                // Set the form as submitted in localStorage
                localStorage.setItem(`formSubmitted_${params.formid}`, 'true')
                setIsSubmitted(true)
            } catch (error) {
                console.error("Error processing survey completion:", error)
            }
        }
    }, [currentStep, formData, params.formid, surveyData, totalSteps])

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setDirection(-1)
            setCurrentStep(prevStep => prevStep - 1)
            setErrors({})
        }
    }, [currentStep])

    const handleInputChange = useCallback((fieldLabel: string, value: any, fieldType: string) => {
        setFormData(prevData => {
            const newData = { ...prevData, [fieldLabel]: value }
            console.log("Updated formData:", newData)
            return newData
        })
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors }
            delete newErrors[fieldLabel]
            return newErrors
        })

        setBlinkingOption(value)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            setBlinkingOption(null)
            if (['radio', 'select', 'rating', 'opinionscale'].includes(fieldType)) {
                handleNext()
            }
        }, 2000)
    }, [handleNext])

    const renderField = useCallback((field: any) => {
        const commonStyle = {
            width: '100%',
            backgroundColor: surveyData?.customTheme.optionBackgroundColor,
            color: surveyData?.customTheme.optionTextColor,
            border: `1px solid ${surveyData?.customTheme.optionBorderColor}`,
            borderRadius: surveyData?.customTheme.roundedCorners,
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
            transition: 'all 0.3s',
        }

        switch (field.fieldType.toLowerCase()) {
            case 'shorttext':
            case 'longtext':
            case 'text':
                return (
                    <Textarea
                        placeholder={field.placeholder}
                        onChange={(e) => handleInputChange(field.fieldLabel, e.target.value, field.fieldType)}
                        style={commonStyle}
                    />
                )
            
            case 'radio':
            case 'select':
            case 'checkbox':
            case 'multiselect':
                return (
                    <div className="space-y-2">
                        {field.options.map((option: any) => {
                            const isChecked = field.fieldType === 'checkbox' || field.fieldType === 'multiselect'
                                ? (formData[field.fieldLabel] || []).includes(option.value)
                                : formData[field.fieldLabel] === option.value
                            const isBlinking = blinkingOption === option.value
                            return (
                                <motion.div
                                    key={option.value}
                                    className='rounded-3xl'
                                    style={{
                                        ...commonStyle,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: isChecked ? surveyData?.customTheme.buttonColor : surveyData?.customTheme.optionBackgroundColor,
                                        color: isChecked ? surveyData?.customTheme.buttonTextColor : surveyData?.customTheme.optionTextColor,
                                    }}
                                    onClick={() => {
                                        if (field.fieldType === 'checkbox' || field.fieldType === 'multiselect') {
                                            const currentValues = formData[field.fieldLabel] || []
                                            const newValues = isChecked
                                                ? currentValues.filter((v: string) => v !== option.value)
                                                : [...currentValues, option.value]
                                            handleInputChange(field.fieldLabel, newValues, field.fieldType)
                                        } else {
                                            handleInputChange(field.fieldLabel, option.value, field.fieldType)
                                        }
                                    }}
                                    animate={isChecked && isBlinking ? {
                                        backgroundColor: [surveyData?.customTheme.buttonColor, surveyData?.customTheme.optionBackgroundColor, surveyData?.customTheme.buttonColor],
                                        color: [surveyData?.customTheme.buttonTextColor, surveyData?.customTheme.optionTextColor, surveyData?.customTheme.buttonTextColor]
                                    } : {}}
                                    transition={isChecked && isBlinking ? { duration: 2, repeat: Infinity, repeatType: 'reverse' } : {}}
                                >
                                    <span>{option.label}</span>
                                    {isChecked && <Check className="h-5 w-5" />}
                                </motion.div>
                            )
                        })}
                    </div>
                )
            case 'rating':
            case 'opinionscale':
                const maxValue = field.fieldType === 'rating' ? 5 : 10
                return (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', marginBottom: '0.75rem' }} className='items-center justify-center'>
                        {[...Array(maxValue)].map((_, index) => {
                            const number = index + 1
                            const isSelected = formData[field.fieldLabel] === number.toString()
                            const isBlinking = blinkingOption === number.toString()
                            return (
                                <motion.button
                                className="rounded-lg relative "
                                key={number}
                                onClick={() => handleInputChange(field.fieldLabel, number.toString(), field.fieldType)}
                                style={{
                                  height: '3rem',
                                  width: '3rem',
                                  borderRadius: surveyData?.customTheme.roundedCorners,
                                  backgroundColor: isSelected ? surveyData?.customTheme.buttonColor : surveyData?.customTheme.optionBackgroundColor,
                                  color: isSelected ? surveyData?.customTheme.buttonTextColor : surveyData?.customTheme.optionTextColor,
                                  border: `1px solid ${surveyData?.customTheme.optionBorderColor}`,
                                  transition: 'all 0.3s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                animate={isSelected && isBlinking ? {
                                  backgroundColor: [surveyData?.customTheme.buttonColor, surveyData?.customTheme.optionBackgroundColor, surveyData?.customTheme.buttonColor],
                                  color: [surveyData?.customTheme.buttonTextColor, surveyData?.customTheme.optionTextColor, surveyData?.customTheme.buttonTextColor]
                                } : {}}
                                transition={isSelected && isBlinking ? { duration: 2, repeat: Infinity, repeatType: 'reverse' } : {}}
                              >
                                <span style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  lineHeight: 1,
                                }}>
                                  {number}
                                </span>
                              </motion.button>
                            )
                        })}
                    </div>
                )
            default:
                return null
        }
    }, [formData, blinkingOption, handleInputChange, surveyData?.customTheme])

    const variants = {
        enter: (direction: number) => ({
            y: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            y: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            y: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    }

    const ProgressBar = useCallback(() => {
        const progress = ((currentStep) / (totalSteps - 1)) * 100

        return (
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: surveyData?.customTheme.buttonColor,
                    zIndex: 50,
                }}
                initial={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        )
    }, [currentStep, totalSteps, surveyData?.customTheme.buttonColor])

    function processFeedback(
        feedback: FeedbackItem,
        formStructure: FormStructure
    ): ProcessFeedbackResult {
        console.log("feedback", feedback);
        console.log("formStructure", formStructure);
        
        const updatedFormStructure = JSON.parse(JSON.stringify(formStructure)) as FormStructure
        const unmatchedFields: Record<string, string | string[] | number> = {}
    
        Object.entries(feedback).forEach(([key, value]) => {
            if (key in updatedFormStructure.formFields) {
                const field = updatedFormStructure.formFields[key]
    
                if (typeof field === 'object' && !Array.isArray(field)) {
                    if (Array.isArray(value)) {
                        // Handle multi-select questions
                        value.forEach((item) => {
                            if (item in field) {
                                field[item]++
                            } else {
                                if (!unmatchedFields[key]) {
                                    unmatchedFields[key] = []
                                }
                                (unmatchedFields[key] as string[]).push(item)
                            }
                        })
                    } else if (typeof value === 'string') {
                        if (value in field) {
                            // Handle single-select questions
                            field[value]++
                        } else if ('true' in field && 'false' in field) {
                            // Handle rating and opinion scale questions
                            const rating = parseInt(value, 10)
                            if (!isNaN(rating)) {
                                const maxRating = Object.keys(field).length
                                const index = Math.min(Math.max(1, rating), maxRating) - 1
                                const key = Object.keys(field)[index]
                                field[key]++
                            } else {
                                unmatchedFields[key] = value
                            }
                        } else {
                            // Handle text input questions
                            unmatchedFields[key] = value
                        }
                    } else {
                        unmatchedFields[key] = value
                    }
                } else {
                    unmatchedFields[key] = value
                }
            } else {
                unmatchedFields[key] = value
            }
        })
    
        return { updatedFormStructure, unmatchedFields }
    }

    if (!surveyData) {
        return <EnhancedLoading />
    }

    const backgroundStyle = surveyData.customTheme.backgroundImage
        ? { backgroundImage: `url('${surveyData.customTheme.backgroundImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: surveyData.customTheme.backgroundColor }

    if (isSubmitted) {
        return (
            <div
                style={{
                    ...backgroundStyle,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    color: surveyData.customTheme.textColor,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        backgroundColor: surveyData.customTheme.backgroundColor,
                        padding: '2rem',
                        borderRadius: surveyData.customTheme.roundedCorners,
                        textAlign: 'center',
                    }}
                >
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Thank you for submitting the form!</h1>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Please login or signup to clain your reward</h3>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <Button
                            onClick={() => router.push('/signin')}
                            style={{
                                backgroundColor: surveyData.customTheme.buttonColor,
                                color: surveyData.customTheme.buttonTextColor,
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => router.push('/signup')}
                            style={{
                                backgroundColor: surveyData.customTheme.buttonColor,
                                color: surveyData.customTheme.buttonTextColor,
                            }}
                        >
                            SignUp
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div
            style={{
                ...backgroundStyle,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                overflow: 'hidden',
                position: 'relative',
                color: surveyData.customTheme.textColor,
            }}
        >
            {currentStep > -1 && <ProgressBar />}
            {surveyData.customTheme.logoUrl && (
                <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                    <Image
                        src={surveyData.customTheme.logoUrl}
                        alt="Logo"
                        width={150}
                        height={50}
                        style={{ borderRadius: surveyData.customTheme.roundedCorners }}
                    />
                </div>
            )}
            <div style={{ width: '100%', maxWidth: '32rem' }}>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            y: { type: "spring", stiffness: 500, damping: 50 },
                            opacity: { duration: 0.5 }
                        }}
                        style={{ width: '100%' }}
                    >
                        {currentStep === -1 ? (
                            <motion.div
                                style={{
                                    maxWidth: '36rem',
                                    width: '100%',
                                    padding: '2rem',
                                    backgroundColor: surveyData.customTheme.backgroundColor,
                                    opacity: 0.95,
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: surveyData.customTheme.roundedCorners,
                                }}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.h1
                                    style={{
                                        fontSize: surveyData.customTheme.welcomeScreenSize === 'large' ? '2.5rem' : '2rem',
                                        fontWeight: 'bold',
                                        marginBottom: '1rem',
                                        color: surveyData.customTheme.textColor,
                                        textAlign: 'center',
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    {surveyData.formTitle}
                                </motion.h1>
                                <motion.p
                                    style={{
                                        marginBottom: '1.5rem',
                                        color: surveyData.customTheme.textColor,
                                        textAlign: 'center',
                                        fontSize: '1rem',
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    {surveyData.formDescription}
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    style={{ display: 'flex', justifyContent: 'center' }}
                                >
                                    <Button
                                        onClick={handleStart}
                                        style={{
                                            backgroundColor: surveyData.customTheme.buttonColor,
                                            color: surveyData.customTheme.buttonTextColor,
                                            fontWeight: 500,
                                            padding: '0.5rem 1rem',
                                            borderRadius: surveyData.customTheme.roundedCorners,
                                            transition: 'all 0.3s',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <span style={{ marginRight: '0.5rem' }}>Start Survey</span>
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div
                                style={{
                                    backgroundColor: surveyData.customTheme.backgroundColor,
                                    opacity: 0.95,
                                    backdropFilter: 'blur(8px)',
                                    padding: '2rem',
                                    borderRadius: surveyData.customTheme.roundedCorners,
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: surveyData.customTheme.questionSize === 'large' ? '2.5rem' : '2rem',
                                        fontWeight: 600,
                                        marginBottom: '1.5rem',
                                        color: surveyData.customTheme.questionColor,
                                        textAlign: 'center',
                                    }}
                                >
                                    {surveyData.fields[currentStep].fieldLabel}
                                </h2>
                                <p style={{
                                    marginBottom: '2rem',
                                    color: surveyData.customTheme.answerColor,
                                    textAlign: 'center',
                                    fontSize: '1.125rem',
                                }}>
                                    {surveyData.fields[currentStep].fieldDescription}
                                </p>
                                {renderField(surveyData.fields[currentStep])}
                                {errors[surveyData.fields[currentStep].fieldLabel] && (
                                    <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
                                        {errors[surveyData.fields[currentStep].fieldLabel]}
                                    </p>
                                )}
                                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        onClick={handleNext}
                                        style={{
                                            padding: '0.75rem 2rem',
                                            borderRadius: surveyData.customTheme.roundedCorners,
                                            backgroundColor: surveyData.customTheme.buttonColor,
                                            color: surveyData.customTheme.buttonTextColor,
                                            transition: 'all 0.3s',
                                            fontSize: '1.125rem',
                                        }}
                                    >
                                        {currentStep < totalSteps - 1 ? "Okay" : "Submit"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentStep > 0 && (
                    <Button
                        onClick={handlePrevious}
                        variant="outline"
                        style={{
                            padding: '0.5rem',
                            borderRadius: '9999px',
                            border: `2px solid ${surveyData.customTheme.buttonColor}`,
                            color: surveyData.customTheme.buttonColor,
                            transition: 'all 0.3s',
                        }}
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                )}
                {currentStep < totalSteps - 1 && currentStep >= 0 && (
                    <Button
                        onClick={handleNext}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: surveyData.customTheme.buttonColor,
                            color: surveyData.customTheme.buttonTextColor,
                            transition: 'all 0.3s',
                        }}
                    >
                        <ArrowDown className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    )
}