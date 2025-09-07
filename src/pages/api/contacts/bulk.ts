import { NextApiRequest, NextApiResponse } from 'next';
import ContactService, { BulkContactOperation } from '../../../services/ContactService';
import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';

const contactService = new ContactService();

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handleBulkOperation(req, res);
        break;
      case 'GET':
        await handleJobStatus(req, res);
        break;
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Bulk Contacts API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function handleBulkOperation(req: NextApiRequest, res: NextApiResponse) {
  const contentType = req.headers['content-type'];

  if (contentType && contentType.includes('multipart/form-data')) {
    // Handle CSV upload
    await handleCSVUpload(req, res);
  } else {
    // Handle JSON bulk operation
    await handleJSONBulkOperation(req, res);
  }
}

async function handleJSONBulkOperation(req: NextApiRequest, res: NextApiResponse) {
  // Parse JSON body manually since bodyParser is disabled
  const body = await parseBody(req);
  const { action, contacts, contactsLists } = JSON.parse(body);

  if (!action || !contacts) {
    return res.status(400).json({ error: 'Action and contacts are required' });
  }

  const operation: BulkContactOperation = {
    Action: action,
    Contacts: contacts,
    ContactsLists: contactsLists
  };

  const result = await contactService.manageManyContacts(operation);
  res.status(200).json({ result });
}

async function handleCSVUpload(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({
    uploadDir: '/tmp',
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  const [fields, files] = await form.parse(req);
  const csvFile = Array.isArray(files.csv) ? files.csv[0] : files.csv;
  const listId = Array.isArray(fields.listId) ? fields.listId[0] : fields.listId;
  const action = Array.isArray(fields.action) ? fields.action[0] : fields.action;

  if (!csvFile || !listId || !action) {
    return res.status(400).json({ error: 'CSV file, listId, and action are required' });
  }

  try {
    // Parse CSV file
    const contacts = await parseCSVFile(csvFile.filepath);
    
    // Process contacts in batches
    const batchSize = parseInt(process.env.MAILJET_BULK_UPLOAD_THRESHOLD || '100');
    const batches = [];
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      batches.push(contacts.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const result = await contactService.manageContactsInList(
        parseInt(listId),
        action,
        batch
      );
      results.push(result);
    }

    // Clean up uploaded file
    fs.unlinkSync(csvFile.filepath);

    res.status(200).json({ 
      message: `Processed ${contacts.length} contacts in ${batches.length} batches`,
      results 
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (csvFile && csvFile.filepath) {
      try {
        fs.unlinkSync(csvFile.filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw error;
  }
}

async function handleJobStatus(req: NextApiRequest, res: NextApiResponse) {
  const { listId, jobId } = req.query;

  if (!listId || !jobId) {
    return res.status(400).json({ error: 'List ID and Job ID are required' });
  }

  const status = await contactService.getJobStatus(
    parseInt(listId as string),
    parseInt(jobId as string)
  );

  res.status(200).json({ status });
}

// Helper function to parse request body
function parseBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to parse CSV file
function parseCSVFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const contacts: any[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Convert CSV row to contact format
        const contact: any = {
          Email: row.email || row.Email,
          Name: row.name || row.Name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        };

        // Add properties if they exist
        const properties = [];
        for (const [key, value] of Object.entries(row)) {
          if (key !== 'email' && key !== 'Email' && key !== 'name' && key !== 'Name' && 
              key !== 'first_name' && key !== 'last_name' && value) {
            properties.push({ Name: key, Value: value });
          }
        }

        if (properties.length > 0) {
          contact.Properties = properties;
        }

        contacts.push(contact);
      })
      .on('end', () => {
        resolve(contacts);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}