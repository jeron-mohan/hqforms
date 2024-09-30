import Link from "next/link"
import { signOut } from "@/auth";

import { CircleUser, Library, Menu, Package2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
    return (
        <div className="flex w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-lg font-semibold md:text-base"
                    >
                        <Library className="h-6 w-6" />
                        <span className="sr-only">Acme Inc</span>
                    </Link>
                    
                </nav>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium">
                            
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                General
                            </Link>
                           
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex justify-end w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    {/* <form className="ml-auto flex-1 sm:flex-initial">
                       
                    </form> */}
                    <DropdownMenu >
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                           
                            <form action={async () => {
                                "use server";

                                await signOut();
                            }}>
                                <DropdownMenuItem >
                                    <button type="submit"> Sign out</button>
                                </DropdownMenuItem>

                            </form>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
           
        </div>
    )
}
