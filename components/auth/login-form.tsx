"use client"
import { useForm } from "react-hook-form"
import { CardWrapper } from "./card-wrapper"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod';
import { LoginSchema } from "@/schemas";
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
import { Login } from "@/actions/login";
import { useState, useTransition } from "react";


export const LoginForm = () => {

    const [isPending, starttansition] = useTransition()

    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")


    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }

    })


    const onSubmit = (values: z.infer<typeof LoginSchema>) => {

        setError("")
        setSuccess("")
        console.log("Inside");

        starttansition(() => {
            Login(values)   
            .then((data) => {
                setError(data?.error)
                setSuccess(data?.success)

            })

        })



    }

    return (
        <CardWrapper headerLabel="Welcome back" backButtonLabel="Don't have an account" backButtonHref="/auth/register" showSocial>
            <Form {...form}>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="space-y-4">

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
                        Login
                    </Button>

                </form>

            </Form>
        </CardWrapper>
    )
}