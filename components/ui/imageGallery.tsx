import Image from 'next/image';
import React from 'react';
import { ScrollArea } from './scroll-area';
import { Link } from 'lucide-react';

interface ImageData {
    url: string;
    alt?: string;
    width: number;
    height: number;
}

interface ImageGalleryProps {
    images: ImageData[];
    onImageClick: (imageUrl: string) => void;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageClick }) => {
    if (!images || images.length === 0) {
        return <div className="p-4">No images to display</div>;
    }
    return (
        // <div className="flex overflow-y-auto p-4">
        //   {images.map((image, index) => (
        //     <Image
        //       key={index}
        //       src={image.url}
        //       alt={image.alt || `Image ${index + 1}`}
        //       width={image.width}
        //       height={image.height}
        //       className="w-20 h-30 object-cover mr-4 cursor-pointer"
        //       onClick={() => onImageClick(image.url)}
        //     />
        //   ))}
        // </div>
        // <div className="flex overflow-y-auto p-4">
        <div>
            <Tabs defaultValue="account" >
                <TabsList>
                    <TabsTrigger value="account">Images</TabsTrigger>
                    <TabsTrigger value="password">Colors</TabsTrigger>
                </TabsList>
                <TabsContent value="account">

                    <ScrollArea className="h-[600px] ">
                        <div >
                            <div className="grid grid-cols-1 gap-2">
                                {images && images.map((image, index) => {
                                    return (
                                        <button onClick={() => onImageClick(image.url)} key={index} className="relative w-full h-[170px] group hover:opacity-75 transition bg-muted rounded-lg overflow-hidden border">
                                            <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                fill src={image.url} alt={image.alt || "image"} className="object-cover" />

                                            <Link target="_blank" href={image.url} className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left">Test</Link>
                                        </button>
                                    )
                                })}
                            </div>

                        </div>



                    </ScrollArea>
                </TabsContent>
                <TabsContent value="password">Change your color here.</TabsContent>
            </Tabs>



            {/* <ToolSidebarHeader title="Images" description="Add image to canvas" /> */}









        </div>




    );
};

export default ImageGallery;