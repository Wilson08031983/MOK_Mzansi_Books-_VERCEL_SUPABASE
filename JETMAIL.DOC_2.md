Email API Overview
About the Mailjet API
Hello and welcome to the Mailjet Email API!

The Mailjet API is organized around REST. It has predictable, resource-oriented URLs, and uses HTTP response codes to indicate API errors. All request and response bodies are encoded in JSON, including errors.

The API is accessed by making HTTPS requests to a specific version endpoint URL. GET, POST, PUT, and DELETE methods dictate how you interact with the available objects.

In the Mailjet API, all PUT requests behave like PATCH requests. The update will affect only the specified properties. The other properties of an existing resource will neither be modified, nor deleted. It also means that all non-mandatory properties can be omitted from your payload.
Each endpoint has a list of properties and methods you can see in our API Reference.

Authentication
All Email API endpoints requests are authenticated using HTTPS Basic Auth. It requires you to provide a username and a password for each API request.

The username is your API Key and the password is your API Secret Key - you can find them in your API Key Management page. Both keys are generated automatically when your account is created.

Pagination
Depending on your request and the endpoint, the results in the response may be paginated. Use the following query parameters to page through the results:

Name

Type

Description

Limit

integer

The number of results returned per page. The default value is 10, the maximum is 1000.

Offset

integer

The index of the first object in the page. For example, if you have set a limit of 100 and want to see objects 101 through 200, then Offset=100

Sort

string

Sort the results by a property and select ascending (ASC) or descending (DESC) order. The default order is ascending. Keep in mind that this is not available for all properties. Example: Sort=ArrivedAt+DESC

Status Codes
The Mailjet API uses conventional HTTP response codes to indicate the success or failure of an API request. See the full list of status codes for more information.

Getting Started
In this section we will guide you through the core features of the Mailjet Email API : sending an email and retrieving information about your sent messages, including engagement statistics (opens, clicks, etc.).

Let’s start!

Prerequisites
To use the Mailjet Email API, you need to:

Create a Mailjet account, then retrieve your API and Secret keys. They will be used for authentication purposes.
Make sure you have cURL installed on your machine, or use one of our official libraries in PHP, Python, Node.js, Java, C#, Go, and Ruby.
Alternatively, you can use Postman to test the different API endpoints. Click on the button below to import a pre-made collection of examples.

We also suggest that you create environment variables for your API and Secret keys for easy input.

On Mac OS / Linux:
1
export $MJ_APIKEY_PUBLIC='Enter your API Key here'
2
export $MJ_APIKEY_PRIVATE='Enter your API Secret here'
On Windows:
1
setx -m $MJ_APIKEY_PUBLIC "Enter your API Key here"
2
setx -m $MJ_APIKEY_PRIVATE "Enter your API Secret here"
Send your first email
First, define the sender and recipient email as environment variables. Keep in mind that the sender email should be validated in your Mailjet account (your signup email address will be automatically validated).

On Mac OS / Linux:
1
export $SENDER_EMAIL='Enter your sender email address here'
2
export $RECIPIENT_EMAIL='Enter your recipient email address here'
On Windows:
1
setx -m $SENDER_EMAIL "Enter your sender email address here"
2
setx -m $RECIPIENT_EMAIL "Enter your recipient email address here"
Then use the code sample to send a message.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Run:
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "$SENDER_EMAIL",
12
                "Name": "Me"
13
            },
14
            "To": [
15
                {
16
                    "Email": "$RECIPIENT_EMAIL",
17
                    "Name": "You"
18
                }
19
            ],
20
            "Subject": "My first Mailjet Email!",
21
            "TextPart": "Greetings from Mailjet!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
23
        }
24
    ]
25
  }'
API response:

1
{
2
  "Messages": [
3
    {
4
      "Status": "success",
5
      "To": [
6
        {
7
          "Email": "passenger@mailjet.com",
8
          "MessageID": "1234567890987654321",
9
          "MessageHref": "https://api.mailjet.com/v3/message/1234567890987654321"
10
        }
11
      ]
12
    }
13
  ]
14
}
Congratulations - you have successfully sent your first email!

Save the MessageID - we will need it in the next section to access detailed information about the sent email.

Retrieve sent messages
Now, let’s view the status of the sent message and its configuration specifics.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Run :
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/message/$MESSAGE_ID
API response:

1
{
2
  "Count": "1",
3
  "Data": [
4
    {
5
      "ArrivedAt": "2018-01-01T00:00:00",
6
      "AttachmentCount": "1",
7
      "AttemptCount": "1",
8
      "CampaignID": "123456789",
9
      "ContactAlt": "",
10
      "ContactID": "987654",
11
      "FilterTime": "111",
12
      "ID": "1234567890987654321",
13
      "Status": "clicked",
14
      "Subject": "",
15
      "UUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j"
16
      "........................."
17
    }
18
  ],
19
  "Total": "1"
20
}
As you can see, the information about the message is quite detailed and includes, among other things:

The time the message arrived
The contact, to which it was sent
Message size
Number of attachments
Current message status (e.g. sent, opened, clicked, etc.)
In case you want to view the contact email address, or the Subject of the email, add the ShowContactAlt=true and ShowSubject=true as query parameters, respectively.

Alternatively, you can retrieve messages sent to a specific recipient email address, using a query parameter:

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Run :
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/message?ContactAlt=$RECIPIENT_EMAIL
View message history
You can track important events linked to the sent emails, for example whether the recipient opened the message, or clicked on a link within.

Do a GET request on /messagehistory/{message_ID} to retrieve the list of events linked to the email we just sent.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Run :
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/messagehistory/$MESSAGE_ID
API response:

1
{
2
    "Count": 4,
3
    "Data": [
4
        {
5
            "EventAt": 1546958313,
6
            "EventType": "sent",
7
            ".........................."
8
        },
9
        {
10
            "EventAt": 1546958354,
11
            "EventType": "opened",
12
            ".........................."
13
        },
14
        {
15
            "EventAt": 1546958355,
16
            "EventType": "clicked",
17
            ".........................."
18
        }
19
    ],
20
    "Total": 4
21
}
We can see the event type, as well as a timestamp indicating when it happened. Pretty useful, right?

Since the API detects each email event, you are able to see multiple events of the same type, for example when the message is opened multiple times, or there are multiple link clicks.
Retrieve Statistics
The Mailjet API also has a variety of resources that help retrieve aggregated statistics for key performance indicators like opens, clicks, unsubscribes, etc.

Let's take a look at just one of those resources to give you a sample of the data you can read - we’ll retrieve total aggregated statistics for your API key.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Run :
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/statcounters?CounterSource=APIKey\&CounterTiming=Message\&CounterResolution=Lifetime
API response:

1
{
2
  "Count": "1",
3
  "Data": [
4
    {
5
      "APIKeyID": "123456",
6
      "MessageClickedCount": "1",
7
      "MessageDeferredCount": "0",
8
      "MessageHardBouncedCount": "0",
9
      "MessageOpenedCount": "1",
10
      "MessageQueuedCount": "0",
11
      "MessageSentCount": "1",
12
      "MessageSoftBouncedCount": "0",
13
      "MessageSpamCount": "0",
14
      "MessageUnsubscribedCount": "0",
15
      "Total": "1"
16
      "........................."
17
    }
18
  ],
19
  "Total": "1"
20
}
Next steps
You have played around with some of the basic functionalities of the Mailjet API, but there is so much more to learn! Continue reading to understand how to make the most out of the available resources.

Here's a small list of suggestions:

Verify Your Domain: Complete the SPF / DKIM authentication of your sender domains, which will ensure higher deliverability of your emails.
Send API v3.1:- Get acquainted with the full capabilities of our Send API - sending in bulk, using templates, adding headers and much more.
Event Tracking: Learn how to track email events (open, click, unsubscribe, bounce, etc.) in almost real time using webhooks or third party queuing systems.
Statistics: See the numerous possibilities to extract different delivery and engagement metrics.
For full information on all API endpoints, please visit our API Reference.


Verify Your Domain
We strongly recommend that you verify the domain or subdomain you will use for sending emails. To do so you have to go to your account settings and add the domain you want to use for sending emails. Once the domain is successfully set up we generate an SPF and a DKIM record for you.

SPF is a DNS TXT record and acts as a filter. It is used to specify a whitelist of IP addresses. This whitelist can be queried by mail clients to see whether a sender IP is in the list.

DKIM is another DNS TXT record and contains a public key. We automatically generate a public/private key pair for you after registration. The private key is used to sign every message you send. Email clients can then check your DKIM record and use it to verify the signature. Together, SPF and DKIM form the technical basis of email deliverability.

Tip: You can find both records together with instructions in your account settings. Go to your account setup page and click on the info button for your domain.
Once your domain is verified you should add the SPF and DKIM records to your domain using the domain configuration tool of your DNS Provider.

You can refer to our step-by-step user guides on creating DNS records:

OVH
GoDaddy
DreamHost
1&1 Ionos
You can also visit the offical and third-party documentations for DNS providers :

Amazon Route 53: SPF and DKIM
Bluehost: General DNS Setup
CloudFlare: DNS setup
Dreamhost: SPF, DKIM
DynDNS: General DNS setup
GoDaddy: SPF and DKIM
HostGator: General DNS setup
Hover: General DNS setup
Namecheap: DNS Setup
Network Solutions: General DNS setup
Rackspace: General DNS setup
Register.com: SPF, DKIM
United Domains: DKIM and SPF (in German)
With some DNS providers the setup can be quite tedious, but we would be happy to help you out. Just contact our support!

The validation of a domain can also be initiated with API calls. Prese refer to the Senders and Domains section for more information.


Send API v3.1
Send API v3.1 has been released in August 2017 bringing new functionalities, better error reporting and top-notch developer experience. Mailjet is still supporting Send API V3.

If you are a current user of Send API in version 3, we listed the changes you will need to take into account to migrate to v3.1.

Read this blogpost to learn more on how we designed our Send API V3.1 and where our Transactional Suite is going to.

Send a basic email
The Send API v3.1 sends a collection of messages, added in JSON array, called Messages. The input payload must start with it. The mandatory properties for any message element are:

From: JSON object, containing 2 properties: Name and Email address of a previously validated and active sender. Including the Name property in the JSON is optional. This property is not mandatory in case you use TemplateID and you specified a From address for the template. Format : { "Email":"value", "Name":"value" }.
To: array of JSON objects describing each recipient. Format : [{ "Email":"value", "Name":"value" },...]. Here again the inclusion of theNameproperty in the JSON is optional. The same is also valid for theCcandBcc objects, who have the same structure.
One of the following content parts is also mandatory :

TextPart and/or HtmlPart: content of the message, sent in Text and/or HTML format. At least one of these content types needs to be specified. When the HTML part is the only part provided, Mailjet will not generate a Text-part from the HTML version. The property can't be set when you use TemplateID.
TemplateID: an ID for a template that is previously created and stored in Mailjet's system. It is mandatory when From and TextPart and/or HtmlPart are not provided. Visit the Use a Template section for more information.
Important: The recipients listed in To will receive a common message, showing every other recipient and carbon copy (CC) recipients. If you do not wish the recipients to see each other, you have to create multiple messages in the Messages array.
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to one recipient.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
23
        }
24
    ]
25
  }'
API response:

1
{
2
  "Messages": [
3
    {
4
      "Status": "success",
5
      "To": [
6
        {
7
          "Email": "passenger1@mailjet.com",
8
          "MessageUUID": "123",
9
          "MessageID": 456,
10
          "MessageHref": "https://api.mailjet.com/v3/message/456"
11
        }
12
      ]
13
    }
14
  ]
15
}
Send API will send a response containing an array of Messages. Each instance of the message object will include the Status and the list of message UUIDs for each recipient in To, Cc and Bcc.

MessageUUID is the internal Mailjet ID of your message.

MessageID is the unique ID of the message (legacy format). You will be able to use this id to get more information about your message.

MessageHref is a URL, pointing to the API URL, where the message metadata can be retrieved. It is made of the API Base URL, the message resource path and the message ID (not UUID).

NOTICE: If you send an email to a contact, which is not registered in Mailjet, the system will automatically create and save it. Keep this in mind if you intend to use this email address later (for example to add it to a contact list), as it will already exist in Mailjet and there's no need to create it again.
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to one recipient.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                },
19
                {
20
                    "Email": "passenger2@mailjet.com",
21
                    "Name": "passenger 2"
22
                }
23
            ],
24
            "Cc": [
25
                {
26
                    "Email": "copilot@mailjet.com",
27
                    "Name": "Copilot"
28
                }
29
            ],
30
            "Bcc": [
31
                {
32
                    "Email": "air-traffic-control@mailjet.com",
33
                    "Name": "Air traffic control"
34
                }
35
            ],
36
            "Subject": "Your email flight plan!",
37
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
38
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
39
        }
40
    ]
41
  }'
API response:

1
{
2
  "Messages": [
3
    {
4
      "Status": "success",
5
      "To": [
6
        {
7
          "Email": "passenger1@mailjet.com",
8
          "MessageUUID": "123",
9
          "MessageID": 456,
10
          "MessageHref": "https://api.mailjet.com/v3/message/456"
11
        },
12
        {
13
          "Email": "passenger2@mailjet.com",
14
          "MessageUUID": "124",
15
          "MessageID": 457,
16
          "MessageHref": "https://api.mailjet.com/v3/message/457"
17
        }
18
      ],
19
      "Cc": [
20
        {
21
          "Email": "copilot@mailjet.com",
22
          "MessageUUID": "125",
23
          "MessageID": 458,
24
          "MessageHref": "https://api.mailjet.com/v3/message/458"
25
        }
26
      ],
27
      "Bcc": [
28
        {
29
          "Email": "air-traffic-control@mailjet.com",
30
          "MessageUUID": "126",
31
          "MessageID": 459,
32
          "MessageHref": "https://api.mailjet.com/v3/message/459"
33
        }
34
      ]
35
    }
36
  ]
37
}
Send with attached files
To attach files, use the properties Attachments or InlinedAttachments.
When using Attachments, the attachment will be separately added as a file and the recipient should click on it in order to see it. Normally, the inlined attachment(s) should be visible directly in the body of the message, but this depends on the recipient's email client behavior. In both calls, the content needs to be Base64 encoded. You also need to specify the MIME type and a file name.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to the given recipient with attachment.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!",
23
            "Attachments": [
24
                {
25
                    "ContentType": "text/plain",
26
                    "Filename": "test.txt",
27
                    "Base64Content": "VGhpcyBpcyB5b3VyIGF0dGFjaGVkIGZpbGUhISEK"
28
                }
29
            ]
30
        }
31
    ]
32
  }'
When using an inlined attachment, it's possible to insert the file inside the HTML code of the email by using cid:FILENAME.EXT, where FILENAME.EXT is the Filename specified in the declaration of the attachment. Optionally, you can set ContentID. It's converted to a Content-ID SMTP header. The value set must be unique - Mailjet isn't enforcing it - among all the inline attachments and can be used to reference the inlined attachment in the message body, using the following syntax in HTML (since plain text messages can not contain images): &lt;img src="cid:myimagecid"/&gt;

Remember to keep the size of your attachments small. They should not exceed 15 MB.
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to the given recipient with inline attachment.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <img src=\"cid:id1\"> <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!",
23
            "InlinedAttachments": [
24
                {
25
                    "ContentType": "image/png",
26
                    "Filename": "logo.png",
27
                    "ContentID": "id1",
28
                    "Base64Content": "iVBORw0KGgoAAAANSUhEUgAAABQAAAALCAYAAAB/Ca1DAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4wIIChcxurq5eQAAAAd0RVh0QXV0aG9yAKmuzEgAAAAMdEVYdERlc2NyaXB0aW9uABMJISMAAAAKdEVYdENvcHlyaWdodACsD8w6AAAADnRFWHRDcmVhdGlvbiB0aW1lADX3DwkAAAAJdEVYdFNvZnR3YXJlAF1w/zoAAAALdEVYdERpc2NsYWltZXIAt8C0jwAAAAh0RVh0V2FybmluZwDAG+aHAAAAB3RFWHRTb3VyY2UA9f+D6wAAAAh0RVh0Q29tbWVudAD2zJa/AAAABnRFWHRUaXRsZQCo7tInAAABV0lEQVQokaXSPWtTYRTA8d9N7k1zm6a+RG2x+FItgpu66uDQxbFurrr5OQQHR9FZnARB3PwSFqooddAStCBoqmLtS9omx+ESUXuDon94tnP+5+1JYm057GyQjZFP+l+S6G2FzlNe3WHtHc2TNI8zOlUUGLxsD1kDyR+EEQE2P/L8Jm/uk6RUc6oZaYM0JxtnpEX9AGPTtM6w7yzVEb61EaSNn4QD3j5m4QabH6hkVFLSUeqHyCeot0ib6BdNVGscPM/hWWr7S4Tw9TUvbpFUitHTnF6XrS+sL7O6VBSausT0FZonSkb+nZUFFm+z8Z5up5Btr1Lby7E5Zq4yPrMrLR263ZV52g+LvfW3iy6PXubUNVrnhqYNF3bmiZ1i1MmLnL7OxIWh4T+IMpYeRNyrRzyZjWg/ioh+aVgZu4WfXxaixbsRve5fiwb8epTo8+kZjSPFf/sHvgNC0/mbjJbxPAAAAABJRU5ErkJggg=="
29
                }
30
            ]
31
        }
32
    ]
33
  }'
Send in bulk
To send messages in bulk, package the multiple messages inside the Messages property.

The messages’ order is preserved from the user input, allowing you to identify which message response corresponds to your original message payload.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends 2 messages to 2 different recipients.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
23
        },
24
        {
25
            "From": {
26
                "Email": "pilot@mailjet.com",
27
                "Name": "Mailjet Pilot"
28
            },
29
            "To": [
30
                {
31
                    "Email": "passenger2@mailjet.com",
32
                    "Name": "passenger 2"
33
                }
34
            ],
35
            "Subject": "Your email flight plan!",
36
            "TextPart": "Dear passenger 2, welcome to Mailjet! May the delivery force be with you!",
37
            "HTMLPart": "<h3>Dear passenger 2, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!<br />May the delivery force be with you!"
38
        }
39
    ]
40
  }'
API response:

1
{
2
  "Messages": [
3
    {
4
      "Status": "success",
5
      "To": [
6
        {
7
          "Email": "passenger1@mailjet.com",
8
          "MessageUUID": "123",
9
          "MessageID": 20547681647433000,
10
          "MessageHref": "https://api.mailjet.com/v3/message/20547681647433000"
11
        }
12
      ]
13
    },
14
    {
15
      "Status": "success",
16
      "To": [
17
        {
18
          "Email": "passenger2@mailjet.com",
19
          "MessageUUID": "124",
20
          "MessageID": 20547681647433001,
21
          "MessageHref": "https://api.mailjet.com/v3/message/20547681647433001"
22
        }
23
      ]
24
    }
25
  ]
26
}
In case of errors on one or several of the messages, the API will not stop the processing of other successful messages. All validated messages will be processed for sending and the response will include both MessageIDs and Error reports.

API response:

1
{
2
  "Messages": [
3
    {
4
      "Errors": [
5
        {
6
          "ErrorIdentifier": "88b5ca9f-5f1f-42e7-a45e-9ecbad0c285e",
7
          "ErrorCode": "send-0003",
8
          "StatusCode": 400,
9
          "ErrorMessage": "At least \"HTMLPart\", \"TextPart\" or \"TemplateID\" must be provided.",
10
          "ErrorRelatedTo": ["HTMLPart", "TextPart"]
11
        }
12
      ],
13
      "Status": "error"
14
    },
15
    {
16
      "Status": "success",
17
      "CustomID": "",
18
      "To": [
19
        {
20
          "Email": "passenger2@mailjet.com",
21
          "MessageUUID": "cb927469-36fd-4c02-bce4-0d199929a207",
22
          "MessageID": 70650219165027410,
23
          "MessageHref": "https://api.mailjet.com/v3/REST/message/70650219165027410"
24
        }
25
      ],
26
      "Cc": [],
27
      "Bcc": []
28
    }
29
  ]
30
}
Set global payload properties
If you are sending messages in bulk, often times some property values within your payload will be the same across multiple messages. To avoid repetition and simplify the structure of your payload, you can use Globals to specify specific properties. Those will then be applied to all message objects.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to one recipient.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Globals": {
9
        "From": {
10
            "Email": "pilot@mailjet.com",
11
            "Name": "Mailjet Pilot"
12
        },
13
        "Subject": "Your email flight plan!"
14
    },
15
    "Messages":[
16
        {
17
            "To": [
18
                {
19
                    "Email": "passenger1@mailjet.com",
20
                    "Name": "passenger 1"
21
                }
22
            ],
23
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
24
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
25
        },
26
        {
27
            "To": [
28
                {
29
                    "Email": "passenger2@mailjet.com",
30
                    "Name": "passenger 2"
31
                }
32
            ],
33
            "TextPart": "Dear passenger 2, welcome to Mailjet! ",
34
            "HTMLPart": "<h3>Dear passenger 2, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
35
        }
36
    ]
37
  }'
In Globals you can specify values for all message properties, except To.

Whenever a certain property is specified in both Globals and a message object, the way they interact depends on the property type:

String, integer and boolean properties will be overwritten by the message properties of the same name.
Example:

Globals: "Subject": "Your email flight plan!"

Message: "Subject": "Your promo code!"

Final result: "Subject": "Your promo code!"

Object type properties (From, Sender, ReplyTo, TemplateErrorReporting, Headers, Variables) will be merged with the message property, overwriting any concurrent property.
Example:

Globals: "variables" : {"var1":"value1","var2":"value2"}

Message: "variables" : {"var1":"value1_bis","var3":"value3"}

Final result: "variables" : {"var1":"value1_bis","var2":"value2","var3":"value3"}

Array type properties (Cc, Bcc, Attachments, InlineAttachments) will be appended.
Example:

Globals: "Cc" : [{"Email":"passenger@mailjet.com","Name":"passenger"}]

Message: "Cc" : [{"Email":"passenger2@mailjet.com","Name":"passenger2"}]

Final result: "Cc" : [{"Email":"passenger@mailjet.com","Name":"passenger"}, {"Email":"passenger2@mailjet.com","Name":"passenger2"}]

Personalization
Content formatting
Mailjet offers a templating language that allows you to personalize your transactional messages. It enables you to insert data in your text or HTML parts.

To do so, use {{DATA_TYPE:DATA_NAME}} where:

DATA_TYPE: var for Variables specified in the API call or data for contact data, which is already available in the Mailjet system
DATA_NAME: name of the data you want to insert
NOTICE: The TemplateLanguage property should be set to true to force Send API to interpret the template language (X-MJ-TemplateLanguage in case you are using SMTP).
Visit our Transactional templating guide to learn about additional substitutions, modification functions and conditional statements you can use to personalize your messages.

Use vars and custom vars
By using Variables in conjunction with the {{var:VAR_NAME}} or {{var:VAR_NAME:DEFAULT_VALUE}} , you can modify the content of your email with variables, pushed in your Send API call.

DEFAULT_VALUEis the default value that will be used, if the variable is not defined in the API call.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to a recipient with global personalisation.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Variables": {
21
                "day": "Monday"
22
            },
23
            "TemplateLanguage": true,
24
            "Subject": "Your email flight plan!",
25
            "TextPart": "Dear passenger, welcome to Mailjet! On this {{var:day}}, may the delivery force be with you!",
26
            "HTMLPart": "<h3>Dear passenger, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />On this {{var:day}}, may the delivery force be with you!"
27
        }
28
    ]
29
  }'
Use contact properties
If the contact you are sending an email to is already existing in the Mailjet system with some contact data, you can leverage this information to personalize your email.

Use {{data:METADATA_NAME}} or {{data:METADATA_NAME:DEFAULT_VALUE}} to insert data in your content.

DEFAULT_VALUE is the default value that will be used if no data is found.

Refer to the Personalization section for more information on how to add contact properties.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to the a recipient with contact property personalisation.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "TemplateLanguage": true,
21
            "Subject": "Your email flight plan!",
22
            "TextPart": "Dear {{data:firstname:\"passenger\"}}, welcome to Mailjet! May the delivery force be with you!",
23
            "HTMLPart": "<h3>Dear {{data:firstname:\"passenger\"}}, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!<br /> May the delivery force be with you!"
24
        }
25
    ]
26
  }'
Use a Template
Mailjet offers to store your transactional message templates on its platform. You can use these templates to avoid repeating the content of a transactional message at each Send API call.

You can either create the templates through our online drag and drop tool Passport or through the /template resource.

You can also follow our Step by Step guide to create your first Passport template with templating language.

In the templates, you will be able to use simple personalization ([[data:property_name]] or [[var:variable_name]]) or advanced templating language ({{data:property_name}}, {{var:variable_name}}, conditional statements and loop statements).

In this sample, TemplateID will be the ID provided by Passport at the end of your designing process or the ID returned by the /template resource.

The TemplateLanguage property in the payload provided to Send API is optional, but if you want to have the templating language interpreted, it will be mandatory and must have a true value.
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message based on a template.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "TemplateID": 1,
21
            "TemplateLanguage": true,
22
            "Subject": "Your email flight plan!"
23
        }
24
    ]
25
  }'
Use Templating Language
Mailjet Send API allows you to leverage the Mailjet templating language in your transactional messages.

The Mailjet Templating Language enables you to achieve:

variable substitution
conditions, including usage of contacts segments
loops
and a lot more...
The TemplateLanguage property in the payload provided to Send API is optional but if you want to have the templating language interpreted, it will be mandatory and must have a true value.
Find our dedicated guide here.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to the given recipient with vars and custom vars.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "TextPart": "Dear passenger, welcome to Mailjet! On this {{var:day:\"monday\"}}, may the delivery force be with you! {{var:personalmessage:\"\"}}",
21
            "HTMLPart": "<h3>Dear passenger, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!<br /> On this {{var:day:\"monday\"}}, may the delivery force be with you! {{var:personalmessage:\"\"}}",
22
            "TemplateLanguage": true,
23
            "Subject": "Your email flight plan!",
24
            "Variables": {
25
                "day": "Tuesday",
26
                "personalmessage": "Happy birthday!"
27
            }
28
        }
29
    ]
30
  }'
Add Email Headers
In every message, you can specify your own Email headers using the Headers property. These headers will be added to the SMTP headers of the message, delivered to the recipient.

Only headers that don’t have a dedicated property in the message payload can be customized through the Headers property. In addition, some headers can’t be customized.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends an email to one recipient with an additional SMTP header
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!<br />May the delivery force be with you!",
23
            "Headers": {
24
                "X-My-header": "X2332X-324-432-534"
25
            }
26
        }
27
    ]
28
  }'
List of forbidden headers :


From

Sender

Subject

To


Cc

Bcc

Return-Path

Delivered-To


DKIM-Signature

DomainKey-Status

Received-SPF

Authentication-Results


Received

X-Mailjet-Prio

X-Mailjet-Debug

User-Agent


X-Mailer

X-MJ-CustomID

X-MJ-EventPayload

X-MJ-Vars


X-MJ-TemplateErrorDeliver

X-MJ-TemplateErrorReporting

X-MJ-TemplateLanguage

X-Mailjet-TrackOpen


X-Mailjet-TrackClick

X-MJ-TemplateID

X-MJ-WorkflowID

X-Feedback-Id


X-Mailjet-Segmentation

List-Id

X-MJ-MID

X-MJ-ErrorMessage


Date

X-CSA-Complaints

Message-Id

X-Mailjet-Campaign


X-MJ-StatisticsContactsListID



Tag Email Messages
Mailjet provides 2 properties to tag messages with your own custom information.

These custom tags are included in the events triggered by our Event API and in the messages processed via our Parse API.

Send an email with a custom ID
Sometimes you may need to use your own ID, in addition to ours, to be able to easily trace back the message in our system. To achieve this, just pass the ID you wish in the CustomID property.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to one recipient with a CustomID
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!<br />May the delivery force be with you!",
23
            "CustomID": "PassengerEticket1234"
24
        }
25
    ]
26
  }'
Your CustomID will be linked to our own UUID. You can also retrieve the message later by providing it to the /message resource with CustomID filter.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# View : API Key Statistical campaign/message data.
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/message?CustomID=PassengerEticket1234
Send an email with a payload
Sometimes, you need more than just an ID to represent the context of a specific message. For this purpose, we let you insert a payload in the message which can be of any format (XML, JSON, CSV, etc). To take advantage of this, just pass the payload you want in the EventPayload property.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to one recipient with an EventPayload.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!<br />May the delivery force be with you!",
23
            "EventPayload": "Eticket,1234,row,15,seat,B"
24
        }
25
    ]
26
  }'
Group into a campaign
Messages sent through Send API can be regrouped into campaigns to simulate the behavior of a regular marketing campaign. This could help you with pulling advanced statistics for your transactional campaigns.

Use the Property CustomCampaign to specify the name of the campaign the message will be classified in. If the campaign doesn't already exist, it will be automatically created in the Mailjet system.

By default, Mailjet lets you send multiple emails with the same campaign to the same contact. To block this feature, use DeduplicateCampaign with the value true to stop contacts from being emailed several times in the same campaign.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to one recipient within a campaign blocking multiple messages to same recipient
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!",
23
            "CustomCampaign": "SendAPI_campaign",
24
            "DeduplicateCampaign": true
25
        }
26
    ]
27
  }'
Add URL tags
If you need to add tracking parameters in all your URLS in one simple way in your message, Send API offers the URLTags property. This solution will be perfect for passing UTM parameters for your traffic analytics in a easy way, without having to modify every single URLs in your message yourself.

You just need to provide the query part between the first "?" character and "#" character.

So if you want to have a URL in this format: http://www.example.com?param1=1&param2=2

You will just need to specify : "URLTags":"param1=1&param2=2"

In your HTMLPart or template, you will only need to specify the href http://www.example.com.

Mailjet will add the parameters in all of the URLs in your message, before adding the Mailjet click tracking and sending the message. The URLs in your click statistics will include the URLTags provided.

NOTICE: The string provided needs to be properly encoded (ie : space becomes %20, " becomes %22 ... ) see more information here
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This calls sends an email to one recipient.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"http://www.mailjet.com\">Mailjet</a>!</h3><br />May the delivery force be with you!",
23
            "URLTags": "param1=1&param2=2"
24
        }
25
    ]
26
  }'
Sandbox Mode
The Send API v3.1 allows to run the API call in a Sandbox mode, where all validations of the payload will be done without delivering the message.

By setting the SandboxMode property to a true value, you will turn off the delivery of the message while still getting back the full range of error messages that could be related to your message processing. If the message is processed without error, the response will follow the normal response payload format, omitting only the MessageID and MessageUUID.

NOTICE: The SandboxMode property is a Send API JSON payload root property like Messages, not a message JSON property.
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message to one recipient in sandbox mode.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "Subject": "Your email flight plan!",
21
            "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
22
            "HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!<br />May the delivery force be with you!"
23
        }
24
    ],
25
    "SandboxMode":true
26
  }'
API response:

1
{
2
  "Messages": [
3
    {
4
      "Status": "success",
5
      "CustomID": "",
6
      "To": [
7
        {
8
          "Email": "passenger1@mailjet.com",
9
          "MessageUUID": "",
10
          "MessageID": 0,
11
          "MessageHref": "https://api.mailjet.com/v3/message/0"
12
        }
13
      ],
14
      "Cc": [],
15
      "Bcc": []
16
    }
17
  ]
18
}
19
```
20
​
21
## Send API JSON properties
22
​
23
The main content of the Send API payload will be the `Messages` property, which is a collection of messages, represented as a JSON array. This is the only mandatory property within the payload.
24
​
25
Additionally, you can use the [`Globals` property](#set-global-payload-properties) to specify values for properties to be applied to all objects within the `Messages` array.
26
​
27
Finally, you can enable [Sandbox mode](#sandbox-mode) by setting the `SandboxMode` property to `true`.
28
​
29
Full descriptions of the properties of each message can be found in the [Email API reference](/email/reference/send-emails/#v3_post_send)
30
​
31
## Send API errors
32
​
33
When an error occurs on a message validation, a `error` `Status` will be returned in the response. The description of the error(s) will be contain in the `Errors` property.
34
Each error will contain the following properties:
35
​
36
- `ErrorIdentifier`: internal Mailjet Error identifier
37
- `ErrorCode`: standardized classification of the error (see table bellow)
38
- `StatusCode`: Status code of the error , follow the http status code
39
- `ErrorMessage`: description of the error
40
- `ErrorRelatedTo`: list of message properties related to this error
41
​
42
**Global Error (example: broken JSON format)**
43
​
44
```json
45
{
46
  "ErrorIdentifier": "06df1144-c6f3-4ca7-8885-7ec5d4344113",
47
  "ErrorCode": "mj-0002",
48
  "ErrorMessage": "Malformed JSON, please review the syntax and properties types.",
49
  "StatusCode": 400
50
}
Error in validation of the JSON Payload

API response:

1
{
2
  "Messages": [
3
    {
4
      "Status": "error",
5
      "Errors": [
6
        {
7
          "ErrorIdentifier": "f987008f-251a-4dff-8ffc-40f1583ad7bc",
8
          "ErrorCode": "mj-0004",
9
          "StatusCode": 400,
10
          "ErrorMessage": "Type mismatch. Expected type \"array of emails\".",
11
          "ErrorRelatedTo": ["HTMLPart", "TemplateID"]
12
        },
13
        {
14
          "ErrorIdentifier": "8e28ac9c-1fd7-41ad-825f-1d60bc459189",
15
          "ErrorCode": "mj-0005",
16
          "StatusCode": 400,
17
          "ErrorMessage": "The To is mandatory but missing from the input",
18
          "ErrorRelatedTo": ["To"]
19
        }
20
      ]
21
    }
22
  ]
23
}
In bulk sending (multiple instances of messages in Messages), we will process each message separately. As a result, the response can contain both success and error notifications. For a single message, Send API can return multiple errors, each related to different properties of the payload.

Status Code

Error Code

Description

Related To

400

send-0003

when none of the HTML, Text, TemplateID properties are provided.

HTMLPart, TextPart, TemplateID

400

send-0004

when providing HTML property, as well as a template also containing an HTML part - i.e. Duplicated content

HTMLPart, TemplateID

403

send-0006

when the API key doesn’t have permission to use a Sender header. Please contact our support team to be granted permission.

SenderID

403

send-0007

when SenderID is provided but not validated.

SenderID

403

send-0008

when the sender email address provided in the From property is not authorized. The validation can be done on the Sender domains & addresses page or through the API.

From

400

send-0010

when the API key can’t send the provided template. Please verify the owner of the template.

TemplateID

400

send-0011

when one of the forbidden headers (headers that have a property alternative) is set in the Headers collection. Please use the dedicated message property to set this header.

Headers["headerName"]

400

send-0012

when DeduplicateCampaign is set to true while no CustomCampaign is defined.

CustomCampaign, DeduplicateCampaign

400

send-0015

when the total number of recipients is over the limit.

To,CC,Bcc

400

send-0016

when TemplateLanguage value is missing but TemplateErrorReporting or TemplateErrorDeliver are present.

TemplateLanguage

401

mj-0001

when API key is suspended.

400

mj-0002

when the API call contains payload with an invalid JSON syntax.

400

mj-0003

when a mandatory property is missing or with null value. See ErrorRelatedTo for a list

400

mj-0004

when there is a type mismatch in the value of a property

400

mj-0005

when a property value is not an allowed values.

Priority

TrackClicks

TrackOpens


400

mj-0006

when a property contains more than the maximum allowed number of characters.

Subject

URLTags


400

mj-0007

when an empty array is provided that cannot be empty.

Messages

To


400

mj-0008

when an array property contains more than the maximum allowed number of elements. Max Allowed item limit is 50.

Messages

Attachments

InlineAttachments

Headers

Variables


400

mj-0011

when the payload size is over the limit.

400

mj-0012

when an empty string value is provided.

Email

FileName

Base64Content

ContentType


400

mj-0013

when the email address format is invalid.

Email

401

mj-0015

when the user did not provide valid authorization credentials.

When the HTTP status for the API call is 500, you will see ErrorIdentifier field. It will contain a reference to the error in our internal log and it is crucial for us to determine the root cause of the failure. Should you encounter such errors, please contact our support for additional investigation, providing this error identifier.


Contact Management
Overview
Contact management within the Mailjet API is done by managing three types of objects:

Contacts represent the email addresses you want to send your messages to
Contact properties are additional custom data about your contacts you can store in Mailjet
Contact lists help you organize your contacts to easily select the part of your contact base you want to send your campaigns to
List recipients manage the relationship between a contact and a contact list - every instance of a contact being added to a list creates a new list recipient
Single contact management
Create a contact
You can create new contacts with a POST request on the contact resource.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contact \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "IsExcludedFromCampaigns":"true",
8
      "Name":"New Contact",
9
      "Email":"passenger@mailjet.com"
10
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "IsExcludedFromCampaigns": true,
6
      "Name": "New Contact",
7
      "CreatedAt": "2018-01-01T00:00:00",
8
      "DeliveredCount": 10,
9
      "Email": "passenger@mailjet.com",
10
      "ExclusionFromCampaignsUpdatedAt": "2018-01-01T00:00:00",
11
      "ID": 123456789,
12
      "IsOptInPending": false,
13
      "IsSpamComplaining": false,
14
      "LastActivityAt": "2018-01-01T00:00:00",
15
      "LastUpdateAt": "2018-01-01T00:00:00",
16
      "UnsubscribedAt": "2018-01-01T00:00:00",
17
      "UnsubscribedBy": "2018-01-01T00:00:00"
18
    }
19
  ],
20
  "Total": 1
21
}
`
Manage Contact Properties
If you want to add more granular details about your contacts, Mailjet provides the capability to add custom data to contacts. This additional data can help you personalize the emails you are sending, and allows you to target specific sections of your customers using segmentation.

The addition of custom data starts with the definition of the extra information to store with the contacts (It could be for example the country the contacts live in, how old the contacts are, their current income, the value of their purchases on your site...) and how this data will be stored (string, number, boolean...).

To define custom contact data, perform a POST on /contactmetadata with the following properties:

Name : the name of the custom data field
DataType : the type of data that is being stored (this can be either a str, int, float, datetime or bool)
NameSpace : this can be either static or historic (legacy)

Keep in mind that the accepted formats for a datetime data type are Unix timestamp (e.g. 1514764800) and RFC3339 (e.g. 2018-01-01T00:00:00)
cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contactmetadata \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "Datatype":"str",
8
      "Name":"first_name",
9
      "NameSpace":"static"
10
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "Datatype": "str",
6
      "ID": 4321,
7
      "Name": "first_name",
8
      "NameSpace": "static"
9
    }
10
  ],
11
  "Total": 1
12
}
`
To add, edit or update the data saved for a specific contact, do a PUT request on /contactdata/{contact_ID or contact_email}.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X PUT \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contactdata/$contact_ID \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "Data":[
8
        {
9
          "Name":"first_name",
10
          "Value":"John"
11
        }
12
      ]
13
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "Data": [
6
        {}
7
      ],
8
      "ContactID": 123456,
9
      "ID": 123456
10
    }
11
  ],
12
  "Total": 1
13
}
`
Contact data can also be added for multiple contacts at the same time by using the bulk contact management resources.

Create a contact list
Contact lists are created with POST request on the /contactslist

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contactslist \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "Name":"my_contactslist"
8
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "Name": "my_contactslist",
6
      "Address": "abcdef123",
7
      "CreatedAt": "2018-01-01T00:00:00",
8
      "ID": 123456,
9
      "SubscriberCount": 111
10
    }
11
  ],
12
  "Total": 1
13
}
`
Add a contact to a contact list
To add a contact to a list, you need to create a new list recipient with a POST request on the /listrecipient resource. You can specify the contact by either providing the contact ID (in ContactID) or email address (in ContactAlt), as well as the list with either the list ID (in ListID) or the list name (in ListAlt).

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/listrecipient \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "IsUnsubscribed":"true",
8
      "ContactID":"987654321",
9
      "ContactAlt":"passenger@mailjet.com",
10
      "ListID":"123456",
11
      "ListAlt":"abcdef123"
12
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "IsUnsubscribed": true,
6
      "ContactID": 987654321,
7
      "ID": 1234567890,
8
      "IsActive": true,
9
      "ListID": 123456,
10
      "ListName": "abcdef123",
11
      "SubscribedAt": "2018-01-01T00:00:00",
12
      "UnsubscribedAt": "2018-01-01T00:00:00"
13
    }
14
  ],
15
  "Total": 1
16
}
`
Bulk contact management
The bulk contact management resources help you manage the status of one or more contacts in relation to a single or multiple contact lists with a single call. The most common use cases for these resources are:

Quickly importing the contact base from your app / CRM into your Mailjet account
Clearing your contact lists by unsubscribing or removing contacts from them in regular intervals
Available methods
The available methods are:

Manage the subscription status of a single contact to multiple contact lists
Manage the subscription status of multiple contacts to a single contact list
Manage the subscription status of multiple contacts to multiple contact lists
Manage the link of multiple contacts to a list via a CSV upload
Choosing an action
When using these resources, you always need to select an action to be performed:

addforce : Add the contacts to the list and subscribe all of them. If the contact is already present in the list as unsubscribed, it will be forcibly subscribed once again.
addnoforce : Add the contacts to the list and subscribe them to it. If the contact is already present, it will retain its subscription status, i.e. if a contact is part of the list, but unsubscribed, it will not be forcibly subscribed again.
remove : Remove the contacts from the list
unsub : Unsubscribe the contacts from the list
Adding contact properties
In addition to managing contacts, all of the methods covered in this guide allow you to include contact properties in your payload, thus helping you easily save relevant contact data in Mailjet. The values of these properties can later be used to personalize your emails, or to focus your campaigns on specific segments of your customer base.

Manage the subscription status of an existing contact
To manage a Contact subscription for one or multiple Lists, do a POST on /contact/{contact_ID}/managecontactslists.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contact/$contact_ID/managecontactslists \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "ContactsLists":[
8
        {
9
          "Action":"addforce",
10
          "ListID":"987654321"
11
        },
12
        {
13
          "Action":"addnoforce",
14
          "ListID":"987654321"
15
        },
16
        {
17
          "Action":"remove",
18
          "ListID":"987654321"
19
        },
20
        {
21
          "Action":"unsub",
22
          "ListID":"987654321"
23
        }
24
      ]
25
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "ContactsLists": [
6
        {
7
          "ListID": 987654321,
8
          "Action": "addnoforce"
9
        }
10
      ]
11
    }
12
  ],
13
  "Total": 1
14
}
`
Manage multiple contacts in a list
The /contactslist/{list_ID}/managemanycontacts resource allows you to add, remove or unsubscribe multiple contacts to / from a list. This resource is asynchronous and will return a JobID, which you can use to monitor the process.

If you are specifying Properties for a contact, please note that these properties must already be defined using the /contactmetadata resource. To delete the custom contact data for a specific contact, set the value of the contact property to null.

If a contact has already been added to your contacts or a list, duplicate entries or subscriptions will NOT be created. However, the Properties and Name of the contact will be updated with any modified values.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contactslist/$list_ID/managemanycontacts \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "Action":"addnoforce",
8
      "Contacts":[
9
        {
10
          "Email":"passenger@mailjet.com",
11
          "IsExcludedFromCampaigns":"false",
12
          "Name":"Passenger 1",
13
          "Properties":"object"
14
        }
15
      ]
16
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "JobID": 54321
6
    }
7
  ],
8
  "Total": 1
9
}
`
Monitor the upload job
Use the JobID returned in the response of the POST /contactslist/{list_ID}/managemanycontacts request to follow the upload process. Do this with GET /contactslist/{list_ID}/managemanycontacts/{job_ID}:

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X GET \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contactslist/$list_ID/managemanycontacts \
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "ContactsLists": [
6
        {
7
          "ListID": 987654321,
8
          "Action": "addnoforce"
9
        }
10
      ],
11
      "Count": 1,
12
      "Error": "",
13
      "ErrorFile": "",
14
      "JobEnd": "2018-01-01T00:00:00",
15
      "JobStart": "2018-01-01T00:00:00",
16
      "Status": "Completed"
17
    }
18
  ],
19
  "Total": 1
20
}
`
Manage multiple contacts across multiple lists
The /contact/managemanycontacts resource allows you to add, remove or unsubscribe multiple contacts to / from multiple lists. It works the same way as /contactslist/{list_ID}/managemanycontacts, but you can specify multiple lists in the payload.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contact/managemanycontacts \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "Contacts":[
8
        {
9
          "Email":"passenger@mailjet.com",
10
          "IsExcludedFromCampaigns":"false",
11
          "Name":"Passenger 1",
12
          "Properties":"object"
13
        }
14
      ],
15
      "ContactsLists":[
16
        {
17
          "Action":"addforce",
18
          "ListID":"987654321"
19
        },
20
        {
21
          "Action":"addnoforce",
22
          "ListID":"987654321"
23
        },
24
        {
25
          "Action":"remove",
26
          "ListID":"987654321"
27
        },
28
        {
29
          "Action":"unsub",
30
          "ListID":"987654321"
31
        }
32
      ]
33
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "JobID": 123456
6
    }
7
  ],
8
  "Total": 1
9
}
`
Manage contacts via CSV Upload
Using a CSV file to upload
To do a CSV upload, you need to complete the following three steps:

Create the CSV content in a format compatible with the Mailjet API.
Upload the CSV content to a Mailjet server via an API call.
Import the CSV file using the /csvimport content.
CSV content requirements
The first row must include the names of the different properties included in the CSV - e.g. "email", "first_name", "age". If there is no /contactmetadata object with the respective property name, if will be created automatically by the API with DataType: string.

The data for each contact should be included on a new line.

Example:

1
"email","age"
2
"foo@example.org",42
3
"bar@example.com",13
4
"sam@ple.co.uk",37
Note: If the CSV includes datetime contact properties, you should NOT include the property names in the first row. Instead, they should be specified using the ImportOptions property in the POST /csvimport payload.
Example:

1
"foo@example.org",2018/10/12
2
"bar@example.com",2016/10/12
3
"sam@ple.co.uk",2017/10/12
Upload the CSV
To upload the CSV you need to specify the target contact list ID and, of course, the CSV content.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Import the CSV file through the DATA API
2
curl -s \
3
-X POST \
4
--user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
https://api.mailjet.com/v3/DATA/contactslist/$ID_CONTACTLIST/CSVData/text:plain \
6
-H "Content-Type: text/plain" \
7
--data-binary "@./test.csv"
Save the ID - it’s used to specify the Data ID during POST /csvimport.

Import CSV content to a list
You now need to use the uploaded data to manage the contacts in a specific contact list using the /csvimport resource.

The actions you can perform are:

addforce : Add the contacts to the list and subscribe all of them. If the contact is already present in the list as unsubscribed, it will be forcibly subscribed once again.
addnoforce : Add the contacts to the list and subscribe them to it. If the contact is already present, it will retain its subscription status, i.e. if a contact is part of the list, but unsubscribed, it will not be forcibly subscribed again.
remove : Remove the contacts from the list
unsub : Unsubscribe the contacts from the list
Select the action / method, the list ID and the data ID in the payload:

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/csvimport \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "ErrTreshold":"1",
8
      "ImportOptions":"",
9
      "Method":"addnoforce",
10
      "ContactsListID":"123456",
11
      "DataID":"98765432123456789"
12
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "ErrTreshold": 1,
6
      "ImportOptions": "",
7
      "Method": "addnoforce",
8
      "AliveAt": "2018-01-01T00:00:00",
9
      "ContactsListID": 123456,
10
      "Count": 12,
11
      "Current": 10,
12
      "DataID": 98765432123456780,
13
      "Errcount": 0,
14
      "ID": 987654,
15
      "JobEnd": "2018-01-01T00:00:00",
16
      "JobStart": "2018-01-01T00:00:00",
17
      "RequestAt": "2018-01-01T00:00:00",
18
      "Status": "Upload"
19
    }
20
  ],
21
  "Total": 1
22
}
`
The ID returned is the ID of the import job - use it to monitor the import progress.

Using CSV with Datetime contact data
When trying to import contact data with type datetime, you should define an additional property in the payload - ImportOptions. Its value should be passed as a string, containing the following options:

DateTimeFormat : it shows the format of the datetime in the CSV file. It can be represented as any combination of the acronyms for year (yy), month (mm), day (dd), hour (hh), minute (nn), second (ss). The date is separated from the time with an empty space. The separators for the dates could be a dash(-), slash (/) or dot (.). The separator for the time is a colon (:). The RFC3339 format is also supported (e.g. 'yyyy-mm-ddThh:nn:ss+01:00').
TimezoneOffset : used to select timezone offset. The value is an integer in the -12 to 12 range.
FieldNames : specifies the names of the fields that are going to be imported. This corresponds to the first row of the CSV, when you import contacts without datetime contact data. All properties that will be modified should be added to the import options, following the exact same order as the columns in the CSV.
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Create: A wrapper for the CSV importer
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/csvimport \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "ContactsListID":"$ID_CONTACTLIST",
9
    "DataID":"$ID_DATA",
10
    "Method":"addnoforce",
11
    "ImportOptions":"{\"DateTimeFormat\": \"yyyy/mm/dd\",\"TimezoneOffset\": 2,\"FieldNames\": [\"email\",\"birthday\"]}"
12
  }'
Monitor the Import Progress
You can now make sure the task is completed successfully. You might need multiple checks as a huge amount of data may take some time to be processed (several hours are not uncommon). Using the JobID returned in the previous step, you can retrieve the job status.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X GET \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/csvimport/$importjob_ID \
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "ErrTreshold": 1,
6
      "ImportOptions": "",
7
      "Method": "addnoforce",
8
      "AliveAt": "2018-01-01T00:00:00",
9
      "ContactsListID": 123456,
10
      "Count": 12,
11
      "Current": 10,
12
      "DataID": 98765432123456780,
13
      "Errcount": 0,
14
      "ID": 987654,
15
      "JobEnd": "2018-01-01T00:00:00",
16
      "JobStart": "2018-01-01T00:00:00",
17
      "RequestAt": "2018-01-01T00:00:00",
18
      "Status": "Upload"
19
    }
20
  ],
21
  "Total": 1
22
}
`
Error Handling
If the ErrCount in the response of the GET /csvimport/$job_ID request is different than 0, you can retrieve a file with information about the errors that occurred during the import.

cURLPHPNODERUBYPYTHONJAVAGO
1
curl --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
2
https://api.mailjet.com/v3/DATA/BatchJob/$job_id/CSVError/text:csv
The returned file will be a copy of your original file with an added column describing the error for each line in error.

File uploaded with error:

1
"email","age"
2
"foo@example.org",42
3
"bar@example.com"
4
"sam@ple.co.uk",37
Error file content:

1
email,age,error
2
"bar@example.com", ###Too few columns at line
Manage your exclusion list
Exclusion list overview
Whenever you have contacts subscribed to multiple lists, it’s tedious to unsubscribe them from every single one, in case they don’t want to receive any marketing emails. You would also want an easy way to prevent a sending in case you accidentally subscribed a contact to a new list.

This is why Campaign Exclusion List was created - it helps you prevent an accidental sending of a marketing campaign to users. You can add users to this exclusion list and they will be automatically blocked from receiving marketing emails.

Note: Contacts in the exclusion list will still be able to receive messages sent via the Send API.
Single contact exclusion
To add a single contact to the exclusion list, you simply need to modify its IsExcludedFromCampaigns property to true with a PUT /contact/{contact_id_or_email}.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Call to add contact to exclusion list
2
curl -s \
3
  -X PUT \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/contact/$ID_OR_EMAIL \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "IsExcludedFromCampaigns":"true"
9
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "CreatedAt": "2014-06-10T08:30:32Z",
6
      "DeliveredCount": "",
7
      "Email": "Mister@mailjet.com",
8
      "ExclusionFromCampaignsUpdatedAt": "2014-06-10T08:47:28Z",
9
      "ID": "1",
10
      "IsExcludedFromCampaigns": "true",
11
      "IsOptInPending": "false",
12
      "IsSpamComplaining": "false",
13
      "LastActivityAt": "2014-06-10T08:47:28Z",
14
      "LastUpdateAt": "2014-12-31T11:00:46Z",
15
      "Name": "John",
16
      "UnsubscribedAt": "",
17
      "UnsubscribedBy": ""
18
    }
19
  ],
20
  "Total": 1
21
}
Bulk exclusion
In case you want to exclude multiple contacts, you have a couple of options to do that:

Using /contact/managemanycontacts
Using /csvimport
Using /contact/managemanycontacts
When doing the POST call, simply set the IsExcludedFromCampaigns to true for the contacts you want to exclude.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Create : Manage the details of a Contact.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/contact/managemanycontacts \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Contacts":[
9
        {
10
            "Email": "jimsmith@example.com",
11
            "Name": "Jim",
12
            "IsExcludedFromCampaigns": true,
13
            "Properties": {
14
                "Property1": "value",
15
                "Property2": "value2"
16
            }
17
        },
18
        {
19
            "Email": "janetdoe@example.com",
20
            "Name": "Janet",
21
            "IsExcludedFromCampaigns": true,
22
            "Properties": {
23
                "Property1": "value",
24
                "Property2": "value2"
25
            }
26
        }
27
    ]
28
  }'
Using /csvimport
Using the CSV Upload methodology, you can upload a list of contacts to add them to or remove them from the exclusion list. To do that, you need to set the Method property to excludemarketing or includemarketing, respectively.

Note: the JSON payload sent to /csvimport should NOT contain the ContactsListID property. If it does, the following error will appear: MJ08 Property ContactsList is invalid: Exclusion of contacts from marketing campaign is a global status and can not be applied to a list.
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Create: A wrapper for the CSV importer
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/csvimport \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "DataID":"$ID_DATA",
9
    "Method":"excludemarketing"
10
  }'
GDPR Delete contacts
Under the European Union's General Data Protection Regulation (GDPR), recipients in your Mailjet contacts database have the right to request the deletion of all their personal data stored on your end. In such cases, the GDPR requires the permanent removal of their contact record from your database, including contact properties, email tracking history and other engagement data. You’ll typically need to respond to these requests within 30 days.

With the Mailjet API you are able to comply with the GDPR policy and delete a specific contact on a specific API Key.

To perform a GDPR-compliant deletion, you must remove the contacts from all accounts / subaccounts you currently own.
You must complete the following steps to successfully delete a contact:

Identify the presence of this contact in your Mailjet account.
Save the Mailjet {contact_ID} related to this recipient.
Proceed with the deletion using the {contact_ID} you retrieved.
Retrieve a Contact
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# View : Retrieve details for a contact (including contact ID) by using the contact email.
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/contact/$CONTACT_EMAIL
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "CreatedAt": "2018-01-01T00:01:02Z",
6
      "DeliveredCount": "3",
7
      "Email": "Mister@mailjet.com",
8
      "ExclusionFromCampaignsUpdatedAt": "",
9
      "ID": "12345678",
10
      "IsExcludedFromCampaigns": "false",
11
      "IsOptInPending": "false",
12
      "IsSpamComplaining": "false",
13
      "LastActivityAt": "2018-01-01T01:02:03Z",
14
      "LastUpdateAt": "",
15
      "Name": "MisterMailjet",
16
      "UnsubscribedAt": "",
17
      "UnsubscribedBy": ""
18
    }
19
  ],
20
  "Total": 1
21
}
To delete a contact, you must first identify its presence in the contact database of your account.

Use GET /contact/$CONTACT_EMAIL to do it.

Save the contact ID - you need it to complete the deletion process.

Delete the Contact
Use the {contact_ID} you retrieved to DELETE the contact with the /v4/contacts/{contact_ID} endpoint. When the deletion is successful, the API will return a 200 OK status. Any other response will indicate that the deletion was not successfully processed.

Available only with CURL:

cURL
1
curl -s \
2
-X DELETE \
3
--user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
https://api.mailjet.com/v4/contacts/{contact_ID} \
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "CreatedAt": "2017-09-26T14:12:32Z",
6
      "DeliveredCount": 0,
7
      "Email": "\\xae872d762f67cc4fc5d4bfe04e607256579928ac@domain.invalid",
8
      "ExclusionFromCampaignsUpdatedAt": "",
9
      "ID": 21339837,
10
      "IsExcludedFromCampaigns": false,
11
      "IsOptInPending": false,
12
      "IsSpamComplaining": false,
13
      "LastActivityAt": "2017-09-26T14:12:32Z",
14
      "LastUpdateAt": "2018-07-12T09:04:23Z",
15
      "Name": "Anonymized",
16
      "UnsubscribedAt": "",
17
      "UnsubscribedBy": ""
18
    }
19
  ],
20
  "Total": 1
21
}
Contact details are immediately anonymized and all records will be deleted after 30 days. This process cannot be reversed. The anonymized contact will retain its contact ID and general configuration settings until it is removed when the 30-day period ends.
The deletion of a contact does not prevent you from re-uploading the same contact in the future. If you are using an external database to sync contacts with your Mailjet contact database, please make sure to simultaneously remove the contacts from it as well.

This way you will be completely GDPR-compliant and will ensure that the contacts won’t be added by mistake later on.


Template API
Create a template
Email templates are prewritten / preformatted emails, which are used to quickly send messages to your recipients. This helps you save time when needing to reuse content - instead of adding the email content every time, you can just reference the template ID.

You can create a template using our Email Editor. To create a template via the API, use POST /template.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/template \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "Author":"John Doe",
8
      "Categories":"array",
9
      "Copyright":"Mailjet",
10
      "Description":"Used to send out promo codes.",
11
      "EditMode":"1",
12
      "IsStarred":"false",
13
      "IsTextPartGenerationEnabled":"true",
14
      "Locale":"en_US",
15
      "Name":"Promo Codes",
16
      "OwnerType":"user",
17
      "Presets":"string",
18
      "Purposes":"array"
19
  }'
To add the email content, use POST /template/{template_ID}/detailcontent. Keep in mind that the POST request will reset the values of all properties not specified in the payload to null. If you have already set a value to a property (e.g. Html-part) and want to keep it while setting the value of another (e.g. Text-part), use a PUT request instead.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X POST \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/template/$template_ID/detailcontent \
5
  -H 'Content-Type: application/json' \
6
  -d '{
7
      "Headers":"",
8
      "Html-part":"<h3>Dear passenger, welcome to Mailjet!</h3><br />May the delivery force be with you!",
9
      "MJMLContent":"",
10
      "Text-part":"Dear passenger, welcome to Mailjet! May the delivery force be with you!"
11
  }'
Use Headers to specify your sender and/or reply-to addresses, as well as the Subject line of your email.

API response:

1
{
2
  "From": "\"Mailjet pilot\" <pilot@mailjet.com>",
3
  "Subject": "Welcome",
4
  "Reply-to": "copilot@mailjet.com"
5
}
Use templates with Send API
If you want to send an email template via the Send API, add the TemplateID property to the payload.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# This call sends a message based on a template.
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3.1/send \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Messages":[
9
        {
10
            "From": {
11
                "Email": "pilot@mailjet.com",
12
                "Name": "Mailjet Pilot"
13
            },
14
            "To": [
15
                {
16
                    "Email": "passenger1@mailjet.com",
17
                    "Name": "passenger 1"
18
                }
19
            ],
20
            "TemplateID": 1,
21
            "TemplateLanguage": true,
22
            "Subject": "Your email flight plan!"
23
        }
24
    ]
25
  }'
How to share templates between sub-accounts
When a template is created on a certain API key, it can be directly used only when sending messages using that API key.

However, it is possible for a template created on a primary API key (and its contents) to be visible for all sub-accounts. To do that, when creating the template on the primary account, set its OwnerType property to user.

The contents of templates with the user owner type can be retrieved by a sub-account using GET /template/{template_ID}/detailcontent. Then the sub-account user can simply copy the content and insert it into a template created on the respective sub-account API key using POST /template/{template_ID}/detailcontent.


Event tracking via webhooks
Overview
The Mailjet webhook resources allow you to receive real-time notification through HTTP requests on events linked to the messages you sent. This event notification works for both transactional and marketing emails. The supported events are open, click, bounce, spam, blocked, unsub and sent.

This is a very efficient way to do specific actions on your side, like:

logging the marketing messages sent to your customers
generating your own statistics
updating the unsubscribed contacts in a CRM system.
Instead of polling our API a few times a day, the Event API will push new data just as the events happen, almost instantly ("don’t call me, I’ll call you if I have something new").

What is a webhook URL
A webhook URL is the HTTP address our server will call for each event as it occurs.

You can use the API to set up a new webhook using the /eventcallbackurl resource. Alternatively, you can configure this in your account preferences, in the Event Tracking section.

It must return a 200 OK HTTP code if all goes well. Any other HTTP code will result in our server retrying the request later. Our system will retry every 30s and will stop after 24h, unless a new event is generated.

The API also allows you to configure a backup endpoint URL with the property isBackup - it will be used in case the primary URL is suspended. To reactivate a suspended endpoint URL, you need to update it with a new URL.

To reactivate a suspended endpoint URL, you need to update the URL with a new URL.

We strongly recommend using a secure (HTTPS) URL in combination with a basic authentication to make sure data cannot be intercepted, and that only our servers can send you data:

https://username:password@www.example.com/mailjet_triggers.php
You can also specify a port in your webhook URL.

https://www.example.com:123/mailjet_triggers.php
The event data is sent in the POST request body using a JSON object. Its content depends on the event.

Best Practices
The Event API relies on your server being able to handle large amount of POST calls on your webhook(s).

We advise you to follow the following guidelines for implementation and usage:

Process the received payload asynchronously : as much as possible, the webhook script should rely on an asynchronous consumer process that will use the data saved by your webhook. You should keep out of your webhook logic all cross matches of the delivered events with other resources of our API or your internal database. This step will allow your webhook to answer our calls in a timely manner and avoid timing out and being retried by our server.
Check your server logs regularly for any errors : all non 200 errors would be retried and could cause an increasing volume of calls to your system.
Leverage the transactional message tagging to simplify reconciliation between the events and your own system.
Event types
Event object overview
All JSON event objects contain the following properties:

event: the event type
time: Unix timestamp of event
email: email address of recipient triggering the event
mj_campaign_id: internal Mailjet campaign ID associated to the message
mj_contact_id: internal Mailjet contact ID
customcampaign: value of the X-Mailjet-Campaign header when provided
MessageID: The unique message ID
CustomID: the custom ID, when provided at send time
Payload: the event payload, when provided at send time
Sent event
Dispatched when the destination SMTP server (gmail, hotmail, yahoo, etc) has accepted the message. Depending on your volume, it could dispatch a lot of events to your system, please make sure you have checked the Group Events Checkbox in the Event API user interface or that the /eventcallbackurl version property is set at 2

Sent event additional properties:

mj_message_id : The unique message ID as a string (deprecated, see MessageID)
smtp_reply: The raw SMTP response message
Sample sent event:

API response:

1
{
2
  "event": "sent",
3
  "time": 1433333949,
4
  "MessageID": 19421777835146490,
5
  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
6
  "email": "api@mailjet.com",
7
  "mj_campaign_id": 7257,
8
  "mj_contact_id": 4,
9
  "customcampaign": "",
10
  "mj_message_id": "19421777835146490",
11
  "smtp_reply": "sent (250 2.0.0 OK 1433333948 fa5si855896wjc.199 - gsmtp)",
12
  "CustomID": "helloworld",
13
  "Payload": ""
14
}
Open event
Open event additional properties:

ip : IP address (can be IPv4 or IPv6) that triggered the event
geo : country code of IP address (see list)
agent : User-Agent
Sample open event

API response:

1
{
2
  "event": "open",
3
  "time": 1433103519,
4
  "MessageID": 19421777396190490,
5
  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
6
  "email": "api@mailjet.com",
7
  "mj_campaign_id": 7173,
8
  "mj_contact_id": 320,
9
  "customcampaign": "",
10
  "CustomID": "helloworld",
11
  "Payload": "",
12
  "ip": "127.0.0.1",
13
  "geo": "US",
14
  "agent": "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0"
15
}
Click event
Click event additional properties:

url : the link that was clicked
Sample click event

API response:

1
{
2
  "event": "click",
3
  "time": 1433334653,
4
  "MessageID": 19421777836302490,
5
  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
6
  "email": "api@mailjet.com",
7
  "mj_campaign_id": 7272,
8
  "mj_contact_id": 4,
9
  "customcampaign": "",
10
  "CustomID": "helloworld",
11
  "Payload": "",
12
  "url": "https://mailjet.com",
13
  "ip": "127.0.0.1",
14
  "geo": "FR",
15
  "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36"
16
}
Bounce event
Bounce event additional properties:

blocked : true if this bounce leads to the recipient being blocked
hard_bounce : true if error was permanent
error_related_to : see error table
error : see error table
comment : the raw SMTP error code, including descriptions of the reason for the bounce
Sample bounce event

API response:

1
{
2
   "event": "bounce",
3
   "time": 1430812195,
4
   "MessageID": 13792286917004336,
5
   "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
6
   "email": "bounce@mailjet.com",
7
   "mj_campaign_id": 0,
8
   "mj_contact_id": 0,
9
   "customcampaign": "",
10
   "CustomID": "helloworld",
11
   "Payload": "",
12
   "blocked": false,
13
   "hard_bounce": true,
14
   "error_related_to": "recipient",
15
   "error": "user unknown",
16
   "comment": "Host or domain name not found. Name service error for name=lbjsnrftlsiuvbsren.com type=A: Host not found"
17
}
NOTICE: If you consider using this event to modify the status of your recipient subscription or viability , please take into account the value of the hard_bounce and error property. All bounce events may not have the same level of importance.
Blocked event
Blocked event additional properties:

error_related_to : see error table
error : see error table
Sample blocked event

API response:

1
{
2
  "event": "blocked",
3
  "time": 1430812195,
4
  "MessageID": 13792286917004336,
5
  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
6
  "email": "bounce@mailjet.com",
7
  "mj_campaign_id": 0,
8
  "mj_contact_id": 0,
9
  "customcampaign": "",
10
  "CustomID": "helloworld",
11
  "Payload": "",
12
  "error_related_to": "recipient",
13
  "error": "user unknown"
14
}
NOTICE: If you consider using this event to modify the status of your recipient subscription, please take into account the value of the error property. All blocked events may not have the same reason and perpetuity on the status of the contact (i.e. duplicate in campaign indicates that the recipient message was blocked for the campaign and preblocked indicates that the recipient is blocked for all messages).
Spam event
Spam event additional properties:

source : indicates which feedback loop program reported this complaint
Sample spam event

API response:

1
{
2
  "event": "spam",
3
  "time": 1430812195,
4
  "MessageID": 13792286917004336,
5
  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
6
  "email": "bounce@mailjet.com",
7
  "mj_campaign_id": 0,
8
  "mj_contact_id": 0,
9
  "customcampaign": "",
10
  "CustomID": "helloworld",
11
  "Payload": "",
12
  "source": "JMRPP"
13
}
Unsub event
Unsub event additional properties:

mj_list_id : internal Mailjet List id for REST API access to lists management
ip : IP address (can be IPv4 or IPv6) that triggered the event
geo : country code of IP address (see list)
agent : User-Agent
Sample unsub event

API response:

1
{
2
  "event": "unsub",
3
  "time": 1433334941,
4
  "MessageID": 20547674933128000,
5
  "Message_GUID": "1ab23cd4-e567-8901-2345-6789f0gh1i2j",
6
  "email": "api@mailjet.com",
7
  "mj_campaign_id": 7276,
8
  "mj_contact_id": 126,
9
  "customcampaign": "",
10
  "CustomID": "helloworld",
11
  "Payload": "",
12
  "mj_list_id": 1,
13
  "ip": "127.0.0.1",
14
  "geo": "FR",
15
  "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36"
16
}
Possible values for errors
error_related_to

Error

What really happened ?

recipient

user unknown

Email address doesn't exist, double check it for typos !

mailbox inactive

Account has been inactive for too long (likely that it doesn't exist anymore).

quota exceeded

Even though this is a non-permanent error, most of the time when accounts are over-quota, it means they are inactive.

blacklisted

You tried to send to a blacklisted recipient for this account.

spam reporter

You tried to send to a recipient that has reported a previous message from this account as spam.

domain

invalid domain

There's a typo in the domain name part of the address. Or the address is so old that its domain has expired !

no mail host

Nobody answers when we knock at the door.

relay/access denied

The destination mail server is refusing to talk to us.

greylisted

This is a temporary error due to possible unrecognized senders. Delivery will be re-attempted.

typofix

The domain part of your recipient email address was not valid.

content

bad or empty template

You should check that the template you are using has a content or is not corrupted.

error in template language

Your content contains a template language error, you can refer to the error reporting functionalities to get more information.

spam

sender blocked

This is quite bad! You should contact us to investigate this issue.

content blocked

Something in your email has triggered an anti-spam filter and your email was rejected. Please contact us so we can review the email content and report any false positives.

policy issue

We do our best to avoid these errors with outbound throttling and following best practices. Although we do receive alerts when this happens, make sure to contact us for further information and a workaround

system

system issue

Something went wrong on our server-side. A temporary error. Please contact us if you receive an event of this type.

protocol issue

Something went wrong with our servers. This should not happen, and never be permanent !

connection issue

Something went wrong with our servers. This should not happen, and never be permanent !

mailjet

preblocked

You tried to send an email to an address that recently (or repeatedly) bounced. We didn't try to send it to avoid damaging your reputation.

duplicate in campaign

You used X-Mailjet-DeduplicateCampaign and sent more than one email to a single recipient. Only the first email was sent; the others were blocked.

Use third party queueing systems
For users on Custom plans Mailjet is also able to set up the sending of events to 3rd party queueing systems:

Microsoft Azure
Amazon SQS
Google Cloud Platform
Those queuing systems are very flexible and capable of processing huge amounts of events.

Please contact your Customer Success Manager for more details, if you are interested in these features.


Statistics
The Mailjet API allows you to retrieve statistics for your sendings. Several endpoints have been designed for this purpose:

Key Performance Statistics
Clicked Links Statistics
Mailbox Providers Statistics
Geographical Statistics
Additional Stats Resources
Deprecated Resources
On April 5th 2018 the API endpoints used for retrieving stats were revamped in a major way. Stats for any account migrated or created after April 5th 2018 can be retrieved with the newly created endpoints.

The main improvements of the new system include:

Streamlined API endpoints, combining several legacy resources into one to ease the retrieval of key performance stats
Detailed stats on clicked links, including number of unique and total clicks, URL position etc.
Statistics based on Mailbox providers, which allow you to easily identify issues with deliverability / engagement based on the recipients' mailbox providers
Legacy statistics endpoints

New statistics endpoints

/apikeytotals

/statcounters

/campaigngraphstatistics

/statcounters

/campaignstatistics

/statcounters

/domainstatistics

/statistics/recipient-esp

/graphstatistics

/statcounters

/liststatistics

/statcounters

/messagestatistics

/statcounters

/messagesentstatistics

/statcounters

/openstatistics

/statcounters

---

/statistics/link-click

In this guide we will focus on resources that are available for new / migrated users.

Key Performance Statistics
The /statcounters resource is a multifunctional tool that allows you to view stats through various prisms while varying the Source (API Key, Campaign, List or Sender), the Timing (Event-based or Message-based counters' timestamp), or the Timeframe (Lifetime, Day, Hour, 5 Minutes).

Stats at Campaign, List or APIKey Level
The /statcounters code samples available in the following sections are done at a campaign level, which is indicated by the use of the following filters in the calls:

SourceId=$Campaign_ID : Substitute $CampaignID with the ID of the Campaign you are interested in.
CounterSource=Campaign
If you want to retrieve these key statistics but at a List level, use the $ListID as the value of the SourceID filter and enter List as the CounterSource. Keep in mind that retrieving list stats can only be done with CounterTiming=Message&CounterResolution=Lifetime.

If you need the stats at an API key level, make the request with ApiKey as the CounterSource value. Keep in mind that you can only retrieve data for the ApiKey with which you are authenticated.

You can also retrieve stats at a Sender level - simply set Sender as the CounterSource value and enter the sender ID as the value of the SourceID filter. Sender statistics can only be retrieved as message-based, so you'll need to set the value of the CounterTiming filter to Message.

Event-based vs Message-based Stats Timing
The /statcounters resource allows you to retrieve information both based on the message sending time (message-based) and on the timing of the event occurrence (event-based).

Message-based stats allow you to easily view the success of your sending by having the delivery rates / contact engagement details linked to the sending time. To retrieve message-based statistics, set the value of the CounterTiming query parameter to Message.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# View : Retrieve Key Delivery statistics for a Specific Campaign
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/statcounters?SourceId=$Campaign_ID\&CounterSource=Campaign\&CounterTiming=Message\&CounterResolution=Lifetime
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "APIKeyID": 123456,
6
      "EventClickDelay": 322,
7
      "EventClickedCount": 6,
8
      "EventOpenDelay": 739,
9
      "EventOpenedCount": 11,
10
      "EventSpamCount": 0,
11
      "EventUnsubscribedCount": 2,
12
      "EventWorkflowExitedCount": 0,
13
      "MessageBlockedCount": 12,
14
      "MessageClickedCount": 3,
15
      "MessageDeferredCount": 0,
16
      "MessageHardBouncedCount": 5,
17
      "MessageOpenedCount": 8,
18
      "MessageQueuedCount": 0,
19
      "MessageSentCount": 15,
20
      "MessageSoftBouncedCount": 0,
21
      "MessageSpamCount": 0,
22
      "MessageUnsubscribedCount": 2,
23
      "MessageWorkFlowExitedCount": 0,
24
      "SourceID": 654321,
25
      "Timeslice": "",
26
      "Total": 32
27
    }
28
  ],
29
  "Total": 1
30
}
Event-based stats allow you to view the spread of events over time after the initial sending, helping you identify when recipients were most active / engaged with your campaigns. To retrieve event-based statistics, set the value of the CounterTiming query parameter to Event.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# View : View campaign evolution statistics, based on daily timeslices and with a defined timeframe
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/statcounters?SourceId=$Campaign_ID\&CounterSource=Campaign\&CounterTiming=Event\&CounterResolution=Day\&FromTS=123\&ToTS=456
API response:

1
{
2
  "StatCounters": {
3
    "Count": 2,
4
    "Data": [
5
        {
6
        "APIKeyID": "320046",
7
        "EventClickDelay": "200",
8
        "EventClickCount": "3",
9
        "EventOpenDelay": "20",
10
        "EventOpenedCount": "4",
11
        "EventSpamCount": "4",
12
        "EventUnsubscribedCount": "5",
13
        "EventWorkflowExitedCount": "5",
14
        "MessageBlockedCount": "7",
15
        "MessageClickedCount": "3",
16
        "MessageDeferredCount": "2",
17
        "MessageHardBouncedCount": "5",
18
        "MessageOpenedCount": "5",
19
        "MessageQueuedCount": "3",
20
        "MessageSentCount": "2",
21
        "MessageSoftBouncedCount": "7",
22
        "MessageSpamCount": "5",
23
        "MessageUnsubscribedCount": "1",
24
        "MessageWorkflowExitedCount": "8",
25
        "SourceID": "123456789",
26
        "Timeslice": "456",
27
        "Total": "50000",
28
        }
29
        {
30
        "APIKeyID": "320046",
31
        "EventClickDelay": "113",
32
        "EventClickCount": "2",
33
        "EventOpenDelay": "15",
34
        "EventOpenedCount": "2",
35
        "EventSpamCount": "0",
36
        "EventUnsubscribedCount": "1",
37
        "EventWorkflowExitedCount": "2",
38
        "MessageBlockedCount": "3",
39
        "MessageClickedCount": "1",
40
        "MessageDeferredCount": "2",
41
        "MessageHardBouncedCount": "2",
42
        "MessageOpenedCount": "2",
43
        "MessageQueuedCount": "3",
44
        "MessageSentCount": "2",
45
        "MessageSoftBouncedCount": "7",
46
        "MessageSpamCount": "5",
47
        "MessageUnsubscribedCount": "1",
48
        "MessageWorkflowExitedCount": "8",
49
        "SourceID": "123456789",
50
        "Timeslice": "123",
51
        "Total": "50000",
52
        }
53
    ]
54
  },
55
        "Total": 2
56
}
Example: A campaign is sent on Day1. There are 10 opens on Day2 and another 20 on Day3. If you use CounterTiming=Message in the call, the returned result will be for the messages that were opened, thus showing 30 opens on Day1. If you use CounterTiming=Event, /statcounters will return the information on the open events, showing 10 opens on Day2 and 20 on Day3.

Statistics for Specific Recipient
The Mailjet API allows you to easily access statistics for a specific recipient. This is useful when you need to review the delivery and engagement indicators for specific contacts. Use /contactstatistics to retrieve the respective information.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X GET \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/contactstatistics \
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "BlockedCount": 1,
6
      "BouncedCount": 0,
7
      "ClickedCount": 3,
8
      "ContactID": 123456789,
9
      "DeferredCount": 0,
10
      "DeliveredCount": 13,
11
      "HardbouncedCount": 1,
12
      "LastActivityAt": "2018-01-01T00:00:00",
13
      "MarketingContacts": 0,
14
      "OpenedCount": 9,
15
      "ProcessedCount": 15,
16
      "QueuedCount": 0,
17
      "SoftbouncedCount": 0,
18
      "SpamComplaintCount": 0,
19
      "UnsubscribedCount": 1,
20
      "UserMarketingContacts": 0,
21
      "WorkFlowExitedCount": 0
22
    }
23
  ],
24
  "Total": 1
25
}
`
Stats for Clicked Links
Clicked links can help optimize you email engagement rate by showing you how different Sections, images or Calls-to-action affect how your recipients interact with your emails.

As a result, you may want to use /statistics/link-click to retrieve activity information based on the links in your campaign templates. With this endpoint you can track both unique clicks and total click events, as well as retrieve the URL and its position within the template. It gives you valuable insight into what links are used more often than others, possibly showing correlation between position / design and link popularity.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# View : View statistics for total and unique clicks for each clicked URL in a campaign email
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
    https://api.mailjet.com/v3/REST/statistics/link-click?CampaignId=$Campaign_ID
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "URL": "https://www.google.fr/",
6
      "PositionIndex": 1,
7
      "ClickedMessagesCount": 2,
8
      "ClickedEventsCount": 2
9
    }
10
  ],
11
  "Total": 1
12
}
Mailbox Provider Statistics
The mailbox provider statistics highlight how your emails perform across all the major providers you are sending to - Hotmail, Yahoo, Gmail etc.

The /statistics/recipient-esp resource can be used to view statistics based on the Email Service Providers of the recipients of your campaign. You must provide a $CampaignID in the Campaign filter in order to retrieve the data.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
# View : View delivery and contact engagement statistics for a campaign across different Mailbox providers
2
curl -s \
3
  -X GET \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/statistics/recipient-esp?CampaignId=$Campaign_ID
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "ESPName": "others",
6
      "DeliveredMessagesCount": 3,
7
      "AttemptedMessagesCount": 3,
8
      "OpenedMessagesCount": 3,
9
      "ClickedMessagesCount": 2,
10
      "DeferredMessagesCount": 0,
11
      "SoftBouncedMessagesCount": 0,
12
      "HardBouncedMessagesCount": 0,
13
      "UnsubscribedMessagesCount": 0,
14
      "SpamReportsCount": 0,
15
      "OpenRate": 1,
16
      "ClickThroughRate": 0.6667,
17
      "SoftBouncedRate": 0,
18
      "HardBouncedRate": 0,
19
      "UnsubscribedRate": 0,
20
      "SpamReportsRate": 0,
21
      "DeferredRate": 0
22
    }
23
  ],
24
  "Total": 1
25
}
Geographical Statistics
Geographical stats provide information on email opens and clicks, broken down by country. This helps you identify possible engagement issues with recipients from specific regions. With those details in mind, you can update your sendings to focus on countries that are performing well, or address issues with markets that are underperforming.

Use the /geostatistics resource to get information on opens and clicks by country.

cURLPHPNODERUBYPYTHONJAVAGOC#
1
curl -s \
2
  -X GET \
3
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
4
  https://api.mailjet.com/v3/REST/geostatistics \
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "ClickedCount": 10,
6
      "Country": "US",
7
      "OpenedCount": 5
8
    }
9
  ],
10
  "Total": 1
11
}
`
Additional Stats Resources
The following statistic resources will allow you to view information about the events on your messages. They will show a log of events on your messages for a selected time period. By default, the payload response will include the log for the current day, but you can specify a timeframe with the FromTS and ToTS filters.

/openinformation : Will give you details on opens, including useful information like timestamp for each open event, UserAgent, CampaignID and UserID.
/clickstatistics : Shows information on click events, including timestamp for the click, URL, UserAgent and delay between sending and the click event.
/bouncestatistics : Displays details for bounces, including bounce timestamp, campaign ID and contact ID, whether bounce is permanent or not.


Parse API: inbound emails
Parse API is available only for users on paid Mailjet plans (Premium 50k and above). Check our plans and pricing pages for more information.
The Parse API allows you to have inbound emails parsed and their content delivered to a webhook of your choice.

It will make the processing of inbound messages easier as Mailjet will do all the job of sifting through and organizing all the information in headers, content and attachments. What's left to do is just to save the information in your CRM or database.

Basic Setup
cURLPHPNODERUBYPYTHONJAVAGOC#
1
# Create : ParseRoute description
2
curl -s \
3
  -X POST \
4
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
5
  https://api.mailjet.com/v3/REST/parseroute \
6
  -H 'Content-Type: application/json' \
7
  -d '{
8
    "Url":"https://www.mydomain.com/mj_parse.php"
9
  }'
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "APIKeyID": "11111111",
6
      "Email": "16Hy-aOYhApIzTgN@parse-in1.mailjet.com",
7
      "ID": "1",
8
      "Url": "https://www.mydomain.com/mj_parse.php"
9
    }
10
  ],
11
  "Total": 1
12
}
In order to begin receiving emails to your webhook, create a new instance of the Parse API via a POST request on the /parseroute resource. This call has only one mandatory property - the Url of the webhook (Note: URLs provided cannot be the root). Mailjet will provide an Email address (on the subdomain @parse-in1.mailjet.com) in the response, you can begin to use immediately. It can be used as a Reply-to Email address for example.

We strongly recommend using a secure (HTTPS) URL in combination with a basic authentification to make sure data cannot be intercepted, and that only our servers can send you data.

E.g.: https://username:password@www.example.com/mailjet_parser.php

You can also specify a port in your webhook URL.

E.g.: https://www.example.com:123/mailjet_triggers.php

Mailjet provides only one Email address (on the subdomain @parse-in1.mailjet.com) per API key.
Parse API also allows you to use your own email address and domain using the Email property in the /parseroute resource. Visit use your own domain section for more information on how to setup your DNS and your parseroute.

What is delivered to your webhook
API response:

1
{
2
  "Sender": "pilot@mailjet.com",
3
  "Recipient": "passenger@mailjet.com",
4
  "Date": "20150410T160638",
5
  "From": "Pilot <pilot@mailjet.com>",
6
  "Subject": "Hey! It's Friday!",
7
  "Headers": {
8
    "Return-Path": ["<pilot@mailjet.com>"],
9
    "Received": [
10
      "by 10.107.134.160 with HTTP; Fri, 10 Apr 2015 09:06:38 -0700 (PDT)"
11
    ],
12
    "DKIM-Signature": [
13
      "v=1; a=rsa-sha256; c=relaxed/relaxed;        d=mailjet.com; s=google;        h=mime-version:date:message-id:subject:from:to:content-type;        bh=tsc4ruu5r5loLtAFUwhFp8BIbKzV0AYljT0+Bb/QwWI=;        b=............"
14
    ],
15
    "MIME-Version": ["1.0"],
16
    "Content-Transfer-Encoding": ["quoted-printable"],
17
    "Content-Type": [
18
      "multipart/alternative; boundary=001a1141f3c406f1b2051360f37d"
19
    ],
20
    "X-CSA-Complaints": ["whitelist-complaints@eco.de"],
21
    "List-Unsubscribe": [
22
      "<mailto:unsub-e7221da9.org1.x61425y8x4pt@bnc3.mailjet.com>"
23
    ],
24
    "X-Google-DKIM-Signature": [
25
      "v=1; a=rsa-sha256; c=relaxed/relaxed;        d=1e100.net; s=20130820;        h=x-gm-message-state:mime-version:date:message-id:subject:from:to         :content-type;        bh=tsc4ruu5r5loLtAFUwhFp8BIbKzV0AYljT0+Bb/QwWI=;        b=..........."
26
    ],
27
    "X-Gm-Message-State": [
28
      "ALoCoQlJBEYSiauMbHc8RXQpv3sUJvPmYAd7exYJKZIZFRZtFkSHqDEP59rQK6oIp9mCwPKCirCL"
29
    ],
30
    "X-Received": [
31
      "by 10.107.41.72 with SMTP id p69mr3774075iop.58.1428681998638; Fri, 10 Apr 2015 09:06:38 -0700 (PDT)"
32
    ],
33
    "Date": "Fri, 10 Apr 2015 18:06:38 +0200",
34
    "Message-ID": "<CAE5Zh0ZpHZ6G5DC+He5426a4RkVab7uWaTDwiMcHzOR=YB3urA@mail.gmail.com>",
35
    "Subject": "Hey! It's Friday!",
36
    "From": "Pilot <pilot@mailjet.com>",
37
    "To": "passenger@mailjet.com"
38
  },
39
  "Parts": [
40
    {
41
      "Headers": {
42
        "Content-Type": "text/plain; charset=UTF-8"
43
      },
44
      "ContentRef": "Text-part"
45
    },
46
    {
47
      "Headers": {
48
        "Content-Type": "text/html; charset=UTF-8",
49
        "Content-Transfer-Encoding": "quoted-printable"
50
      },
51
      "ContentRef": "Html-part"
52
    }
53
  ],
54
  "Text-part": "Hi,\n\nImportant notice: it's Friday. Friday *afternoon*, even!\n\n\nHave a *great* weekend!\nThe Anonymous Friday Teller\n",
55
  "Html-part": "<div dir=\"ltr\">Hi,<div><br></div><div>Important notice: it&#39;s Friday. Friday <i>afternoon</i>, even!</div><div><br><br></div><div>Have a <i style=\"font-weight:bold\">great</i> weekend!</div><div>The Anonymous Friday Teller</div></div>\n",
56
  "SpamAssassinScore": "0.602",
57
  "CustomID": "helloworld",
58
  "Payload": "{'message': 'helloworld'}"
59
}
When an email is sent to the email address associated with your instance of the Parse API, the contents of this email will be delivered to your webhook in a JSON format. Note that the spam score of the email is delivered in the payload via SpamAssassin.

This payload contains a lot of useful information about the message processed.

This payload is built following a structure where you can parse it and use key information by pointing to them directly (From, Subject, etc.).

In case you need to loop over every Headers or Parts, you can also use the related collections and loop over it.

In the Parts collection, the ContentRef property is here to link a specific part (Html or Text for instance) to its associated headers.

Also, note that the CustomID and the Payload properties are returned back if they were provided in the original message sent through the Send API.

Finally, be advised that most Headers will be provided as arrays containing the multiple header lines of the parsed email. Some headers in the payload will be represented by single strings:

Date
From
Sender
Reply-To
To
Cc
Bcc
Message-ID
In-Reply-To
References
Subject
Date
Manage attachments
API response:

1
{
2
  "Parts": [
3
    {
4
      "Headers": {
5
        "Content-Type": "text/plain; charset=utf-8; name=helloworld.txt",
6
        "Content-Transfer-Encoding": "base64",
7
        "Content-Disposition": "attachment; filename=helloworld.txt"
8
      },
9
      "ContentRef": "Attachment1"
10
    }
11
  ],
12
  "Attachment1": "SGVsbG8gV29ybGQh"
13
}
In the payload, there is a Parts array. This collection contains every part of the parsed message. This collection relates directly to how an email is represented in Content multipart.

If the parsed message contains attachments, they will be also included in the payload.

To retrieve them, you can either loop on the Parts collection and look for any part where the ContentRef property starts with Attachment or you can look directly for the AttachmentN property (where N is the ID of the attachment in the message, following their order).

The content of the attachments is always encoded in Base64. Content-Transfer-Encoding indicates the original encoding of the attachment.

For instance, in a message containing one attachment of type text/plain containing "Hello World!", we will have this payload.

CustomID and Payload
When using the Send API Mj-CustomID or Mj-EventPayLoad, the Parse API will return the values in the payload under the properties CustomID and Payload.

CustomId and Payload can be used for example to trace the conversation around your transactional emails.

Use your own domain
API response:

1
{
2
  "Count": 1,
3
  "Data": [
4
    {
5
      "APIKeyID": "11111111",
6
      "Email": "mjparse@mydomain.com",
7
      "ID": "2",
8
      "Url": "https://www.mydomain.com/mj_parse.php"
9
    }
10
  ],
11
  "Total": 1
12
}
To receive emails on your own domain name, set this domain in your parseroute instance. Then, add an MX entry on the domain or subdomain DNS to parse.mailjet.com. (final dot is important) and specify your email address based on your domain in the Email attribute.

Your domain name needs to be a verified domain. Use the Account setting page or follow the Senders and Domains guide to verify your domain.
A less intrusive alternative is to setup a mail forwarding between your current mailbox to the Parse API send-to email automatically provided by Mailjet

To use a custom domain name and email address with the Parse API, update your instance via a PUT request with the email you wish to use.


Email API Overview
About the Mailjet API
Hello and welcome to the Mailjet Email API!

The Mailjet API is organized around REST. It has predictable, resource-oriented URLs, and uses HTTP response codes to indicate API errors. All request and response bodies are encoded in JSON, including errors.

The API is accessed by making HTTPS requests to a specific version endpoint URL. GET, POST, PUT, and DELETE methods dictate how you interact with the available objects.

In the Mailjet API, all PUT requests behave like PATCH requests. The update will affect only the specified properties. The other properties of an existing resource will neither be modified, nor deleted. It also means that all non-mandatory properties can be omitted from your payload.
Each endpoint has a list of properties and methods you can see in our API Reference.

Authentication
All Email API endpoints requests are authenticated using HTTPS Basic Auth. It requires you to provide a username and a password for each API request.

The username is your API Key and the password is your API Secret Key - you can find them in your API Key Management page. Both keys are generated automatically when your account is created.

Pagination
Depending on your request and the endpoint, the results in the response may be paginated. Use the following query parameters to page through the results:

Name

Type

Description

Limit

integer

The number of results returned per page. The default value is 10, the maximum is 1000.

Offset

integer

The index of the first object in the page. For example, if you have set a limit of 100 and want to see objects 101 through 200, then Offset=100

Sort

string

Sort the results by a property and select ascending (ASC) or descending (DESC) order. The default order is ascending. Keep in mind that this is not available for all properties. Example: Sort=ArrivedAt+DESC

Status Codes
The Mailjet API uses conventional HTTP response codes to indicate the success or failure of an API request. See the full list of status codes for more information.


The libraries
Mailjet maintains several wrappers and resources to make your life easier:

PHP : github
NodeJS : github
Ruby : github
Python : github
Golang : github
Java : github
C# / .NET : github
You can find even more useful tools and plugins on the Mailjet GitHub

We welcome any contribution to these repositories.

Please follow the instructions below to make it easier to process your improvements:

Fork the project.
Create a topic branch.
Implement your feature or bug fix.
Add documentation for your feature or bug fix.
Commit and push your changes.
Submit a pull request
Please do not include changes to the gemspec (Ruby), or version files.

Make sure that you don't share your private credentials when pushing your code