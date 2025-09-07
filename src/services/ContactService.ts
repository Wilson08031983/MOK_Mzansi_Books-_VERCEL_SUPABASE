import Mailjet from 'node-mailjet';

interface ContactProperty {
  Name: string;
  Value: string | number | boolean | Date;
}

interface ContactData {
  Email: string;
  Name?: string;
  IsExcludedFromCampaigns?: boolean;
  Properties?: ContactProperty[];
}

interface ContactList {
  ID?: number;
  Name: string;
  Address?: string;
  SubscriberCount?: number;
}

interface BulkContactOperation {
  Action: 'addforce' | 'addnoforce' | 'remove' | 'unsub';
  Contacts: ContactData[];
  ContactsLists?: { Action: string; ListID: number }[];
}

interface ContactMetadata {
  Name: string;
  Datatype: 'str' | 'int' | 'float' | 'datetime' | 'bool';
  NameSpace: 'static' | 'historic';
}

class ContactService {
  private mailjet: any;
  private contactApiUrl: string;
  private dataApiUrl: string;
  private defaultListName: string;
  private newsletterListName: string;
  private prospectsListName: string;
  private syncEnabled: boolean;
  private bulkThreshold: number;

  constructor() {
    // Initialize Mailjet client
    this.mailjet = new Mailjet({
      apiKey: process.env.VITE_MAILJET_API_KEY || '',
      apiSecret: process.env.VITE_MAILJET_SECRET_KEY || ''
    });

    // Load configuration from environment variables
    this.contactApiUrl = process.env.MAILJET_CONTACT_API_URL || 'https://api.mailjet.com/v3/REST';
    this.dataApiUrl = process.env.MAILJET_DATA_API_URL || 'https://api.mailjet.com/v3/DATA';
    this.defaultListName = process.env.MAILJET_DEFAULT_LIST_NAME || 'MOK_Customers';
    this.newsletterListName = process.env.MAILJET_NEWSLETTER_LIST_NAME || 'Newsletter_Subscribers';
    this.prospectsListName = process.env.MAILJET_PROSPECTS_LIST_NAME || 'Prospects';
    this.syncEnabled = process.env.MAILJET_CONTACT_SYNC_ENABLED === 'true';
    this.bulkThreshold = parseInt(process.env.MAILJET_BULK_UPLOAD_THRESHOLD || '100');
  }

  /**
   * Create a single contact
   */
  async createContact(contactData: ContactData): Promise<any> {
    try {
      const response = await this.mailjet
        .post('contact')
        .request({
          Email: contactData.Email,
          Name: contactData.Name || '',
          IsExcludedFromCampaigns: contactData.IsExcludedFromCampaigns || false
        });

      // Add properties if provided
      if (contactData.Properties && contactData.Properties.length > 0) {
        await this.updateContactProperties(response.body.Data[0].ID, contactData.Properties);
      }

      return response.body.Data[0];
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error(`Failed to create contact: ${error}`);
    }
  }

  /**
   * Get contact by email or ID
   */
  async getContact(identifier: string | number): Promise<any> {
    try {
      const response = await this.mailjet
        .get('contact')
        .id(identifier)
        .request();

      return response.body.Data[0];
    } catch (error) {
      console.error('Error getting contact:', error);
      throw new Error(`Failed to get contact: ${error}`);
    }
  }

  /**
   * Update contact properties
   */
  async updateContactProperties(contactId: number, properties: ContactProperty[]): Promise<any> {
    try {
      const response = await this.mailjet
        .put('contactdata')
        .id(contactId)
        .request({
          Data: properties
        });

      return response.body.Data[0];
    } catch (error) {
      console.error('Error updating contact properties:', error);
      throw new Error(`Failed to update contact properties: ${error}`);
    }
  }

  /**
   * Create contact metadata (custom properties)
   */
  async createContactMetadata(metadata: ContactMetadata): Promise<any> {
    try {
      const response = await this.mailjet
        .post('contactmetadata')
        .request({
          Datatype: metadata.Datatype,
          Name: metadata.Name,
          NameSpace: metadata.NameSpace
        });

      return response.body.Data[0];
    } catch (error) {
      console.error('Error creating contact metadata:', error);
      throw new Error(`Failed to create contact metadata: ${error}`);
    }
  }

  /**
   * Create a contact list
   */
  async createContactList(listName: string): Promise<ContactList> {
    try {
      const response = await this.mailjet
        .post('contactslist')
        .request({
          Name: listName
        });

      return response.body.Data[0];
    } catch (error) {
      console.error('Error creating contact list:', error);
      throw new Error(`Failed to create contact list: ${error}`);
    }
  }

  /**
   * Get all contact lists
   */
  async getContactLists(): Promise<ContactList[]> {
    try {
      const response = await this.mailjet
        .get('contactslist')
        .request();

      return response.body.Data;
    } catch (error) {
      console.error('Error getting contact lists:', error);
      throw new Error(`Failed to get contact lists: ${error}`);
    }
  }

  /**
   * Add contact to a list
   */
  async addContactToList(contactId: number, listId: number, isUnsubscribed: boolean = false): Promise<any> {
    try {
      const response = await this.mailjet
        .post('listrecipient')
        .request({
          ContactID: contactId,
          ListID: listId,
          IsUnsubscribed: isUnsubscribed
        });

      return response.body.Data[0];
    } catch (error) {
      console.error('Error adding contact to list:', error);
      throw new Error(`Failed to add contact to list: ${error}`);
    }
  }

  /**
   * Bulk contact management for multiple contacts to multiple lists
   */
  async manageManyContacts(operation: BulkContactOperation): Promise<any> {
    try {
      const payload: any = {
        Contacts: operation.Contacts
      };

      if (operation.ContactsLists) {
        payload.ContactsLists = operation.ContactsLists;
      }

      const response = await this.mailjet
        .post('contact')
        .action('managemanycontacts')
        .request(payload);

      return response.body.Data[0];
    } catch (error) {
      console.error('Error managing many contacts:', error);
      throw new Error(`Failed to manage many contacts: ${error}`);
    }
  }

  /**
   * Manage contacts in a specific list
   */
  async manageContactsInList(listId: number, action: string, contacts: ContactData[]): Promise<any> {
    try {
      const response = await this.mailjet
        .post('contactslist')
        .id(listId)
        .action('managemanycontacts')
        .request({
          Action: action,
          Contacts: contacts
        });

      return response.body.Data[0];
    } catch (error) {
      console.error('Error managing contacts in list:', error);
      throw new Error(`Failed to manage contacts in list: ${error}`);
    }
  }

  /**
   * Monitor bulk operation job status
   */
  async getJobStatus(listId: number, jobId: number): Promise<any> {
    try {
      const response = await this.mailjet
        .get('contactslist')
        .id(listId)
        .action('managemanycontacts')
        .id(jobId)
        .request();

      return response.body.Data[0];
    } catch (error) {
      console.error('Error getting job status:', error);
      throw new Error(`Failed to get job status: ${error}`);
    }
  }

  /**
   * Add contact to exclusion list
   */
  async excludeContactFromCampaigns(contactId: number): Promise<any> {
    try {
      const response = await this.mailjet
        .put('contact')
        .id(contactId)
        .request({
          IsExcludedFromCampaigns: true
        });

      return response.body.Data[0];
    } catch (error) {
      console.error('Error excluding contact from campaigns:', error);
      throw new Error(`Failed to exclude contact from campaigns: ${error}`);
    }
  }

  /**
   * Remove contact from exclusion list
   */
  async includeContactInCampaigns(contactId: number): Promise<any> {
    try {
      const response = await this.mailjet
        .put('contact')
        .id(contactId)
        .request({
          IsExcludedFromCampaigns: false
        });

      return response.body.Data[0];
    } catch (error) {
      console.error('Error including contact in campaigns:', error);
      throw new Error(`Failed to include contact in campaigns: ${error}`);
    }
  }

  /**
   * Initialize default contact lists for MOK Mzansi Books
   */
  async initializeDefaultLists(): Promise<void> {
    try {
      const existingLists = await this.getContactLists();
      const existingListNames = existingLists.map(list => list.Name);

      const defaultLists = [
        this.defaultListName,
        this.newsletterListName,
        this.prospectsListName
      ];

      for (const listName of defaultLists) {
        if (!existingListNames.includes(listName)) {
          await this.createContactList(listName);
          console.log(`Created contact list: ${listName}`);
        }
      }
    } catch (error) {
      console.error('Error initializing default lists:', error);
      throw new Error(`Failed to initialize default lists: ${error}`);
    }
  }

  /**
   * Initialize default contact metadata for MOK Mzansi Books
   */
  async initializeContactMetadata(): Promise<void> {
    try {
      const defaultMetadata: ContactMetadata[] = [
        { Name: 'first_name', Datatype: 'str', NameSpace: 'static' },
        { Name: 'last_name', Datatype: 'str', NameSpace: 'static' },
        { Name: 'phone_number', Datatype: 'str', NameSpace: 'static' },
        { Name: 'purchase_count', Datatype: 'int', NameSpace: 'static' },
        { Name: 'total_spent', Datatype: 'float', NameSpace: 'static' },
        { Name: 'last_purchase_date', Datatype: 'datetime', NameSpace: 'static' },
        { Name: 'preferred_genre', Datatype: 'str', NameSpace: 'static' },
        { Name: 'marketing_consent', Datatype: 'bool', NameSpace: 'static' },
        { Name: 'customer_type', Datatype: 'str', NameSpace: 'static' },
        { Name: 'registration_date', Datatype: 'datetime', NameSpace: 'static' }
      ];

      for (const metadata of defaultMetadata) {
        try {
          await this.createContactMetadata(metadata);
          console.log(`Created contact metadata: ${metadata.Name}`);
        } catch (error) {
          // Metadata might already exist, continue with next
          console.log(`Contact metadata ${metadata.Name} might already exist`);
        }
      }
    } catch (error) {
      console.error('Error initializing contact metadata:', error);
      throw new Error(`Failed to initialize contact metadata: ${error}`);
    }
  }

  /**
   * Helper method to add a customer contact with default properties
   */
  async addCustomerContact(email: string, name: string, additionalProperties?: ContactProperty[]): Promise<any> {
    try {
      const defaultProperties: ContactProperty[] = [
        { Name: 'customer_type', Value: 'customer' },
        { Name: 'registration_date', Value: new Date().toISOString() },
        { Name: 'marketing_consent', Value: true }
      ];

      const allProperties = additionalProperties 
        ? [...defaultProperties, ...additionalProperties]
        : defaultProperties;

      const contact = await this.createContact({
        Email: email,
        Name: name,
        Properties: allProperties
      });

      // Add to default customer list
      const lists = await this.getContactLists();
      const customerList = lists.find(list => list.Name === this.defaultListName);
      
      if (customerList && customerList.ID) {
        await this.addContactToList(contact.ID, customerList.ID);
      }

      return contact;
    } catch (error) {
      console.error('Error adding customer contact:', error);
      throw new Error(`Failed to add customer contact: ${error}`);
    }
  }
}

export default ContactService;
export type { ContactData, ContactProperty, ContactList, BulkContactOperation, ContactMetadata };