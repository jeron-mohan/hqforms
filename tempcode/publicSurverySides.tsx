'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from '@/components/ui/label'
import { getFormById, getFormResult, upsertLargeTextDataResult, updateFormResult } from '@/data/form'
import { LoadingComp } from '@/components/ui/loading'
import { CheckIcon } from 'lucide-react'

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
}

type FormField = Record<string, number>
type FormStructure = {
  formTitle: string
  formFields: Record<string, FormField | number[]>
}
type FeedbackItem = Record<string, string | string[] | number>

interface ProcessFeedbackResult {
  updatedFormStructure: FormStructure
  unmatchedFields: Record<string, string | string[] | number>
}

const PreviewFormsAndEdit: React.FC<PreviewFormsAndEditProps> = ({ params }) => {
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null)
  const [currentStep, setCurrentStep] = useState(-1)
  const [formData, setFormData] = useState<FormData>({})
  const [direction, setDirection] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
  }, [params.formid])

  const totalSteps = surveyData?.fields?.length ?? 0

  const handleStart = () => {
    setDirection(1)
    setCurrentStep(0)
  }

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      const currentField = surveyData?.fields[currentStep]
      if (currentField.required && !formData[currentField.fieldName]) {
        setErrors({ [currentField.fieldName]: 'This field is required' })
        return
      }
      setDirection(1)
      setCurrentStep(currentStep + 1)
      setErrors({})
    } else {
      console.log("Survey completed", formData)
      try {
        const result = await getFormResult(params.formid)
        const finallydata = processFeedback(formData, JSON.parse(result.jsonResult))
        await updateFormResult(params.formid, JSON.stringify(finallydata.updatedFormStructure))
        const arrayData = Object.values(finallydata.unmatchedFields) as string[]
        await upsertLargeTextDataResult(params.formid, arrayData)
      } catch (error) {
        console.error("Error processing survey completion:", error)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
    setErrors({})
  }

  function processFeedback(
    feedback: FeedbackItem,
    formStructure: FormStructure
  ): ProcessFeedbackResult {
    const updatedFormStructure = JSON.parse(JSON.stringify(formStructure)) as FormStructure
    const unmatchedFields: Record<string, string | string[] | number> = {}

    Object.entries(feedback).forEach(([key, value]) => {
      if (key in updatedFormStructure.formFields) {
        const field = updatedFormStructure.formFields[key]
        if (Array.isArray(field)) {
          const rating = typeof value === 'string' ? parseInt(value, 10) : (value as number)
          if (!isNaN(rating) && rating >= 1 && rating <= field.length) {
            field[rating - 1]++
          } else {
            unmatchedFields[key] = value
          }
        } else if (typeof field === 'object') {
          if (Array.isArray(value)) {
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
          } else if (typeof value === 'string' && value in field) {
            field[value]++
          } else {
            unmatchedFields[key] = value
          }
        }
      } else {
        unmatchedFields[key] = value
      }
    })

    return { updatedFormStructure, unmatchedFields }
  }

  const renderField = (field: any) => {
    const commonClasses = `w-full bg-[#E6F3F7] text-[#1E3A8A] border-2 border-transparent focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] rounded-xl py-3 px-4 transition-all duration-300 mb-2`
    
    switch (field.fieldType.toLowerCase()) {
      case 'shorttext':
        return (
          <Input
            placeholder={field.placeholder}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
            className={commonClasses}
          />
        )
      case 'longtext':
        return (
          <Textarea
            placeholder={field.placeholder}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
            className={commonClasses}
          />
        )
      case 'radio':
      case 'checkbox':
      case 'multiselect':
      case 'select':
        return (
          <div className="space-y-2">
            {field.options.map((option: any) => {
              const isChecked = field.fieldType.toLowerCase() === 'radio'
                ? formData[field.fieldName] === option.value
                : (formData[field.fieldName] || []).includes(option.value)
              return (
                <div
                  key={option.value}
                  className={`flex items-center justify-between ${commonClasses} cursor-pointer ${isChecked ? 'bg-[#3B82F6] text-white' : ''}`}
                  onClick={() => {
                    if (field.fieldType.toLowerCase() === 'radio') {
                      handleInputChange(field.fieldName, option.value)
                    } else {
                      const currentValues = formData[field.fieldName] || []
                      const newValues = isChecked
                        ? currentValues.filter((v: string) => v !== option.value)
                        : [...currentValues, option.value]
                      handleInputChange(field.fieldName, newValues)
                    }
                  }}
                >
                  <span>{option.label}</span>
                  {isChecked && <CheckIcon className="h-5 w-5" />}
                </div>
              )
            })}
          </div>
        )
      case 'rating':
      case 'opinionscale':
        return (
          <div className='my-3 w-full flex gap-2'>
            {[...Array(10)].map((_, index) => {
              const number = index + 1
              const isSelected = formData[field.fieldName] === number.toString()
              return (
                <Button
                  key={number}
                  onClick={() => handleInputChange(field.fieldName, number.toString())}
                  className={`h-12 w-12 rounded-md ${isSelected ? 'bg-[#3B82F6] text-white' : 'bg-[#E6F3F7] text-[#1E3A8A]'} hover:bg-[#3B82F6] hover:text-white transition-all duration-300`}
                >
                  {number}
                </Button>
              )
            })}
          </div>
        )
      default:
        return null
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }

  const ProgressBar = () => {
    const progress = ((currentStep) / (totalSteps - 1)) * 100

    return (
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-[#3B82F6] z-50"
        initial={{ width: `${progress}%` }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    )
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A]">
        <LoadingComp />
      </div>
    )
  }

  const backgroundStyle = surveyData.backgroundImage
    ? { backgroundImage: `url('${surveyData.backgroundImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)' }

  if (currentStep === -1) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={backgroundStyle}
      >
        <motion.div 
          className="max-w-2xl w-full p-8 bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6 text-[#1E3A8A] text-center">{surveyData.formTitle}</h1>
          <p className="mb-8 text-[#4B5563] text-center text-lg">{surveyData.formDescription}</p>
          <p className="mb-8 text-sm text-[#6B7280] text-center">Estimated time: 2 minutes</p>
          <Button onClick={handleStart} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-4 rounded-xl transition-all duration-300 text-lg">
            Start Survey
          </Button>
        </motion.div>
      </div>
    )
  }

  const currentField = surveyData.fields[currentStep]

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={backgroundStyle}
    >
      {currentStep > 0 && <ProgressBar />}
      <div className="w-full max-w-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
          >
            <div className="bg-white bg-opacity-95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-semibold mb-6 text-[#1E3A8A] text-center">{currentField.fieldLabel}</h2>
              <p className="mb-8 text-[#4B5563] text-center text-lg">{currentField.fieldDescription}</p>
              {renderField(currentField)}
              {errors[currentField.fieldName] && (
                <p className="text-red-500 mt-4 text-center">{errors[currentField.fieldName]}</p>
              )}
              <div className="mt-12 flex justify-between">
                {currentStep > 0 && (
                  <Button 
                    onClick={handlePrevious}
                    variant="outline"
                    className="px-8 py-3 rounded-xl border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-all duration-300 text-lg"
                  >
                    Previous
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  className="px-8 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all duration-300 ml-auto text-lg"
                >
                  {currentStep < totalSteps - 1 ? "Next" : "Submit"}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PreviewFormsAndEdit