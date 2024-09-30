import { Header } from "@/components/ui/header";
import { SidebarPage } from "@/components/ui/sidebar";

const HomePageLayout = ({children}:{children:React.ReactNode}) => {
    return ( 
        <div>
            <SidebarPage>
            {children}

            </SidebarPage>
{/* <Header /> */}
        </div>
     );
}
 
export default HomePageLayout;