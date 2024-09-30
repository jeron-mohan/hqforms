import { auth, signOut } from "@/auth";
import { Header } from "@/components/ui/header";
import { SidebarPage } from "@/components/ui/sidebar";




const SettingsPage = async () => {

    const session = await auth()

    return (
        <div>

            {JSON.stringify(session)}
        

            {/* <Header />

            <SidebarPage /> */}



        </div>
    );
}

export default SettingsPage;