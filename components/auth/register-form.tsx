"use client"
import { useForm } from "react-hook-form"
import { CardWrapper } from "./card-wrapper"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod';
import { RegisterSchema } from "@/schemas";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Register } from "@/actions/register";
import { useState, useTransition } from "react";


export const RegisterForm = () => {

    const [isPending, starttansition] = useTransition()

    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")


    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            name:""
        }

    })


    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {

        setError("")
        setSuccess("")
        console.log("Inside");

        starttansition(() => {
            Register(values)   
            .then((data) => {
                setError(data.error)
                setSuccess(data.success)

            })

        })



    }

    return (
        <CardWrapper headerLabel="Create an account" backButtonLabel="Already have an account?" backButtonHref="/auth/login" showSocial>
            <Form {...form}>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="space-y-4">

                    <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending}  placeholder="John Doe" />
                                </FormControl>

                                <FormMessage />

                            </FormItem>
                        )} />

                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} type="email" placeholder="john.doe@example.com" />
                                </FormControl>

                                <FormMessage />

                            </FormItem>
                        )} />
                        

                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} type="password" placeholder="********" />
                                </FormControl>

                                <FormMessage />

                            </FormItem>
                        )} />

                    </div>

                    <FormError message={error} />
                    <FormSuccess message={success} />


                    <Button disabled={isPending} type="submit" className="w-full">
                        Create an account
                    </Button>

                </form>

            </Form>
        </CardWrapper>
    )
}