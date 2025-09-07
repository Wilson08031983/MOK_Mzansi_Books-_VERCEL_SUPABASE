import { NextApiRequest, NextApiResponse } from 'next';
import ContactService from '../../../services/ContactService';

const contactService = new ContactService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGetLists(req, res);
        break;
      case 'POST':
        await handleCreateList(req, res);
        break;
      case 'PUT':
        await handleManageListContacts(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Contact Lists API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function handleGetLists(req: NextApiRequest, res: NextApiResponse) {
  const lists = await contactService.getContactLists();
  res.status(200).json({ lists });
}

async function handleCreateList(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'List name is required' });
  }

  const list = await contactService.createContactList(name);
  res.status(201).json({ list });
}

async function handleManageListContacts(req: NextApiRequest, res: NextApiResponse) {
  const { listId, action, contacts, contactId } = req.body;

  if (!listId) {
    return res.status(400).json({ error: 'List ID is required' });
  }

  let result;

  if (contacts && Array.isArray(contacts)) {
    // Bulk operation
    result = await contactService.manageContactsInList(listId, action, contacts);
  } else if (contactId) {
    // Single contact operation
    result = await contactService.addContactToList(contactId, listId);
  } else {
    return res.status(400).json({ error: 'Either contacts array or contactId is required' });
  }

  res.status(200).json({ result });
}