import { ChevronDownIcon, SlashIcon } from "@radix-ui/react-icons"
 
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";

interface VideoSelectorProps {
    params: any;


}

const VideoData = ({ params }: VideoSelectorProps) => {
    return ( 
    
    <div className="p-10">
        <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/videos">Videos</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
      
        <BreadcrumbItem>
          <BreadcrumbPage>{params.videoid}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>


    <div className="mt-5">

        <Input type="text"  />

    </div>
    </div>
    
);
}
 
export default VideoData;