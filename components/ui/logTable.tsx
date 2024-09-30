import Image from "next/image"
import Link from "next/link"
import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"




import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingComp } from "./loading"

interface FormData {
  id: string;
  jsonForm: string;
  createdBy: string;
  createdAt: any;
  updatedAt: string;
}

interface ParsedFormData extends FormData {
  formTitle: string;
}




export function LogTable({ finalData }: { finalData: FormData[] }) {

  console.log("This is from log table",finalData);
  
  const router = useRouter()

  const [forms, setForms] = useState<ParsedFormData[]>([]);

  useEffect(() => {
    const parsedForms = finalData.map(form => {
      const parsedJsonForm = JSON.parse(form.jsonForm);
      return {
        ...form,
        formTitle: parsedJsonForm.formTitle,
      };
    });
    setForms(parsedForms);
    
  }, [finalData]);

  const handleRowClick = (id: string) => {
    console.log("Clicked form id:", id);
    router.push("/aiforms/"+id)


  };

 

  if (finalData.length === 0) {
    return (
      <div className="grid mt-24 place-content-center bg-white px-4">
                        <div className="text-center">
                          <h1 className="text-5xl font-black text-gray-500">
                            Loading
                            <span className="dots">
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                            </span>
                          </h1>
                        </div>
                        <style jsx>{`
                          @keyframes blink {
                            0% { opacity: 0.2; }
                            20% { opacity: 1; }
                            100% { opacity: 0.2; }
                          }
                          
                          .dots .dot {
                            animation: blink 1.4s infinite both;
                            animation-delay: 0s;
                          }
                          
                          .dots .dot:nth-child(2) {
                            animation-delay: 0.2s;
                          }
                          
                          .dots .dot:nth-child(3) {
                            animation-delay: 0.4s;
                          }
                        `}</style>
                      </div>
    )
  }

  // return (
  //   <div>
  //     {finalData.map((form, index) => (
  //       <div key={index}>
  //         <h2>{form.formTitle}</h2>
  //         <p>{form.formDescription}</p>
  //         {/* Render other form details as needed */}
  //       </div>
  //     ))}
  //   </div>
  // );
  return (
      
      <Card className="m-10 border-none">
                <CardHeader>
                  <CardTitle className="text-center">Previous forms</CardTitle>
                  
                </CardHeader>
                <CardContent className="mt-5">
                <ScrollArea className="h-[350px] ">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created at
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    
                    {forms.slice(-1).concat(forms.slice(0, -1)).map((form, index) => (
                      <TableRow key={index} className="cursor-pointer" onClick={() => handleRowClick(form.id)}>
                       
                        <TableCell className="font-medium">
                        {form.formTitle}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Active</Badge>
                        </TableCell>
                        <TableCell className="hidden  md:table-cell">
                            {Math.floor(Math.random() * (75 - 25 + 1)) + 25}

                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-07-12 10:42 AM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                        ))}
                     
                    

                    </TableBody>
                  </Table>
                  </ScrollArea>
                </CardContent>
                {/* <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>1-3</strong> of <strong>32</strong>{" "}
                    products
                  </div>
                </CardFooter> */}
              </Card>
  )
}
