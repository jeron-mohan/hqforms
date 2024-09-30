"use client"

import { useState, useRef, useEffect, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Edit2, Eye, Plus, Save, Trash2, Wand2, Upload, GripVertical, X, ExternalLink, Check, Copy } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { toast } from "@/hooks/use-toast"
import { createVideoForm } from "@/data/form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"


interface Question {
  id: string
  question: string
  duration: number
  notes: string
  aiSuggestions: string[]
}

interface TestimonialData {
  title: string
  description: string
  questions: Question[]
}

interface VideoTestimonialManagerProps {
    initialData: TestimonialData
  }

export default function VideoTestimonialManager({ initialData }: VideoTestimonialManagerProps) {
    
    const [testimonialData, setTestimonialData] = useState<TestimonialData>(initialData)
    const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formUrl, setFormUrl] = useState('')
  const [isCopied, setIsCopied] = useState(false)





  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingGlobal, setEditingGlobal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [newQuestionId, setNewQuestionId] = useState<string | null>(null)

  useEffect(() => {
    if (newQuestionId && scrollAreaRef.current) {
      const newQuestionElement = scrollAreaRef.current.querySelector(`[data-question-id="${newQuestionId}"]`)
      if (newQuestionElement) {
        newQuestionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setNewQuestionId(null)
      }
    }
  }, [newQuestionId, testimonialData.questions])

  const handleQuestionChange = (id: string, field: keyof Question, value: string | number) => {
    setEditingQuestion(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleGlobalChange = (field: 'title' | 'description', value: string) => {
    setTestimonialData(prev => ({ ...prev, [field]: value }))
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: String(Date.now()),
      question: "New question",
      duration: 30,
      notes: "",
      aiSuggestions: ["What are your thoughts on this aspect of our service?", "Can you elaborate on your experience with this feature?"]
    }
    setTestimonialData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }))
    setEditingId(newQuestion.id)
    setEditingQuestion(newQuestion)
    setNewQuestionId(newQuestion.id)
    toast({
      title: "New Question Added",
      description: "A new question has been added to the bottom of the list.",
    })
  }

  const deleteQuestion = (id: string) => {
    setTestimonialData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }))
    toast({
      title: "Question Deleted",
      description: "The selected question has been removed.",
    })
  }

  const applyAISuggestion = (id: string, suggestion: string) => {
    if (editingQuestion && editingQuestion.id === id) {
      const updatedNotes = editingQuestion.notes ? `${editingQuestion.notes}\n\n${suggestion}` : suggestion
      setEditingQuestion({ ...editingQuestion, notes: updatedNotes })
    } else {
      setTestimonialData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === id ? { ...q, notes: q.notes ? `${q.notes}\n\n${suggestion}` : suggestion } : q
        )
      }))
    }
  }

  const totalDurationMinutes = testimonialData.questions.reduce((sum, q) => sum + q.duration, 0) / 60

  const handlePublish = () => {
    // createVideoForm

    const outputJSON = {
      ...testimonialData,
      questions: testimonialData.questions.map(({ aiSuggestions, ...rest }) => rest)
    }
    console.log(JSON.stringify(outputJSON, null, 2))
    console.log("Create boy");

    startTransition(() => {
      console.log("Create boy");
      
      createVideoForm({
          jsonForm: JSON.stringify(outputJSON),
          createdBy: 'someUserId'
      })
          .then((data) => {
              console.log(data);
    const url = `${window.location.origin}/createVideos/${data.id}`
    setFormUrl(url)
    setIsModalOpen(true)


              toast({
                title: "Published Successfully",
                description: "Your video testimonial questions have been published. Check the console for the output JSON.",
              })

              console.log("I am the ID", data.id);
              // route.push('/editform/' + data.id);
          });
  });
   
  }

  const handlePreview = () => {
    toast({
      title: "Preview Generated",
      description: "Opening preview in a new window.",
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const newQuestions = Array.from(testimonialData.questions)
    const [reorderedItem] = newQuestions.splice(result.source.index, 1)
    newQuestions.splice(result.destination.index, 0, reorderedItem)

    setTestimonialData(prev => ({ ...prev, questions: newQuestions }))
  }

  const startEditing = (question: Question) => {
    setEditingId(question.id)
    setEditingQuestion({ ...question })
  }

  const redirectToForm = useCallback(() => {
    window.open(formUrl, '_blank')
  }, [formUrl])

  const saveEditing = () => {
    if (editingQuestion) {
      setTestimonialData(prev => ({
        ...prev,
        questions: prev.questions.map(q => q.id === editingQuestion.id ? editingQuestion : q)
      }))
      setEditingId(null)
      setEditingQuestion(null)
      toast({
        title: "Changes Saved",
        description: "Your edits have been saved successfully.",
      })
    }
  }

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }, [formUrl])

  const cancelEditing = () => {
    setEditingId(null)
    setEditingQuestion(null)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        {editingGlobal ? (
          <>
            <Input
              value={testimonialData.title}
              onChange={(e) => handleGlobalChange('title', e.target.value)}
              className="text-3xl font-bold mb-2"
            />
            <Textarea
              value={testimonialData.description}
              onChange={(e) => handleGlobalChange('description', e.target.value)}
              className="text-lg mb-2"
            />
            <Button onClick={() => setEditingGlobal(false)}>Save</Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">{testimonialData.title}</h1>
            <p className="text-lg mb-2">{testimonialData.description}</p>
            <Button onClick={() => setEditingGlobal(true)}>Edit</Button>
          </>
        )}
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="text-muted-foreground" />
          <span className="text-lg font-semibold">Total Duration: {totalDurationMinutes.toFixed(2)} minutes</span>
        </div>
        <div className="flex gap-2">
          {/* <Button onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button> */}
          <Button onClick={handlePublish} variant="default">
            <Upload className="mr-2 h-4 w-4" /> Publish
          </Button>
          <Button onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
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
      <ScrollArea className="h-[600px] rounded-md border p-4" ref={scrollAreaRef}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {testimonialData.questions.map((q, index) => (
                  <Draggable key={q.id} draggableId={q.id} index={index}>
                    {(provided) => (
                      <Card 
                        className="mb-6" 
                        ref={provided.innerRef} 
                        {...provided.draggableProps} 
                        data-question-id={q.id}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-sm font-medium">Question {index + 1}</CardTitle>
                          </div>
                          <div className="flex space-x-2">
                            {editingId === q.id ? (
                              <>
                                <Button variant="outline" size="icon" onClick={saveEditing}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={cancelEditing}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => startEditing(q)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="icon" onClick={() => deleteQuestion(q.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {editingId === q.id && editingQuestion ? (
                            <Textarea
                              value={editingQuestion.question}
                              onChange={(e) => handleQuestionChange(q.id, "question", e.target.value)}
                              className="mb-2"
                            />
                          ) : (
                            <p className="text-sm mb-2">{q.question}</p>
                          )}
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-4 w-4" />
                              {editingId === q.id && editingQuestion ? editingQuestion.duration : q.duration}s
                            </Badge>
                            {editingId === q.id && editingQuestion && (
                              <Slider
                                value={[editingQuestion.duration]}
                                min={10}
                                max={180}
                                step={5}
                                onValueChange={(value) => handleQuestionChange(q.id, "duration", value[0])}
                                className="w-[200px]"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Notes:</span>
                            </div>
                            <Textarea
                              value={editingId === q.id && editingQuestion ? editingQuestion.notes : q.notes}
                              onChange={(e) => handleQuestionChange(q.id, "notes", e.target.value)}
                              placeholder="Add notes or talking points here..."
                              className="min-h-[100px] mb-2"
                            />
                            <div className="flex flex-wrap gap-2">
                              {q.aiSuggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => applyAISuggestion(q.id, suggestion)}
                                  className="flex items-center"
                                >
                                  <Wand2 className="mr-2 h-4 w-4" />
                                  {truncateText(suggestion, 30)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ScrollArea>
      <div className="mt-6 flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save All Changes
        </Button>
      </div>
    </div>
  )
}