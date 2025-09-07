import { NextApiRequest, NextApiResponse } from 'next';
import ContactService from '../../../services/ContactService';

const contactService = new ContactService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Initializing Mailjet Contact Management...');
    
    // Initialize contact metadata
    await contactService.initializeContactMetadata();
    console.log('Contact metadata initialized');
    
    // Initialize default contact lists
    await contactService.initializeDefaultLists();
    console.log('Default contact lists initialized');
    
    res.status(200).json({ 
      message: 'Mailjet Contact Management initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Contact Management Initialization Error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize Contact Management', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}