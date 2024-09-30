"use client"
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"
import { Plus, ChevronDown, RotateCcw } from "lucide-react";
import { listOptions, recommendations } from '@/app/_data/Maindata';


export function AiInputSection() {
  const [inputValue, setInputValue] = useState("");

  const handleRecommendationClick = (recommendation: string) => {
    setInputValue(recommendation);
  };

  const handleSend = () => {
    console.log("Input value:", inputValue);
  };

  const [showHeader, setShowHeader] = useState(false);

  const toggleHeader = () => {
    setShowHeader(!showHeader);
  };


  return (
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

      <Button
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleSend}
      >
        Generate AI forms
      </Button>
      </span>
     
       {/* )}  */}

      <div className="grid grid-cols-3 gap-3 mt-7 w-full max-w-5xl">
        {listOptions.map((rec, index) => (
          <Card
            key={index}
            onClick={toggleHeader}
            className="bg-gray-200 hover:border-gray-700 cursor-pointer  transition-colors  ">
              <h3 className='text-center mt-5 mb-3'>{rec.heading}</h3>


            <CardContent className="">
              <p className="text-gray-900 text-sm break-words text-center">{rec.description}</p>
            </CardContent>
          </Card>
        ))}

      </div>


    </div>
  );
}