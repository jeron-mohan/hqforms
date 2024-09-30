"use client"
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import { listOptions, recommendations,prompt, fakeData } from '@/app/_data/Maindata';
import { LogTable } from '@/components/ui/logTable';
import FieldCheckModal from '@/components/ui/editfieldsmodal';
import { chatSession } from '@/configs/AiModel';
import { getAllForms } from '@/data/form';
import { Loader2 } from 'lucide-react';


interface FormHistoryItem {
  id: string;
  jsonForm: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FormData {
  formTitle: string;
  formDescription: string;
  formName: string;
  fields: Array<{
    fieldName: string;
    fieldType: string;
    fieldLabel: string;
    fieldDescription: string;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    required: boolean;
  }>;
  backgroundImage: string;
}


const AIformsModule = () => {


   const [inputValue, setInputValue] = useState("");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalData, setModalData] = useState<Record<string, any>>({});
   const [loading,setloading] = useState(false)
  

   const [forms, setForms] = useState<FormHistoryItem[]>([]);

   const [isLoading, setIsLoading] = useState(true);
   const [isLoadingAI, setIsLoadingAI] = useState(false);


   useEffect(() => {
     const fetchForms = async () => {
       try {
         setIsLoading(true);
         const formTable = await getAllForms();
         if (formTable && Array.isArray(formTable)) {
          //  const parsedForms = formTable.map(item => JSON.parse(item.jsonForm) as FormData);
           console.log(formTable);
           
           setForms(formTable);
         } else {
           console.error("Invalid data received from getAllForms");
         }
       } catch (error) {
         console.error("Error fetching or parsing forms:", error);
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchForms();
   }, []);
 
  //  if (isLoading) {
  //    return <div>Loading forms...</div>;
  //  }
 
  //  if (forms.length === 0) {
  //    return <div>No forms found. Please try again later.</div>;
  //  }
 
  //  return (
  //    <div>
  //      {forms.map((form, index) => (
  //        <div key={index}>
  //          <h2>{form.formTitle}</h2>
  //          <p>{form.formDescription}</p>
  //          {/* Render other form details as needed */}
  //        </div>
  //      ))}
  //    </div>
  //  );
 



   const handleRecommendationClick = (recommendation: string) => {
     setInputValue(recommendation);
   };

   const deleteField = (indexToRem:number) =>{

      // const result = jsonForm.formFields.filter((item,index)=>index!=indexToRem)
      // jsonForm.formFields = result
      // setUpdateTrigger(Date.now())

      console.log("Delete clicked");
      


  }

//   const onFieldUpdata = (value:any,index:any) =>{

//    // jsonForm.formFields[index].label = value.label
//    // jsonForm.formFields[index].placeholder = value.placeholder
//    // setUpdateTrigger(Date.now())

//    // console.log(jsonForm);
//    console.log("Update Clicked");
   
// }
   

   const onCreateForm = async () =>{
      setloading(true)
   const result =  await chatSession.sendMessage(`Provide a JSON structure for a survey form based on the following requirements: ${inputValue}, ${prompt}`)
   console.log(result.response.text());
   // if(result.response.text()){
   //    const resp = await db.insert(JsonForms)
   //    .values({
   //        jsonform:result.response.text(),
   //        createdBy:"Jeron",
   //        createdAt:moment().format('DD/MM/yyyy')
   //    }).returning({id:JsonForms.id})
   //    console.log("New form id ",resp[0].id);
   //    if(resp[0].id){
   //        route.push('/edit-form/'+resp[0].id)
   //    }
   //    setloading(false)

   // }
   setloading(false)

  }
 
   const handleSend = async() => {
    setIsLoadingAI(true)

     const result =  await chatSession.sendMessage(`Provide a JSON structure for a survey form based on the following requirements: ${inputValue}, ${prompt}`)
     setIsLoadingAI(false)
    
     setModalData(result.response.text());
    // setModalData(fakeData)
    setIsModalOpen(true);
   };

   const closeModal = () => {
      setIsModalOpen(false);
    };

    const handleModalButtonClick = () => {
      console.log("Button in modal was clicked");
      // Add your logic here
    };
 


   return (
      <div className="p-10">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold  text-black mb-6">
        Design Your Perfect Form
        </h1>
          {/* {showHeader && ( */}
        
        <span className="flex flex-col items-center">
        
  
        <Card className="w-full max-w-lg bg-gray-200 text-black">
          <CardContent className="p-4">
            <Textarea
              className="bg-transparent border-none text-black placeholder-gray-800"
              placeholder="Describe the form you have in mind"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </CardContent>
        </Card>
  
        {/* <div className="flex gap-2 mt-4">
          <Button variant="outline" className="text-black border-gray-700">
            <Upload className="w-4 h-4 mr-2" />
            Add content
          </Button>
          <Button variant="outline" className="text-black border-gray-700">
            Use a project
          </Button>
        </div> */}
  
        <div className="flex gap-2 mt-4">
          {recommendations.map((rec, index) =>
          (<Button onClick={() => handleRecommendationClick(rec.prompt)} key={index} variant="outline" className="text-black border-gray-700">
            {rec.label}
          </Button>))}
        </div>
  
        {/* <Button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSend}
        >
          Generate AI forms
        </Button> */}
        <Button
      className={`mt-4 bg-blue-600 hover:bg-blue-700 text-white`}
      onClick={handleSend}
      disabled={isLoadingAI}
    >
      {isLoadingAI ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Generate AI forms'
      )}
    </Button>
        </span>
       
         {/* )}  */}
  
        <div className="grid grid-cols-3 gap-3 mt-7 w-full max-w-5xl">
          {listOptions.map((rec, index) => (
            <Card
              key={index}
            
              className="bg-gray-200 hover:border-gray-700 cursor-pointer  transition-colors  ">
                <h3 className='text-center mt-5 mb-3'>{rec.heading}</h3>
  
  
              <CardContent className="">
                <p className="text-gray-900 text-sm break-words text-center">{rec.description}</p>
              </CardContent>
            </Card>
          ))}
  
        </div>
  

      </div>
      <LogTable finalData = {forms} />
      <FieldCheckModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        data={modalData} 
        onButtonClick={handleModalButtonClick}
    
        deleteField = {(index:number)=>deleteField(index)}
      />
      </div>
      
    );
}
 
export default AIformsModule;