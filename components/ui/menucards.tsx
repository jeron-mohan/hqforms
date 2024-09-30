"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {
   
    Library,
    Video,
  } from "lucide-react"
import { useRouter } from "next/navigation"
export function MenuCards() {

    const router = useRouter()

    return(
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
          
          <Card className="w-[350px] hover:border-gray-900" onClick={()=>router.push("aiforms")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"> <div className="text-2xl font-bold">AI Forms</div></CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
           
          </Card>
          <Card className="hover:border-gray-900" onClick={()=>router.push("videos")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><div className="text-2xl font-bold">Videos</div></CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              
            </CardContent>
          </Card>
        </div>
    )
}