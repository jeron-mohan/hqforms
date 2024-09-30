'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createFormResult, getFormById, updateForm } from "@/data/form"
import { LoadingComp } from "@/components/ui/loading"
import { SendHorizontal, Plus, GripVertical, X, ChevronDown, Heart, Check, Copy, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditFormBackgroundProps {
  params: {
    formid: string
  }
}

interface TransformedFormData {
    formTitle: string;
    formFields: {
        [key: string]: TransformedField;
    };
}

type TransformedField = { [key: string]: number } | number[];


interface SurveyData {
  formTitle: string
  formDescription: string
  formName: string
  fields: Field[]
  customTheme: CustomTheme
}

interface CustomTheme {
  font: string
  questionColor: string
  answerColor: string
  buttonColor: string
  buttonTextColor: string
  backgroundColor: string
  backgroundImage: string
  logoUrl: string
  roundedCorners: string
  welcomeScreenSize: string
  questionSize: string
  optionBorderColor: string
  textColor: string
  optionBackgroundColor: string
  optionTextColor: string
  theme: string
  decorativeElement?: {
    position: string
    shape: string
    size: string
  }
}

interface Field {
  id: string
  fieldName: string
  fieldType: string
  fieldLabel: string
  fieldDescription: string
  placeholder?: string
  options?: { value: any; label: string }[]
  required: boolean
  scale?: number
}

const fieldTypes = ['select', 'multiselect', 'radio', 'rating', 'opinionscale', 'matrix', 'text', 'shorttext', 'longtext']

const presetThemes = [
  { 
    name: 'Default Theme', 
    preview: '/themes/default.png',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    optionBackgroundColor: '#f3f4f6',
    optionTextColor: '#000000',
    optionBorderColor: '#d1d5db',
    buttonTextColor:"#ffffff"
  },
  { 
    name: 'Plain Blue', 
    preview: '/themes/plain-blue.png',
    backgroundColor: '#e6f3ff',
    textColor: '#00366f',
    optionBackgroundColor: '#ffffff',
    optionTextColor: '#00366f',
    optionBorderColor: '#b3d9ff',
    buttonTextColor:"#ffffff"
  },
  { 
    name: 'Barceloneta', 
    backgroundColor: '#fef3c7',
    textColor: '#92400e',
    optionBackgroundColor: '#fffbeb',
    optionTextColor: '#92400e',
    optionBorderColor: '#fcd34d',
    buttonTextColor: "#ffffff",
    decorativeElement: {
      position: 'bottom-right',
      shape: 'rounded-tl-full',
      size: 'w-1/4 h-1/4'
    }
  },
  { 
    name: 'Example', 
    backgroundColor: '#FFCCCB',
    textColor: '#8B0000',
    optionBackgroundColor: '#FFE4E1',
    optionTextColor: '#8B0000',
    optionBorderColor: '#FF69B4',
    buttonTextColor: "#ffffff",
    decorativeElement: {
      position: 'top-right',
      shape: 'rounded-bl-full',
      size: 'w-1/3 h-1/3'
    }
  },
  { 
    name: 'Montjuic', 
    backgroundColor: '#E0F2F1',
    textColor: '#004D40',
    optionBackgroundColor: '#B2DFDB',
    optionTextColor: '#00695C',
    optionBorderColor: '#80CBC4',
    buttonTextColor: "#ffffff",
    decorativeElement: {
      position: 'top-left',
      shape: 'rounded-br-full',
      size: 'w-1/2 h-1/2'
    }
  },
  {
    "name": "Forest Mist",
    "backgroundColor": "#E8F5E9",
    "textColor": "#1B5E20",
    "optionBackgroundColor": "#C8E6C9",
    "optionTextColor": "#2E7D32",
    "optionBorderColor": "#81C784",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "top-right",
      "shape": "rounded-bl-full",
      "size": "w-1/4 h-1/4"
    }
  },
  {
    "name": "Lavender Dreams",
    "backgroundColor": "#F3E5F5",
    "textColor": "#4A148C",
    "optionBackgroundColor": "#E1BEE7",
    "optionTextColor": "#6A1B9A",
    "optionBorderColor": "#CE93D8",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "bottom-right",
      "shape": "rounded-tl-full",
      "size": "w-1/5 h-1/5"
    }
  },
  {
    "name": "Ocean Breeze",
    "backgroundColor": "#E0F7FA",
    "textColor": "#006064",
    "optionBackgroundColor": "#B2EBF2",
    "optionTextColor": "#00838F",
    "optionBorderColor": "#80DEEA",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "top-left",
      "shape": "rounded-br-full",
      "size": "w-1/2 h-1/2"
    }
  },
  {
    "name": "Desert Sand",
    "backgroundColor": "#FFF8E1",
    "textColor": "#F57F17",
    "optionBackgroundColor": "#FFECB3",
    "optionTextColor": "#FF6F00",
    "optionBorderColor": "#FFD54F",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "bottom-right",
      "shape": "rounded-tl-full",
      "size": "w-1/3 h-1/3"
    }
  },
  {
    "name": "Cherry Blossom",
    "backgroundColor": "#FCE4EC",
    "textColor": "#880E4F",
    "optionBackgroundColor": "#F8BBD0",
    "optionTextColor": "#AD1457",
    "optionBorderColor": "#F48FB1",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "top-right",
      "shape": "rounded-bl-full",
      "size": "w-1/4 h-1/4"
    }
  },
  {
    "name": "Autumn Leaves",
    "backgroundColor": "#FBE9E7",
    "textColor": "#BF360C",
    "optionBackgroundColor": "#FFCCBC",
    "optionTextColor": "#D84315",
    "optionBorderColor": "#FFAB91",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "bottom-left",
      "shape": "rounded-tr-full",
      "size": "w-1/3 h-1/3"
    }
  },
  {
    "name": "Arctic Frost",
    "backgroundColor": "#E8EAF6",
    "textColor": "#1A237E",
    "optionBackgroundColor": "#C5CAE9",
    "optionTextColor": "#283593",
    "optionBorderColor": "#9FA8DA",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "top-left",
      "shape": "rounded-br-full",
      "size": "w-1/4 h-1/4"
    }
  },
  {
    "name": "Tropical Paradise",
    "backgroundColor": "#E8F5E9",
    "textColor": "#1B5E20",
    "optionBackgroundColor": "#C8E6C9",
    "optionTextColor": "#2E7D32",
    "optionBorderColor": "#81C784",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "bottom-right",
      "shape": "rounded-tl-full",
      "size": "w-1/2 h-1/2"
    }
  },
  {
    "name": "Urban Concrete",
    "backgroundColor": "#ECEFF1",
    "textColor": "#263238",
    "optionBackgroundColor": "#CFD8DC",
    "optionTextColor": "#37474F",
    "optionBorderColor": "#B0BEC5",
    "buttonTextColor": "#ffffff",
    "decorativeElement": {
      "position": "top-right",
      "shape": "rounded-bl-full",
      "size": "w-1/3 h-1/3"
    }
  }
]

export default function EditFormBackground({ params }: EditFormBackgroundProps) {
  const [formData, setFormData] = useState<SurveyData | null>(null)
  const [selectedField, setSelectedField] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddFieldModal, setShowAddFieldModal] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formUrl, setFormUrl] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFormById(params.formid)
        if (typeof data?.jsonForm === 'string') {
          const parsedData = JSON.parse(data.jsonForm)
          console.log(parsedData);
          
          const plainBlueTheme = presetThemes.find(theme => theme.name === 'Plain Blue')
          setFormData({
            ...parsedData,
            customTheme: {
              ...parsedData.customTheme,
              backgroundColor:  plainBlueTheme?.backgroundColor || '#e6f3ff',
              textColor:  plainBlueTheme?.textColor || '#00366f',
              optionBackgroundColor:  plainBlueTheme?.optionBackgroundColor || '#ffffff',
              optionTextColor:  plainBlueTheme?.optionTextColor || '#00366f',
              optionBorderColor:  plainBlueTheme?.optionBorderColor || '#b3d9ff',
              logoUrl:  '',
              theme:  'Plain Blue',
              font: 'System font',
              questionColor:  '#00366f',
              answerColor:  '#00366f',
              buttonColor:  '#0000FF',
              buttonTextColor:  '#ffffff',
              backgroundImage:  '',
              roundedCorners:  'medium',
              welcomeScreenSize:  'medium',
              questionSize:  'medium',
            },
          })
        } else {
          console.error("jsonForm is not a string:", data?.jsonForm)
        }
      } catch (error) {
        console.error("Error fetching survey data:", error)
      }
    }

    fetchData()
  }, [params.formid])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }, [formUrl])

  const handleFieldSelect = useCallback((index: number) => {
    setSelectedField(index)
  }, [])

  const handleAddField = (fieldType: string) => {
    if (!formData) return

    const newField: Field = {
      id: `field_${Date.now()}`,
      fieldName: `newField_${Date.now()}`,
      fieldType: fieldType,
      fieldLabel: `New ${fieldType} question`,
      fieldDescription: 'Please enter your question description here',
      placeholder: 'Enter your answer',
      options: fieldType !== 'text' ? [{ value: 'option1', label: 'Option 1' }] : undefined,
      required: false,
      scale: fieldType === 'rating' || fieldType === 'opinionscale' ? 10 : undefined
    }

    setFormData(prevData => ({
      ...prevData!,
      fields: [newField, ...prevData!.fields]
    }))

    setShowAddFieldModal(false)
  }

  const transformFormData = (data: SurveyData | null): TransformedFormData | null => {
    if (!data) return null;

    const transformedData: TransformedFormData = {
        formTitle: data.formTitle,
        formFields: {},
    };

    data.fields.forEach((field) => {
        if (['select', 'multiselect', 'radio'].includes(field.fieldType.toLowerCase())) {
            transformedData.formFields[field.fieldLabel] = {};
            field.options?.forEach((option) => {
                (transformedData.formFields[field.fieldLabel] as { [key: string]: number })[option.value] = 0;
            });
        } else if (field.fieldType.toLowerCase() === 'rating' || field.fieldType.toLowerCase() === 'opinionscale') {
            transformedData.formFields[field.fieldLabel] = {};
            const maxValue = field.options?.find(option => option.value === 'true' || option.value === true)?.label;
            console.log("field.options",field.options);
            
            console.log("maxValue",maxValue);
            
            if (maxValue) {
                const range = parseInt(maxValue);
                for (let i = 1; i <= range; i++) {
                    (transformedData.formFields[field.fieldLabel] as { [key: string]: number })[i.toString()] = 0;
                }
            }
        }
    });

    return transformedData;
};

const redirectToForm = useCallback(() => {
    window.open(formUrl, '_blank')
  }, [formUrl])

const saveForm = async () => {
    if (!formData) return

    setLoading(true)
    try {
      const postInDb = { jsonForm: JSON.stringify(formData) }
      await updateForm(params.formid, postInDb).then((data) => { 
        let transformedData = transformFormData(formData)
        let formId = data.id
        createFormResult(data.id, JSON.stringify(transformedData)).then((data) => {

          console.log(data)
          const url = `${window.location.origin}/forms/${formId}`
          setFormUrl(url)
          setIsModalOpen(true)
        })
      })
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderDecorativeElement = (theme: CustomTheme) => {
    if (!theme.decorativeElement) return null;
  
    const { position, shape, size } = theme.decorativeElement;
    let positionClass = '';
  
    switch (position) {
      case 'top-left':
        positionClass = 'top-0 left-0';
        break;
      case 'top-right':
        positionClass = 'top-0 right-0';
        break;
      case 'bottom-left':
        positionClass = 'bottom-0 left-0';
        break;
      case 'bottom-right':
        positionClass = 'bottom-0 right-0';
        break;
      default:
        positionClass = 'top-0 left-0';
    }
  
    return (
      <div 
        className={`absolute ${positionClass} ${shape} ${size}`}
        style={{ 
          backgroundColor: theme.optionBackgroundColor,
          opacity: 0.6,
        }}
      />
    );
  }

  const renderFieldPreview = (field: Field, index: number) => {
    const cardStyle: React.CSSProperties = {
      width: '228px',
      height: '150px',
      backgroundColor: formData?.customTheme.backgroundColor || undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }

    return (
      <Card
        key={field.id}
        className={`mb-4 ml-5 cursor-pointer transition-all duration-200 ${selectedField === index ? 'border-blue-500 shadow-md' : 'hover:border-gray-300'}`}
        onClick={() => handleFieldSelect(index)}
        style={cardStyle}
      >
        <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center relative">
          {formData?.customTheme.logoUrl && (
            <div className="absolute top-1 left-1 w-6 h-6">
              <Image
                src={formData.customTheme.logoUrl}
                alt="Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
          {renderDecorativeElement(formData!.customTheme)}
          <Badge className="absolute top-2 right-2 text-[8px] bg-blue-500">{field.fieldType}</Badge>
          <div style={{ color: formData?.customTheme.textColor }} className="text-[10px] font-semibold mb-1 truncate w-full">{field.fieldLabel}</div>
          <div style={{ color: formData?.customTheme.textColor }} className="text-[8px] text-gray-600 mb-1 truncate w-full">{field.fieldDescription}</div>
          {renderFieldPreviewOptions(field)}
        </CardContent>
      </Card>
    )
  }

  const renderFieldPreviewOptions = (field: Field) => {
    switch (field.fieldType.toLowerCase()) {
      case 'select':
      case 'multiselect':
      case 'radio':
        return (
          <div className="flex flex-wrap justify-center gap-1">
            {field.options?.slice(0, 3).map((option, i) => (
              <div style={{ background: formData?.customTheme.optionBackgroundColor,border:formData?.customTheme.optionBorderColor,color:formData?.customTheme.optionTextColor }} key={i} className="bg-gray-100 rounded px-1 py-0.5 text-[8px]">
                {option.label}
              </div>
            ))}
            {field.options && field.options.length > 3 && (
              <div className="bg-gray-100 rounded px-1 py-0.5 text-[8px]">...</div>
            )}
          </div>
        )
      case 'rating':
      case 'opinionscale':
        return (
          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: Math.min(field.scale || 5, 5) }, (_, i) => (
              <div key={i} className="bg-gray-100 rounded w-4 h-4 flex items-center justify-center text-[8px]">
                {i + 1}
              </div>
            ))}
            {(field.scale || 5) > 5 && (
              <div className="bg-gray-100 rounded px-1 py-0.5 text-[8px]">...</div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const renderFieldEditor = () => {
    if (!formData) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Textarea
            value=''
            onChange={(e) => setFormData({ ...formData!, formTitle: e.target.value })}
            className="text-3xl font-bold bg-transparent border-transparent text-center"
            placeholder="Enter form title"
          />
          <Textarea
            value=''
            onChange={(e) => setFormData({ ...formData!, formDescription: e.target.value })}
            className="text-xl bg-transparent border-transparent text-center"
            placeholder="Enter form description"
          />
        </div>
      )
    }

    if (selectedField === null) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Textarea
            value={formData.formTitle}
            onChange={(e) => setFormData({ ...formData, formTitle: e.target.value })}
            className="text-3xl font-bold bg-transparent border-transparent text-center"
            style={{ color: formData.customTheme.textColor }}
            placeholder="Enter form title"
          />
          <Textarea
            value={formData.formDescription}
            onChange={(e) => setFormData({ ...formData, formDescription: e.target.value })}
            className="text-xl bg-transparent border-transparent text-center"
            style={{ color: formData.customTheme.textColor }}
            placeholder="Enter form description"
          />
        </div>
      )
    }

    const field = formData.fields[selectedField]

    return (
      <div className="space-y-4">
        <Textarea
          value={field.fieldLabel}
          onChange={(e) => updateField(selectedField, 'fieldLabel', e.target.value)}
          className="text-xl font-semibold bg-transparent border-transparent"
          style={{ color: formData.customTheme.textColor }}
        />
        <Input
          value={field.fieldDescription}
          className='bg-transparent border-transparent'
          onChange={(e) => updateField(selectedField, 'fieldDescription', e.target.value)}
          style={{ color: formData.customTheme.textColor }}
        />
        {renderFieldInput(field, selectedField)}
        {renderFieldOptions(field, selectedField)}
        <Button
          onClick={() => {}}
          className="mt-2"
          style={{
            backgroundColor: formData.customTheme.buttonColor,
            color: formData.customTheme.buttonTextColor,
          }}
        >
          Okay
        </Button>
      </div>
    )
  }

  const updateField = (index: number, key: string, value: any) => {
    if (!formData) return
    const updatedFields = [...formData.fields]
    updatedFields[index] = { ...updatedFields[index], [key]: value }
    setFormData({ ...formData, fields: updatedFields })
  }

  const renderFieldInput = (field: Field, fieldIndex: number) => {
    const commonStyle = {
      backgroundColor: formData?.customTheme.optionBackgroundColor,
      borderColor: formData?.customTheme.optionBorderColor,
    }

    const optionTextStyle = {
      color: formData?.customTheme.optionTextColor,
    }

    const inputTextStyle = {
      color: formData?.customTheme.textColor,
    }

    switch (field.fieldType.toLowerCase()) {
        case 'rating':
        case 'opinionscale':
          const options = field.options || []
          const trueOption = options.find(option => option.value === "true" || option.value === true)
          const falseOption = options.find(option => option.value === "false" || option.value === false)
          const scale = trueOption ? parseInt(trueOption.label) : 5

          console.log("This is true",trueOption);
          console.log("This is false",falseOption);

          
      
          return (
            <div className="space-y-2">
              <div className="flex space-x-2">
                {Array.from({ length: scale }, (_, i) => (
                  <Button key={i} variant="outline" className="w-10 h-10" style={{ ...commonStyle, ...optionTextStyle }}>
                    {i + 1}
                  </Button>
                ))}
              </div>
              {trueOption && falseOption && (
          <RadioGroup
            defaultValue={trueOption.value === "true" || trueOption.value === true  ? trueOption.label : falseOption.label}
            onValueChange={(value) => {
              const updatedOptions = options.map(opt => ({
                ...opt,
                value: opt.label === value ? "true" : "false"
              }))
              updateField(fieldIndex, 'options', updatedOptions)
            }}
            className="space-y-3"
          >
            {[trueOption, falseOption].map((option) => (
              <div key={option.label} className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted">
                <RadioGroupItem value={option.label} id={`${field.id}-${option.label}`} />
                <Label 
                  htmlFor={`${field.id}-${option.label}`}
                  className="flex-grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
            </div>
          )
        default:
          return null
      }
  }

  const renderFieldOptions = (field: Field, fieldIndex: number) => {
    if (!['select', 'multiselect', 'radio'].includes(field.fieldType.toLowerCase())) {
      return null
    }

    return (
      <div className="space-y-2">
        <Label style={{ color: formData?.customTheme.textColor }}>Options</Label>
        {field.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={option.label}
              onChange={(e) => {
                const updatedOptions = [...field.options!]
                updatedOptions[index] = { ...option, label: e.target.value }
                updateField(fieldIndex, 'options', updatedOptions)
              }}
              style={{
                backgroundColor: formData?.customTheme.optionBackgroundColor,
                color: formData?.customTheme.optionTextColor,
                borderColor: formData?.customTheme.optionBorderColor,
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const updatedOptions = field.options!.filter((_, i) => i !== index)
                updateField(fieldIndex, 'options', updatedOptions)
              }}
              style={{
                backgroundColor: formData?.customTheme.optionBackgroundColor,
                color: formData?.customTheme.optionTextColor,
                borderColor: formData?.customTheme.optionBorderColor,
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className='bg-blue-600 text-white'
          onClick={() => {
            const newOption = { value: `option${field.options!.length + 1}`, label: `New Option ${field.options!.length + 1}` }
            updateField(fieldIndex, 'options', [...field.options!, newOption])
          }}
        >
          Add Option
        </Button>
      </div>
    )
  }

  const handleCustomThemeChange = (key: keyof CustomTheme, value: string) => {
    if (!formData) return
    setFormData({
      ...formData,
      customTheme: {
        ...formData.customTheme,
        [key]: value
      }
    })
  }

  const onDragEnd = (result: any) => {
    if (!result.destination || !formData) return

    const newFields = Array.from(formData.fields)
    const [reorderedField] = newFields.splice(result.source.index, 1)
    newFields.splice(result.destination.index, 0, reorderedField)

    setFormData({ ...formData, fields: newFields })
  }

  const applyTheme = (themeName: string) => {
    const selectedTheme = presetThemes.find(theme => theme.name === themeName)
    if (selectedTheme && formData) {
      setFormData({
        ...formData,
        customTheme: {
          ...formData.customTheme,
          theme: themeName,
          backgroundColor: selectedTheme.backgroundColor,
          textColor: selectedTheme.textColor,
          optionBackgroundColor: selectedTheme.optionBackgroundColor,
          optionTextColor: selectedTheme.optionTextColor,
          optionBorderColor: selectedTheme.optionBorderColor,
          decorativeElement: selectedTheme.decorativeElement,
        }
      })
    }
  }

  const renderThemeGallery = () => {
    return (
        <ScrollArea className="h-screen rounded-md border">

      <div className="flex mt-4 flex-col items-center space-y-4 w-full max-w-[228px] mx-auto">
        {presetThemes.map((theme) => (
          <div
            key={theme.name}
            className={`cursor-pointer rounded-lg ${formData?.customTheme.theme === theme.name ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}`}
            onClick={() => applyTheme(theme.name)}
            style={{
              width: '228px',
              height: '150px',
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {renderDecorativeElement(theme as unknown as CustomTheme)}
            <div className="p-4 h-full flex flex-col justify-between relative z-10">
              <div>
                <p className="font-semibold mb-1 text-shadow">Question</p>
                <p className="text-sm mb-2 text-shadow">Answer</p>
                <div 
                  style={{
                    backgroundColor: theme.optionBackgroundColor,
                    border: `1px solid ${theme.optionBorderColor}`,
                    height: '24px',
                    width: '80%'
                  }}
                />
              </div>
              <p className="text-sm font-medium text-shadow">{theme.name}</p>
            </div>
          </div>
        ))}
      </div>
      </ScrollArea>
    )
  }

  const renderCustomThemeEditor = () => {
    if (!formData) return null

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="font">System font</Label>
          <Select
            value={formData.customTheme.font}
            onValueChange={(value) => handleCustomThemeChange('font', value)}
          >
            <SelectTrigger id="font">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System font</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="sans-serif">Sans-serif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="questionColor">Questions</Label>
          <Input
            id="questionColor"
            type="color"
            value={formData.customTheme.questionColor}
            onChange={(e) => {
              handleCustomThemeChange('questionColor', e.target.value)
              handleCustomThemeChange('textColor', e.target.value)
            }}
          />
        </div>
        <div>
          <Label htmlFor="answerColor">Answers</Label>
          <Input
            id="answerColor"
            type="color"
            value={formData.customTheme.answerColor}
            onChange={(e) => {
              handleCustomThemeChange('answerColor', e.target.value)
              handleCustomThemeChange('optionTextColor', e.target.value)
            }}
          />
        </div>
        <div>
          <Label htmlFor="buttonColor">Buttons</Label>
          <Input
            id="buttonColor"
            type="color"
            value={formData.customTheme.buttonColor}
            onChange={(e) => handleCustomThemeChange('buttonColor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="buttonTextColor">Button text</Label>
          <Input
            id="buttonTextColor"
            type="color"
            value={formData.customTheme.buttonTextColor}
            onChange={(e) => handleCustomThemeChange('buttonTextColor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="backgroundColor">Background</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={formData.customTheme.backgroundColor}
            onChange={(e) => handleCustomThemeChange('backgroundColor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="optionBorderColor">Option Border Color</Label>
          <Input
            id="optionBorderColor"
            type="color"
            value={formData.customTheme.optionBorderColor}
            onChange={(e) => handleCustomThemeChange('optionBorderColor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="backgroundImage">Background img</Label>
          <Input
            id="backgroundImage"
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  handleCustomThemeChange('backgroundImage', reader.result as string)
                  handleCustomThemeChange('backgroundColor', `url(${reader.result})`)
                }
                reader.readAsDataURL(file)
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="logoUrl">Brand logo</Label>
          <Input
            id="logoUrl"
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  handleCustomThemeChange('logoUrl', reader.result as string)
                }
                reader.readAsDataURL(file)
              }
            }}
          />
        </div>
        {/* <div>
          <Label>Rounded corners</Label>
          <div className="flex space-x-2">
            {['none', 'small', 'medium', 'large'].map((size) => (
              <Button
                key={size}
                variant={formData.customTheme.roundedCorners === size ? 'default' : 'outline'}
                onClick={() => handleCustomThemeChange('roundedCorners', size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div> */}
        {/* <div>
          <Label>Welcome Screen & Endings</Label>
          <div className="flex space-x-2">
            {['small', 'medium', 'large'].map((size) => (
              <Button
                key={size}
                variant={formData.customTheme.welcomeScreenSize === size ? 'default' : 'outline'}
                onClick={() => handleCustomThemeChange('welcomeScreenSize', size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div> */}
        {/* <div>
          <Label>Questions</Label>
          <div className="flex space-x-2">
            {['small', 'medium', 'large'].map((size) => (
              <Button
                key={size}
                variant={formData.customTheme.questionSize === size ? 'default' : 'outline'}
                onClick={() => handleCustomThemeChange('questionSize', size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div> */}
       
      </div>
    )
  }

  if (!formData) {
    return <LoadingComp />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <Dialog open={showAddFieldModal} onOpenChange={setShowAddFieldModal}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4">
                <Plus className="mr-2 h-4 w-4" /> Add fields
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new field</DialogTitle>
                <DialogDescription>
                  Choose a field type to add to your form.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                {fieldTypes.map((type) => (
                  <Button key={type} onClick={() => handleAddField(type)}>
                    {type}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 space-y-4">
                  {formData.fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative ${snapshot.isDragging ? 'z-10' : ''}`}
                        >
                          <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 cursor-move  rounded-l-md p-1">
                            <GripVertical size={16} />
                          </div>
                          {renderFieldPreview(field, index)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden relative" style={{ background: formData.customTheme.backgroundColor }}>
        {formData.customTheme.decorativeElement && renderDecorativeElement(formData.customTheme)}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex justify-end p-4">
            <Button
              onClick={saveForm}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <SendHorizontal className="mr-2 h-4 w-4" />
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-6">
              <div className="w-full max-w-2xl">
                {renderFieldEditor()}
              </div>
            </div>
          </div>
        </div>
      </div>

     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Form URL</DialogTitle>
            <DialogDescription>
              Your form has been saved. You can share it using the URL below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="formUrl"
                value={formUrl}
                readOnly
                className="w-full"
              />
            </div>
            <Button size="sm" className="px-3" onClick={copyToClipboard}>
              <span className="sr-only">Copy</span>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={redirectToForm} className="flex items-center space-x-2">
              <span>Open Form</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Right sidebar */}
      <div className="w-[300px] bg-white border-l border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Form Styling</h2>
          <Tabs defaultValue="gallery">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">Theme Gallery</TabsTrigger>
              <TabsTrigger value="custom">Custom Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="gallery">
              {renderThemeGallery()}
            </TabsContent>
            <TabsContent value="custom">
              {renderCustomThemeEditor()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}