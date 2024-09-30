
"use server"
import { db } from "@/lib/db";



export const getFormById = async (id: string) => {
    try {
      const form = await db.forms.findUnique({
        where: { id },
        include: { formResult: true } 
      });
      return form;
    } catch (error) {
      console.error("Error fetching form:", error);
      return null;
    }
  };

  export const getVideoById = async (id: string) => {

    try {
      const form = await db.videoData.findUnique({
        where: { id } 
       });
      return form;
    } catch (error) {
      console.error("Error fetching form:", error);
      return null;
    }
  };

  export const createVideoForm = async (formData: {
    jsonForm: string;
    createdBy: string;
  }) => {
    try {
      const newForm = await db.videoData.create({
        data: formData
      });
      return newForm;
    } catch (error) {
      console.error("Error creating form:", error);
      throw error;
    }
  };


  export const getFormResultByFormId = async (formId: string) => {
    
    try {
      const formResult = await db.formResult.findUnique({
        where: { formId }
      });
      return formResult;
    } catch (error) {
      console.error("Error fetching form result:", error);
      return null;
    }
  };

  export const getAllForms = async () => {
    try {
      const formResult = await db.forms.findMany({
        select: {
          id: true,
          jsonForm: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      return formResult;
    } catch (error) {
      console.error("Error fetching form result:", error);
      return null;
    }
  };


  export const createForm = async (formData: {
    jsonForm: string;
    createdBy: string;
  }) => {
    try {
      const newForm = await db.forms.create({
        data: formData
      });
      return newForm;
    } catch (error) {
      console.error("Error creating form:", error);
      throw error;
    }
  };


  export const updateForm = async (
    formId: string,
    formData: {
      jsonForm: string;
    }
  ) => {
    try {
      const updatedForm = await db.forms.update({
        where: {
          id: formId
        },
        data: formData
      });
      return updatedForm;
    } catch (error) {
      console.error("Error updating form:", error);
      throw error;
    }
  };

  // export const upsertFormResult = async (formId: string, jsonResult: string, formResultId?: string) => {
  //   try {
  //     const upsertedFormResult = await db.formResult.upsert({
  //       where: {
  //         formId: formResultId ?? '',
  //       },
  //       update: {
  //         jsonResult,
  //       },
  //       create: {
  //         formId,
  //         jsonResult,
  //       },
  //     });
  //     return upsertedFormResult;
  //   } catch (error) {
  //     console.error("Error upserting form result:", error);
  //     throw error; // Rethrow the error for handling in the API route
  //   }
  // };


  export const createFormResult = async (formId: string, jsonResult: string) => {
    try {
      const newFormResult = await db.formResult.create({
        data: {
          formId,
          jsonResult
        }
      });
      return newFormResult;
    } catch (error) {
      console.error("Error creating form result:", error);
      throw error; // Rethrow the error for handling in the API route
    }
  };

  export const updateFormResult = async (formId: string, jsonResult: string) => {
    try {
      const newFormResult = await db.formResult.update(

        {
          where: {
            formId: formId
          },
          data: {
            jsonResult
          }
        }
        


      
    
    );
      return newFormResult;
    } catch (error) {
      console.error("Error creating form result:", error);
      throw error; // Rethrow the error for handling in the API route
    }
  };

  // export const updateFormResult = async (formResultId: string, jsonResult: string) => {
  //   try {
  //     const updatedFormResult = await db.formResult.update({
  //       where: {
  //         id: formResultId
  //       },
  //       data: {
  //         jsonResult
  //       }
  //     });
  //     return updatedFormResult;
  //   } catch (error) {
  //     console.error("Error updating form result:", error);
  //     throw error; // Rethrow the error for handling in the API route
  //   }
  // };


  export const getFormResult = async (formId: string) => {
    try {
      const formResult = await db.formResult.findUnique({
        where: {
          formId: formId
        },
        select: {
          id: true,
          jsonResult: true,
          createdAt: true
        }
      });
  
      if (!formResult) {
        throw new Error('Form result not found');
      }
  
      return formResult;
    } catch (error) {
      console.error("Error fetching form result:", error);
      throw error; 
    }
  };



  export async function upsertLargeTextDataResult(formId: string, newTextData: string[]) {
    try {
      // First, try to get the existing record
      const existingRecord = await db.largeTextDataResult.findUnique({
        where: { formId: formId },
        select: { textData: true },
      });
  
      let updatedTextData: string;
  
      if (existingRecord) {
        // If record exists, append new data to existing data
        updatedTextData = existingRecord.textData + '\n' + newTextData.join('\n');
      } else {
        // If no existing record, use only the new data
        updatedTextData = newTextData.join('\n');
      }
  
      // Now upsert with the combined data
      const result = await db.largeTextDataResult.upsert({
        where: {
          formId: formId,
        },
        update: {
          textData: updatedTextData,
        },
        create: {
          formId: formId,
          textData: updatedTextData,
        },
        select: {
          id: true,
          formId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
      return result;
    } catch (error) {
      console.error("Error upserting large text data result:", error);
      throw error;
    }
  }
  
  type JsonValue = string | number | boolean | JsonObject | JsonArray | null
  type JsonObject = { [Key in string]?: JsonValue }
  type JsonArray = JsonValue[]
  
  interface LargeTextDataResult {
    id: string;
    textData: JsonValue;
    createdAt: Date;
  }
  
  export async function getLargeTextDataResult(formId: string): Promise<LargeTextDataResult & { textData: string[] }> {
    try {
      const result = await db.largeTextDataResult.findUnique({
        where: { formId },
        select: {
          id: true,
          textData: true,
          createdAt: true,
        },
      });
  
      if (!result) {
        throw new Error('Form result not found');
      }
  
      let textDataArray: string[];
  
      if (typeof result.textData === 'string') {
        textDataArray = result.textData.split('\n').filter(item => item.trim() !== '');
      } else if (Array.isArray(result.textData)) {
        textDataArray = result.textData.map(item => String(item)).filter(item => item.trim() !== '');
      } else {
        throw new Error('Unexpected textData format');
      }
  
      return {
        ...result,
        textData: textDataArray,
      };
    } catch (error) {
      console.error("Error fetching large text data result:", error);
      throw error;
    }
  }