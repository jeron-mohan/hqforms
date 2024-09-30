
"use client"
import { insigntsPrompt } from '@/app/_data/Maindata';
import { LoadingComp } from '@/components/ui/loading';
import DynamicDashboard  from '@/components/ui/tempDb';
import { chatSession } from '@/configs/AiModel';
import { getFormResult } from '@/data/form';
import React, { useEffect, useState } from 'react';

interface PreviewFormsAndEditProps {
    params: any;


}


   

const FormResults = ({ params }: PreviewFormsAndEditProps) => {
    const [data, setData] = useState<any | null>(null);
        const [limit, setLimit] = useState<any | null>(null);

      
       

        useEffect(() => {
            let isMounted = true;
          
            const fetchData = async () => {
                try {
                  const data = await getFormResult(params.formid);
                  console.log(params.formid);
                  console.log("This is the data", data.jsonResult);
              
                  const result = await chatSession.sendMessage(`${data.jsonResult} ${insigntsPrompt}`);
                  const responseText = await result.response.text();
                  console.log("Errored response",responseText);
                  
              
                  if (isMounted) {
                    const parsedData = JSON.parse(responseText);
                    setData(parsedData);
                    setLimit(parsedData.length / 3);
                  }
                } catch (error) {
                  console.error("Error fetching survey data:", error);
                }
              };
          
            fetchData();
          
            return () => {
              isMounted = false;
            };
          }, []);
      
        return (
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Survey Analytics</h1>
            {data ? (
              <DynamicDashboard data={data} cardsPerGroup={limit} />
            // <DynamicDashboard  />

            ) : (
              <LoadingComp />
            )}
          </div>
        );
      };

export default FormResults;