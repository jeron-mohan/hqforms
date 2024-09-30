"use server"
import { createForm } from '@/data/form';
import { NextApiRequest, NextApiResponse } from 'next';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const formData = req.body;
    const newForm = await createForm(formData);
    res.status(201).json(newForm);
  } catch (error) {
    console.error('Error creating form1:', error);
    res.status(500).json({ message: 'Error creating form1' });
  }
}