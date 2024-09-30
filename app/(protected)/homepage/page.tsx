import { SidebarPage } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { MenuCards } from "@/components/ui/menucards";


const HomePageComponent = () => {
    return ( 
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Features</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
      >
        <div >
      
        <MenuCards />


        </div>
      </div>
    </main>
        
     
   
      
   
     );
}
 
export default HomePageComponent;