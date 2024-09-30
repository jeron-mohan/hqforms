import { z } from "zod"


export const LoginSchema = z.object({
    email:z.string().email({
        message:"Email is required"
    }),
    password:z.string().min(1,{
        message:"Password is required"
    })
})


export const RegisterSchema = z.object({
    email:z.string().email({
        message:"Email is required"
    }),
    password:z.string().min(4,{
        message:"Minimum 4 characters required"
    }),
    name:z.string().min(3,{
        message:"Name is required"
    }),
})


export const FormSchema = z.object({
    jsonForm: z.string().min(1, {
      message: "Form structure is required"
    }),
    theme: z.string().optional(),
    background: z.string().optional(),
    style: z.string().optional(),
    createdBy: z.string().min(1, {
      message: "Creator ID is required"
    })
  })

  export const FormResultSchema = z.object({
    formId: z.string().min(1, {
      message: "Form ID is required"
    }),
    jsonResult: z.string().min(1, {
      message: "Form result data is required"
    })
  })