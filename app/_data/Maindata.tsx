
export const recommendations = [
    // "Need a user feedback on product feature automaition",
    // "Generate interview questions",
    // "Extract insights from report",
    {
      "label":"User feedback on product feature",
      "prompt":"Need a user feedback on product feature automation. Need to collect the user behaviour and how likely they will use the product. Do not include contact details",
    },

    {
      "label": "Market Trend Analysis",
      "prompt": "Identify and analyze the latest market trends in the industry. Focus on emerging customer preferences and potential opportunities for product development or marketing campaigns."
   },
   {
    "label": "Campaign Performance Review",
    "prompt": "Review the performance of recent marketing campaigns. Analyze metrics like engagement rates, conversion rates, and ROI. Suggest improvements for future campaigns."
 }
   

];

export const prompt = "Include form details like  formTitle, formDescription, and formName. Add fields with id which is a string and various input types such as 'multiselect', 'select' , 'radio' , 'rating' , 'opinionscale'  do not include any new input types.Each form should contain a 8 unique questions and atleast one from each input types and add only one text field that gets the users perpective based on human psychology.Do not get contact information from the user The options inside multiselect, select, radio and others should be in the format 'options': [{'value': 'Email', 'label': 'Email}] Each field should include a fieldName, fieldType, fieldLabel, fieldDescription, placeholder, options (for selection fields), and a required flag which will be set as false. By default for both rating and opinion scale and it should be a string, there should be 2 options the label should be the number 5 or 10 and no other number, and the value should be 'true' for 10.Do not provide 'Rate your experience on a scale of 1 to 10' in the title or description for rating and opinionscale, make it a random. Estimate the time needed to complete the survey based on the number and complexity of the fields."


export const Videoprompt = `
Generate a JSON object containing at least 5 survey questions for product/service evaluation. Follow this structure:

{
  "title":"A suitable title",
  "description":"A suitable description",
  "questions": [
    {
      "id": any number,
      "question": "String: The survey question",
      "duration": "Number: Estimated answer time in seconds give a minimum of 2 minutes",
      "notes": "Empty string",
      "aiSuggestions": [
        "Give any 3 suggestion based on the question it should be a bit long"
      ]
    }
  ]
}

Guidelines:
1. Cover diverse aspects: features, performance, user experience, overall satisfaction
2. Use marketing best practices for insightful question design
3. Ensure 'duration' is realistic for each question
4. Provide relevant context in 'notes' based on user interaction

Example question:
{
  "question": "How satisfied are you with our product's ease of use?",
  "duration": 30,
  "notes": "You've been using our product for 3 months"
}
`;


export const insigntsPrompt = `For each question, provide:
Key insights in JSON format:
[{
"question": "Question text",
"keyMetric": "Key metric with percentage. Give top percentages. Give only number and % sign",
"insightData": "Short and crisp insight with only 30 words with percentages and metrics that is suitable for linkedIn and social media posts for maximum reach and minimum readabilty effort . "
},

/* Graph data in JSON format not needed for all the elemnts only where it is necesary:



{"type":"graph. It should only contain the string 'graph'",
"insightData": "Short and crisp insight with percentages and metrics that is suitable for linkedIn and social media posts",
"graphType":"Suggest a suitable Graph type that'll make sense for the data the options include Area,bar,pie,line,radar,radical",
data:[
{
"label": "Category",
"value": Number,
"percentage": Percentage. Not a string but number,
}
]

}
]. This is an example format as to how I want the data [
  {
  "question": "/* Result data",
  "keyMetric": "/* Result data",
  "insightData": "/* Result data",
},  {
  "question": "/* Result data",
  "keyMetric": "/* Result data",
  "insightData": "/* Result data",
}...
, {
  "question": "/* Result data",
  "keyMetric": "/* Result data",
  "insightData": "/* Result data",
  "type": "/* Result data",
  "graphType": "/* Result data",
  "data": [{
    "label": "/* Result data",
    "value": /* Result data in number or percentage
    "percentage": /* Result data in number or percentage
  }, {
    "label": "/* Result data",
    "value": /* Result data in number or percentage
    "percentage": /* Result data in number or percentage
  }
  ...

]
}
.....
]. Use the same exact format everytime.You can include the graph in the beginning of the array also. Generate a minimum of 9 with a minimum of 4 graphs  and a maximum of 18 elements. return only the array without any {} in the beginning

This form has been filled by 80 users.Include top results, unexpected findings, and potential correlations. Keep in mind for array of numbers the label should be from 0 to the length of the array as label. Ensure all calculations and percentages are accurate. Give in a proper array of JSON format without any spaces or extra text as it will cause error the graph data should also be in the same array do not create a differnt array for the normal insights and graphs as it will create error `


export const fakeData = {
    "backgroundImage":"https://images.unsplash.com/photo-1723283042223-55eae950ad41?q=80&w=2046&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "formTitle": "Product Feedback Survey",
    "formDescription": "We value your feedback! Please take a few minutes to share your thoughts on our product.",
    "formName": "ProductFeedbackForm",
    "fields": [{
      "fieldName": "productName",
      "fieldType": "shortText",
      "fieldLabel": "What is the name of the product you are reviewing?",
      "fieldDescription": "Please enter the product name.",
      "placeholder": "Enter product name",
      "required": true
    }, {
      "fieldName": "overallExperience",
      "fieldType": "Rating",
      "fieldLabel": "How would you rate your overall experience with this product?",
      "fieldDescription": "Rate your experience on a scale of 1 to 5.",
      "options": [],
      "required": true
    }, {
      "fieldName": "feedback",
      "fieldType": "longText",
      "fieldLabel": "What did you like or dislike about the product?",
      "fieldDescription": "Please share your detailed feedback.",
      "placeholder": "Enter your feedback here",
      "required": true
    }, {
      "fieldName": "featuresUsed",
      "fieldType": "Checkbox",
      "fieldLabel": "Which features have you used?",
      "fieldDescription": "Select all that apply.",
      "options": [{
        "value": "Feature1",
        "label": "Feature 1"
      }, {
        "value": "Feature2",
        "label": "Feature 2"
      }, {
        "value": "Feature3",
        "label": "Feature 3"
      }],
      "required": true
    }, {
      "fieldName": "recommendProduct",
      "fieldType": "Radio",
      "fieldLabel": "Would you recommend this product to others?",
      "fieldDescription": "Please select one option.",
      "options": [{
        "value": "Yes",
        "label": "Yes"
      }, {
        "value": "No",
        "label": "No"
      }, {
        "value": "Maybe",
        "label": "Maybe"
      }],
      "required": true
    }, {
      "fieldName": "productImprovements",
      "fieldType": "Select",
      "fieldLabel": "What improvements would you suggest for this product?",
      "fieldDescription": "Select all that apply.",
      "options": [{
        "value": "ImproveFeature1",
        "label": "Improve Feature 1"
      }, {
        "value": "ImproveFeature2",
        "label": "Improve Feature 2"
      }, {
        "value": "ImproveFeature3",
        "label": "Improve Feature 3"
      }],
      "required": true
    }, {
      "fieldName": "easeOfUse",
      "fieldType": "OpinionScale",
      "fieldLabel": "How easy was the product to use?",
      "fieldDescription": "Rate on a scale of 0 (very difficult) to 10 (very easy).",
      "options": [],
      "required": true
    }]
  }
  
  

export const listOptions = [
    {
        heading: "Use AI",
        description: "Build the form with the list of available forms"
    },
    {
        heading: "Start from scratch",
        description: "Build the form with the list of available forms"
    },
    {
        heading: "Import questions",
        description: "Copy and paste the csv questions or import forms"
    },
]




interface ImageData {
    url: string;
    alt?: string;
    width: number;
  height: number;
  }
  
   export const newImagefromUnsplash: ImageData[] = [
      { url: "https://images.unsplash.com/23/pink-sky.JPG?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Image 1",width: 2076, 
      height: 1384  },
      { url: "https://images.unsplash.com/photo-1722865142814-2c0c3368a548?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Image 2",width: 2076, 
      height: 1384  },
      { url: "https://images.unsplash.com/photo-1506102383123-c8ef1e872756?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Image 3",width: 2076, 
      height: 1384  },
      { url: "https://images.unsplash.com/photo-1723283042223-55eae950ad41?q=80&w=2046&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Image 3",width: 2076, 
      height: 1384  },
      { url: "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5fHx8ZW58MHx8fHx8", alt: "Image 3",width: 2076, 
      height: 1384  },
      { url: "https://images.unsplash.com/photo-1723582218538-1a96e0e4cbac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDl8Ym84alFLVGFFMFl8fGVufDB8fHx8fA%3D%3D", alt: "Image 3",width: 2076, 
      height: 1384  },
    
    ];


    // export const newImagefromUnsplash: ImageData[] = [
    //   { url: "https://i.ibb.co/W2q67VY/photo-1506102383123-c8ef1e872756-Large.png", alt: "Image 1",width: 2076, 
    //   height: 1384  },
    //   { url: "https://i.ibb.co/hLTJhGW/photo-1510784722466-f2aa9c52fff6-1-Large.png", alt: "Image 2",width: 2076, 
    //   height: 1384  },
    //   { url: "https://i.ibb.co/mNMgrF8/photo-1722865142814-2c0c3368a548-Large.png", alt: "Image 3",width: 2076, 
    //   height: 1384  },
    //   { url: "https://i.ibb.co/2cH12hM/photo-1723283042223-55eae950ad41-Large.png", alt: "Image 3",width: 2076, 
    //   height: 1384  },
    //   { url: "https://i.ibb.co/J794DPm/photo-1723582218538-1a96e0e4cbac-Large.png", alt: "Image 3",width: 2076, 
    //   height: 1384  },
    //   { url: "https://i.ibb.co/SxjvcPB/pink-sky-Large.png", alt: "Image 3",width: 2076, 
    //   height: 1384  },
    
    // ];




    // let data =
    
    