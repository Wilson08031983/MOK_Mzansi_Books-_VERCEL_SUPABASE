import { NextApiRequest, NextApiResponse } from 'next';
import ContactService, { ContactData, ContactProperty } from '../../../services/ContactService';

const contactService = new ContactService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGetContacts(req, res);
        break;
      case 'POST':
        await handleCreateContact(req, res);
        break;
      case 'PUT':
        await handleUpdateContact(req, res);
        break;
      case 'DELETE':
        await handleDeleteContact(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Contact API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function handleGetContacts(req: NextApiRequest, res: NextApiResponse) {
  const { id, email } = req.query;

  if (id || email) {
    // Get specific contact
    const identifier = id || email;
    const contact = await contactService.getContact(identifier as string);
    res.status(200).json({ contact });
  } else {
    // Get all contact lists (for now, we'll return lists instead of all contacts)
    const lists = await contactService.getContactLists();
    res.status(200).json({ lists });
  }
}

async function handleCreateContact(req: NextApiRequest, res: NextApiResponse) {
  const { email, name, properties, listName, isCustomer } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let contact;
  
  if (isCustomer) {
    // Use helper method for customer contacts
    contact = await contactService.addCustomerContact(email, name, properties);
  } else {
    // Create regular contact
    const contactData: ContactData = {
      Email: email,
      Name: name,
      Properties: properties
    };
    
    contact = await contactService.createContact(contactData);
    
    // Add to specific list if provided
    if (listName) {
      const lists = await contactService.getContactLists();
      const targetList = lists.find(list => list.Name === listName);
      
      if (targetList && targetList.ID) {
        await contactService.addContactToList(contact.ID, targetList.ID);
      }
    }
  }

  res.status(201).json({ contact });
}

async function handleUpdateContact(req: NextApiRequest, res: NextApiResponse) {
  const { id, properties, excludeFromCampaigns, includeInCampaigns } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Contact ID is required' });
  }

  let result;

  if (properties) {
    result = await contactService.updateContactProperties(id, properties);
  }

  if (excludeFromCampaigns) {
    result = await contactService.excludeContactFromCampaigns(id);
  }

  if (includeInCampaigns) {
    result = await contactService.includeContactInCampaigns(id);
  }

  res.status(200).json({ result });
}

async function handleDeleteContact(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Contact ID is required' });
  }

  // For now, we'll exclude from campaigns instead of deleting
  const result = await contactService.excludeContactFromCampaigns(id);
  
  res.status(200).json({ result, message: 'Contact excluded from campaigns' });
}