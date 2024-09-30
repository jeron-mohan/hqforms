"use client"
import React, { useRef, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ]
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './chart';
import { Button } from './button';
import { Download, Edit, Share } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './popover';



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DynamicDashboard = ({ data, cardsPerGroup = 4 }:any) => {
    console.log("This is the newest",data);
    const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
    const [hoveredButton, setHoveredButton] = useState(null);
    const downloadRef = useRef<HTMLDivElement>(null);
    const postRef = useRef<HTMLDivElement>(null);

    const handleButtonHover = (button:any) => {
      setHoveredButton(button);
    };

    const handleButtonLeave = (button: string) => {
      setTimeout(() => {
        if (button === 'download' || button === 'post') {
          const ref = button === 'download' ? downloadRef : postRef;
          if (ref.current instanceof HTMLElement && !ref.current.matches(':hover')) {
            setHoveredButton(null);
          }
        }
      }, 100);
    };
    
    const extractNumericValue = (str:any) => {
        if (str == null || typeof str !== 'string') {
          return '';
        }
        const match = str.match(/(\d+(\.\d+)?%?)/);
        return match ? match[0] : null;
      };
      
      const KeyMetricDisplay = ({ keyMetric }:any) => {
        const displayValue = extractNumericValue(keyMetric);

        if(displayValue) {
            
            return (
                <p className="mb-2">
                     <h1 className="text-7xl font-black text-gray-500">
                     {displayValue}
                           
                          </h1>
                  {/* <strong>Key Metric:</strong> {displayValue} */}
                </p>
              );
        } 
        
        
      };

    const renderChart = (item:any) => {
      if (item.type === 'graph' || item.type === 'bar' || item.type === 'line') {
        const ChartComponent = item.graphType === 'area' ? AreaChart : BarChart;
        const DataComponent = item.graphType === 'area' ? Area : Bar;
        
        console.log("item value",item.data);
        
        return (
           
            
          <ResponsiveContainer width="100%" height={200}>
            {/* <ChartComponent data={item.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <DataComponent type="monotone" dataKey="value" fill="#8884d8" />
            </ChartComponent> */}
             <ChartContainer config={chartConfig} className="h-48 sm:h-64">
          <BarChart accessibilityLayer data={item.data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 18)}
              className='text-[0.55rem]'
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="value" fill="var(--color-desktop)" radius={4} />
            {/* <Bar dataKey="percentage" fill="var(--color-mobile)" radius={4} /> */}
          </BarChart>
        </ChartContainer>
             {/* <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={item.data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer> */}

            
          </ResponsiveContainer>
        );
      }
      return null;
    };
  
    const renderCard = (item:any, index:any) => {
      
      const isHovered = hoveredCardIndex === index;
      return (
      
      <Card
        key={index}
        className={`flex flex-col lg:max-w-lg ${index >= cardsPerGroup ? 'max-w-xs' : ''} relative overflow-hidden`} 
        x-chunk={`charts-01-chunk-${index}`}
        onMouseEnter={() => setHoveredCardIndex(index)}
        onMouseLeave={() => setHoveredCardIndex(null)}
      >
      <CardContent className="p-6 relative">
          <motion.div
            animate={{ opacity: isHovered ? 0.3 : 1 }}
            transition={{ duration: 0.3 }}
          >
        <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
        {/* <p className="mb-2"><strong>Key Metric:</strong> {item.keyMetric}</p> */}
        <KeyMetricDisplay keyMetric={item.keyMetric} />

        <p className="mb-4">{item.insightData}</p>
        {renderChart(item)}
        </motion.div>

        <AnimatePresence>
  {isHovered && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-black bg-opacity-50"
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2"
        onClick={(e) => {
          e.stopPropagation();
          // Add edit functionality
        }}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>

      <div className="absolute bottom-2 left-2" ref={downloadRef}>
        <AnimatePresence>
          {hoveredButton === 'download' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 w-full"
            >
              <div className="flex flex-col space-y-1 bg-white rounded-md shadow-lg">
                <Button variant="ghost" size="sm" onClick={() => {/* Handle Instagram download */}}>Instagram</Button>
                <Button variant="ghost" size="sm" onClick={() => {/* Handle LinkedIn download */}}>LinkedIn</Button>
                <Button variant="ghost" size="sm" onClick={() => {/* Handle Twitter download */}}>Twitter</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button 
          variant="secondary" 
          size="sm"
          onMouseEnter={() => handleButtonHover('download')}
          onMouseLeave={() => handleButtonLeave('download')}
        >
          <Download className="h-4 w-4 mr-2" />
          
        </Button>
      </div>

      <div className="absolute bottom-2 right-2" ref={postRef}>
        <AnimatePresence>
          {hoveredButton === 'post' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 w-full"
            >
              <div className="flex flex-col space-y-1 bg-white rounded-md shadow-lg">
                <Button variant="ghost" size="sm" onClick={() => {/* Handle Instagram post */}}>Instagram</Button>
                <Button variant="ghost" size="sm" onClick={() => {/* Handle LinkedIn post */}}>LinkedIn</Button>
                <Button variant="ghost" size="sm" onClick={() => {/* Handle Twitter post */}}>Twitter</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button 
          variant="secondary" 
          size="sm"
          onMouseEnter={() => handleButtonHover('post')}
          onMouseLeave={() => handleButtonLeave('post')}
        >
          <Share className="h-4 w-4 mr-2" />
          Post
        </Button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      
        </CardContent>

       
     

      </Card>
    ) };
  
    const renderGroup = (groupData:any, groupIndex:any, isNewSection:any) => {
      let className = 'grid w-full gap-6 ';
  
      if (isNewSection) {
        className += 'sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]';
      } else if (groupIndex % 3 === 1) {
        className += 'lg:max-w-[20rem] flex-1';
      } else {
        className += 'flex-1';
      }
  
      return (
        <div key={groupIndex} className={className}>
          {groupData.map((item:any, index:any) => renderCard(item, groupIndex * cardsPerGroup + index))}
        </div>
      );
    };
  
    const renderSection = (sectionData:any, sectionIndex:any) => (
        <ScrollArea className="h-[650px]">

      <div key={sectionIndex} className="chart-wrapper mx-auto flex max-w-8xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
        {sectionData.map((group:any, groupIndex:any) => renderGroup(group, groupIndex + sectionIndex * 3, groupIndex === 0))}
      </div>
      </ScrollArea>

    );
  
    const groupedData = data.reduce((acc:any, item:any, index:any) => {
      const sectionIndex = Math.floor(index / (cardsPerGroup * 3));
      const groupIndex = Math.floor((index % (cardsPerGroup * 3)) / cardsPerGroup);
      
      if (!acc[sectionIndex]) {
        acc[sectionIndex] = [];
      }
      if (!acc[sectionIndex][groupIndex]) {
        acc[sectionIndex][groupIndex] = [];
      }
      
      acc[sectionIndex][groupIndex].push(item);
      return acc;
    }, []);
  
    return (
      <>
        {groupedData.map((section:any, index:any) => renderSection(section, index))}
      </>
    );
  };
  
  

export default DynamicDashboard;


// <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
// <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]">
//   <Card
//     className="lg:max-w-md" x-chunk="charts-01-chunk-0"
//   >
  
//   </Card>
//   <Card
//     className="flex flex-col lg:max-w-md" x-chunk="charts-01-chunk-1"
//   >
  
//   </Card>
// </div>
// <div className="grid w-full flex-1 gap-6 lg:max-w-[20rem]">
//   <Card
//     className="max-w-xs" x-chunk="charts-01-chunk-2"
//   >
   
//   </Card>
//   <Card
//     className="max-w-xs" x-chunk="charts-01-chunk-3"
//   >
   
//   </Card>
//   <Card
//     className="max-w-xs" x-chunk="charts-01-chunk-4"
//   >
   
//   </Card>
// </div>
// <div className="grid w-full flex-1 gap-6">
//   <Card
//     className="max-w-xs" x-chunk="charts-01-chunk-5"
//   >
    
//   </Card>
//   <Card
//     className="max-w-xs" x-chunk="charts-01-chunk-6"
//   >
    
//   </Card>
//   <Card
//     className="max-w-xs" x-chunk="charts-01-chunk-7"
//   >
   
//   </Card>
// </div>
// </div>