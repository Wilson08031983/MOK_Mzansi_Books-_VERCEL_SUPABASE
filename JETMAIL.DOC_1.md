Content API Overview
Welcome to the Mailjet Content API! Our API is structured around REST principles. It features predictable, resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and utilizes standard HTTP response codes, authentication, and verbs.

With the base endpoint https://api.mailjet.com/v1, you can manage your email templates, email template contents, images, and labels. This document outlines the authentication methods, available endpoints, and examples of how to interact with the API. By default, the Content API documentation will demonstrate using curl to interact with the API over HTTP, but any HTTP client in any programming language can be used.

If you are looking for how to send email via API, head over to the Mailjet Send API documentation.

Who should use the Content API?
If you are a user of both Mailjet's user interface (UI) and the API, it is recommended that you use the Content API to create and manage your templates.

The Content API is also ideal for all users that would like to:

have more granular permissions around template management via API.
upload and manage their images via API.
manage their template and image labels via API.
Response Structure
In the Content API response structure, every response you receive will consistently include three key fields: Count, Total, and Data.

Count: This field represents the number of items currently included in the response.

Total: The Total field indicates the overall number of items available that match the query or criteria specified.

Data: Unlike the Count and Total fields, the Data field is specific to each endpoint. This field contains the actual data or records returned by the API. The structure and content of the Data field are detailed in the endpoint-specific documentation, providing the necessary information on what to expect for each particular request.

PUT Endpoints
In the Mailjet Content API, all PUT requests behave like PATCH requests. The update will affect only the specified properties. The other properties of an existing resource will neither be modified, nor deleted. It also means that all non-mandatory properties can be omitted from your payload.

Example:

A template has multiple attributes, including name, description, and associated labels. If you want to update only the description of this resource, you can send a PUT request with the Description parameter in the body. All other attributes (Name, LabelIDs) will retain their current values.

Pagination & Sort
Depending on your request and the endpoint, the results in the response may be paginated and sorted. Use the following query parameters to page through the results:

Name

Type

Description

Limit

string

The number of results returned per page. The default value is 10, the maximum is 1000.

Offset

integer

The index of the first object in the page. For example, if you have set a limit of 100 and want to see objects 101 through 200, then Offset=100

Sort

string

Sort the results by a property and select ascending (ASC) or descending (DESC) order. The default order is ascending. Keep in mind that this is not available for all properties. Example: Sort=Name+DESC


Authentication
Mailjet Content API supports two authentication schemes: Basic Authentication and Bearer Token.

Basic Authentication
If you use HTTPS Basic Auth, it requires you to provide a username and a password for each API request.

The username is your API Key and the password is your API Secret Key - you can find them in your API Key Management page.

When you create a new account, a primary API key is automatically generated. However, you must generate a Secret Key within the user interface before it is accessible for use via API. The Secret Key will be displayed to the user only once. It is crucial that you securely manage and store the Secret Key value at the time of creation.
A user authenticated with Basic Auth has no permission restriction other than that of their Mailjet plan. You can consult plan-related restrictions on the Billing Settings & Invoices page.

Example Request:
cURL
1
curl -H "Authorization: Basic bWFpbGpldDpyb2Nrcw==" https://api.mailjet.com/v1/rest/templates
`
Bearer Token
Bearer Token authentication involves using a token generated via the Token endpoint. This token carries permissions that may restrict access to certain resources. For a detailed list of available permissions, refer to the Token Permissions section.

Note: Initial access to the Token endpoint requires Basic Auth as outlined in Basic Authentication. However, you can generate a token with permissions to create tokens for other users thereafter.

Tokens come with an expiry date, which can be set during their creation. By default, tokens expire after 365 days. Make sure to renew the token before it expires to maintain uninterrupted access.
Example Request:
cURL
1
curl -H "Authorization: Bearer dddbb31e-1af0-4ddb-aa03-72b682375522" https://api.mailjet.com/v1/rest/templates


Email Templates
Email templates are a crucial component for sending consistent and personalized emails. The Mailjet Content API provides a set of endpoints designed for the creation, management, and customization of email templates within your application. Some of the capabilities include:

Generate a new email templates
Update an existing email template
Delete an unwanted template
Retrieve a list of templates
You can also create a template using Mailjet's drag-and-drop Email Editor and use the API endpoints to publish it or delete it.

Learn how to send your template in the FAQ or head over the our Send API documentation.
Getting Started
Creating an email template
Creating an email template via the Content API is a two-step process:

Create the Template: This step involves creating the basic structure of the template, including its name, description and purpose.

Add Content to the Template: Once the template is ready, the next step is to add content to the template. This content could include text, images, and variables needed for personalizing the email.

Template Purpose
If you would like your template to be visible in the Mailjet user interface, you will need to assign a purpose to your template.

Mailjet has four types of templates:

Marketing: Templates used for promotional content, such as newsletters, sales announcements, and special offers. These are sent using Campaigns.
Transactional: Templates for operational emails, like order confirmations, shipping notifications, and password resets. These are sent via API or SMTP.
Automation: Templates designed for automated email workflows, such as welcome emails, birthday messages, and follow-ups. These are sent within an automation workflow.
Opt-in: Templates for double opt-in emails for your Mailjet forms. These are sent automatically when a contact fills out your form.
Each category corresponds to a purpose in the Content API:

marketing
transactional
automation
opt-in
Assigning a purpose is optional. However, if you do not assign a purpose to your template, the template will not be available in the UI.

Template Purpose and Token Permissions
It is also important to assign a template purpose to ensure proper access control as token permissions are aligned with the purposes of the templates.

For example, if a template has a purpose of transactional, the user must have a token with transactional permissions to access it.

Edit Mode
There are four edit modes in Mailjet:

1 = Drag-and-drop builder (cannot be created via API)
2 = HTML builder
3 = Saved Section builder (cannot be created via API)
4 = MJML builder
Default Value

The default edit mode is 2 (HTML builder).

API Usage
Edit Mode 2 (HTML builder) and Edit Mode 4 (MJML builder) can be used to create and edit templates via API.

When using Edit Mode 4, the template must be coded in MJML and published in the user interface before it can be sent.
Other Edit Modes
Edit Mode 1 (Drag-and-drop builder) and Edit Mode 3 (Saved Section builder) will be visible when retrieving a list of templates using this endpoint: GET https://api.mailjet.com/v1/REST/templates.

As long as the content of the template has been been published, you can use a template created in Edit Mode 1 (Drag-and-drop builder) to send via API.

You can always publish the content of a template at this endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents/publish.

Creating or editing templates in Edit Mode 1 or Edit Mode 3 is at your own risk. These templates may break in the UI, and Mailjet will not be able to repair them. Please ensure you follow these guidelines to avoid any issues with your templates.
Locale
When creating template content, a locale is required in order to be able to save and send your template.

List of Accepted Locales
en_US fr_FR da_DK de_DE es_ES nl_NL it_IT sv_SE pt_BR pt_PT ru_RU ja_JP lv_LV is_IS ro_RO el_GR ar_AR sk_SK cs_CZ pl_PL zh_CN

Important note: If the purpose of your template is automation, only the following locales are accepted:

en_US
fr_fr
de_DE
ìt_IT
es_ES
Content Type
Template content is categorized by content types. There are three types:

D = Draft. Template content is always created with this status.
P = Published. Content that has been published will have this status.
A = Autosave. Indicates that an autosave has occurred in the user interface.
By default, the content type is set to D.

You cannot directly modify the content type field via API, but you can search by content type.

To send your template, it must have a content type of P, meaning it has been published. To publish your template, use its ID with a POST request to this endpoint: https://api.mailjet.com/v1/REST/templates/:id/contents/publish.

Since the Content API always publishes the latest draft, you may want to search by content type D before publishing to ensure you are publishing the correct content.

Additionally, Mailjet stores up to 5 versions of content per content type for a single template. If you need to revert to a previous version, you can also search by content type. For details on reverting to a previous version of template content, refer to our FAQ.

Create a Template
Endpoint: POST https://api.mailjet.com/v1/REST/templates
This endpoint allows you to create a new email template in the Mailjet system. Creating a template is the first step in the process and involves setting up the basic structure, such as the template name, description and purpose.

This step is necessary before you can proceed to add content to your template.

Once your template has been successfully created, refer to the Create Template Content section for detailed instructions on how to add and customize the content of your template.

Body Parameters
Name

Type

Description

Name

string

Required. A unique identifier for the template.

EditMode

integer

Specifies the mode in which the template can be edited. Default value: 2. Learn more about edit modes.

LabelIDs

array of integers

Labels associated with the template. See how to retrieve a list of labels here.

Purposes

array of strings

Required if you would like the template to appear in the UI. Accepted values: marketing, transactional, automation, and opt-in. Learn more about template purposes.

Description

string or null

A brief description of the template.

IsStarred

boolean

Indicates whether the template is marked as a favorite. True = favorite.

IsTextPartGenerationEnabled

boolean

Determines if text part generation functionality is enabled for this template. True = enabled.

Example Request:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/rest/templates/ \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{
6
  "Name": "Welcome to Mailjet!",
7
  "EditMode": 2,
8
  "Purposes": ["marketing", "transactional"],
9
  "IsStarred": true
10
}'
`
Status code: 201

Response Data Field Structure:
Name

Type

Description

ID

integer

The ID of the template.

Name

string

The name of the template.

EditMode

integer

Specifies the mode in which the template can be edited.

LabelIDs

array of integers

An array of IDs representing labels associated with the template.

Purposes

array of strings

The type of template. Learn more about template purposes.

ExternalID

string or null

The ID that must be used to send the template.

Description

string or null

A brief description of the template.

IsPublished

boolean

Indicates whether the template is published.

IsStarred

boolean

Indicates whether the template is marked as a favorite.

IsTextPartGenerationEnabled

boolean

Determines if text part generation functionality is enabled for this template.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Response Example:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": 27,
7
            "OrganisationID": 2,
8
            "Name": "Welcome to Mailjet!",
9
            "EditMode": 2,
10
            "LabelIDs": [],
11
            "LastContentType": null,
12
            "PartialIDs": [],
13
            "Purposes": [
14
                "marketing",
15
                "transactional"
16
            ],
17
            "Categories": [
18
                "e-commerce"
19
            ],
20
            "Presets": null,
21
            "ExternalID": "123",
22
            "Description": null,
23
            "IsPublished": false,
24
            "IsStarred": true,
25
            "SoftDeleted": false,
26
            "IsTextPartGenerationEnabled": false,
27
            "CreatedAt": "2024-05-23T09:05:22.21546Z",
28
            "UpdatedAt": "2024-05-23T09:05:22.21546Z"
29
        }
30
    ]
31
}
`
List of Templates
Endpoint: GET https://api.mailjet.com/v1/REST/templates
Using this endpoint, you can retrieve comprehensive list of templates and their corresponding data, including the ExternalID which is needed to send your templates.

Query Parameters
Name

Type

Description

Sort

string

Sort is available for Name, CreatedAt, IsStarred and UpdatedAt. Default: ID ASC.

CheckLocaleOnLastContent

boolean

True = check the value of the Locale query parameter based on the last content

ID

integer

Search by the ID of the template.

IDs

array of integers

Search by multiple template IDs.

Name

string

Search by the template name. Only returns exact match.

PartialName

string

Search by partial or fragmentary name.

Locale

string

Search by the template locale. See the list of accepted locales.

EditMode

integer

Accepted values: 1, 2, 3 or 4. See more about Edit mode.

LabelIDs

array of integers

Search by label IDs associated to a template.

Purposes

string

Comma-separated list of purposes. Filters templates having all specified purposes. Accepted values: marketing, transactional, opt-in and automation. Learn more about template purposes.

ExternalID

string

Search by the send ID of the template.

IsPublished

boolean

True = published

IsStarred

boolean

True = favorite

Example Request:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com/v1/rest/templates?Limit=3&Sort=UpdatedAt%20DESC&IsStarred=false&Purposes=marketing' / \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure:
Name

Type

Description

ID

integer

The ID of the template.

Name

string

The name of the template.

EditMode

integer

Specifies the mode in which the template can be edited.

LabelIDs

array of integers

An array of IDs representing labels associated with the template.


Purposes

array of strings

The type of template. Learn more about template purposes.

ExternalID

string or null

The ID that must be used to send the template.

Description

string or null

A brief description of the template.

IsPublished

boolean

Indicates whether the template is published.

IsStarred

boolean

Indicates whether the template is marked as a favorite.

IsTextPartGenerationEnabled

boolean

Determines if text part generation functionality is enabled for this template.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Response Example:
API response:

1
{
2
  "Count": 3,
3
  "Total": 6,
4
  "Data": [
5
    {
6
      "ID": 12,
7
      "OrganisationID": 2,
8
      "Name": "Welcome to Mailjet1",
9
      "EditMode": 2,
10
      "LabelIDs": [],
11
      "LastContentType": null,
12
      "PartialIDs": [],
13
      "Purposes": [
14
        "marketing",
15
        "transactional"
16
      ],
17
      "Categories": [
18
        "e-commerce"
19
      ],
20
      "Presets": null,
21
      "ExternalID": "123",
22
      "Description": null,
23
      "IsPublished": false,
24
      "IsStarred": false,
25
      "SoftDeleted": false,
26
      "IsTextPartGenerationEnabled": false,
27
      "CreatedAt": "2024-04-19T11:44:24.0638Z",
28
      "UpdatedAt": "2024-04-19T11:44:24.0638Z"
29
    },
30
    {
31
      "ID": 11,
32
      "OrganisationID": 2,
33
      "Name": "Welcome to Mailjet2",
34
      "EditMode": 2,
35
      "LabelIDs": [],
36
      "LastContentType": null,
37
      "PartialIDs": [],
38
      "Purposes": [
39
        "marketing",
40
        "transactional"
41
      ],
42
      "Categories": null,
43
      "Presets": null,
44
      "ExternalID": "456",
45
      "Description": null,
46
      "IsPublished": false,
47
      "IsStarred": false,
48
      "SoftDeleted": false,
49
      "IsTextPartGenerationEnabled": false,
50
      "CreatedAt": "2024-04-19T11:43:56.283337Z",
51
      "UpdatedAt": "2024-04-19T11:43:56.283337Z"
52
    },
53
    {
54
      "ID": 10,
55
      "OrganisationID": 2,
56
      "Name": "Welcome to Mailjet3",
57
      "EditMode": 2,
58
      "LabelIDs": [],
59
      "LastContentType": null,
60
      "PartialIDs": [],
61
      "Purposes": [
62
        "marketing",
63
        "transactional"
64
      ],
65
      "Categories": null,
66
      "Presets": null,
67
      "ExternalID": "789",
68
      "Description": null,
69
      "IsPublished": false,
70
      "IsStarred": false,
71
      "SoftDeleted": false,
72
      "IsTextPartGenerationEnabled": false,
73
      "CreatedAt": "2024-04-19T11:33:57.789254Z",
74
      "UpdatedAt": "2024-04-19T11:33:57.789254Z"
75
    }
76
  ]
77
}
`
Retrieve a Single Template
Endpoint: GET https://api.mailjet.com/v1/REST/templates/:id
Using this endpoint, you can retrieve detailed information about a specific email template using its unique template ID. This endpoint is particularly useful when you need to fetch the details of a single template for viewing, editing, or sending purposes.

URL Parameters:
id = The ID of the template.
Example Request:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com/v1/rest/templates/1 \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure:
Name

Type

Description

ID

integer

The ID of the template.

Name

string

The name of the template.

EditMode

integer

Specifies the mode in which the template can be edited.

LabelIDs

array of integers

An array of IDs representing labels associated with the template.


Purposes

array of strings

The type of template. Learn more about template purposes.

ExternalID

string or null

The ID that must be used to send the template.

Description

string or null

A brief description of the template.

IsPublished

boolean

Indicates whether the template is published.

IsStarred

boolean

Indicates whether the template is marked as a favorite.

IsTextPartGenerationEnabled

boolean

Determines if text part generation functionality is enabled for this template.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Response Example:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": 27,
7
            "OrganisationID": 2,
8
            "Name": "Welcome to Mailjet!",
9
            "EditMode": 2,
10
            "LabelIDs": [],
11
            "LastContentType": null,
12
            "PartialIDs": [],
13
            "Purposes": [
14
                "marketing",
15
                "transactional"
16
            ],
17
            "Categories": [
18
                "e-commerce"
19
            ],
20
            "Presets": null,
21
            "ExternalID": "123",
22
            "Description": null,
23
            "IsPublished": false,
24
            "IsStarred": true,
25
            "SoftDeleted": false,
26
            "IsTextPartGenerationEnabled": false,
27
            "CreatedAt": "2024-05-23T09:05:22.21546Z",
28
            "UpdatedAt": "2024-05-23T09:05:22.21546Z"
29
        }
30
    ]
31
}
`
Update a Template
Endpoint: PUT https://api.mailjet.com/v1/REST/templates/:id/
You can easily update a template using this endpoint. Add new labels, modify the name, add it as a favorite and more.

URL Parameters:
id = The ID of the template.
Body Parameters
Name

Type

Description

Name

string

Required. A unique identifier for the template.

EditMode

integer

Specifies the mode in which the template can be edited. Default value: 2. Learn more about edit modes.

LabelIDs

array of integers

Labels associated with the template. See how to retrieve a list of labels here.

Purposes

array of strings

The category or categories of the template in the UI. Accepted values: marketing, transactional, automation, and opt-in.

Description

string or null

A brief description of the template.

IsStarred

boolean

Indicates whether the template is marked as a favorite. True = favorite.

IsTextPartGenerationEnabled

boolean

Determines if text part generation functionality is enabled for this template. True = enabled

Example Request:
cURL
1
curl --request PUT \
2
  --url https://api.mailjet.com/v1/rest/templates/27 / \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{
6
    "Name": "New version",
7
    "EditMode": 2,
8
    "IsStarred": false,
9
    "Purposes": ["marketing"],
10
}'
`
Status code: 200

Response Data Field Structure:
Name

Type

Description

ID

integer

The ID of the template.

Name

string

The name of the template.

EditMode

integer

Specifies the mode in which the template can be edited.

LabelIDs

array of integers

An array of IDs representing labels associated with the template.

Purposes

array of strings

The type of template. Learn more about template purposes

ExternalID

string or null

The ID that must be used to send the template.

Description

string or null

A brief description of the template.

IsPublished

boolean

Indicates whether the template is published.

IsStarred

boolean

Indicates whether the template is marked as a favorite.

IsTextPartGenerationEnabled

boolean

Determines if text part generation functionality is enabled for this template.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": 27,
7
            "OrganisationID": 2,
8
            "Name": "New version.",
9
            "EditMode": 2,
10
            "LabelIDs": [],
11
            "LastContentType": null,
12
            "PartialIDs": [],
13
            "Purposes": [
14
                "marketing"
15
            ],
16
            "Categories": [
17
                "e-commerce"
18
            ],
19
            "Presets": null,
20
            "ExternalID": "123",
21
            "Description": null,
22
            "IsPublished": false,
23
            "IsStarred": false,
24
            "SoftDeleted": false,
25
            "IsTextPartGenerationEnabled": false,
26
            "CreatedAt": "2024-05-23T09:05:22.21546Z",
27
            "UpdatedAt": "2024-05-23T09:11:28.779525Z"
28
        }
29
    ]
30
}
`
Delete a Template
Endpoint: DELETE https://api.mailjet.com/v1/REST/templates/:id
You can delete a template using the template ID.

Once a template is deleted, it cannot be restored. Ensure you have verified the template ID and are certain about deleting the template before proceeding with this action.
URL Parameters:
id = The ID of the template.
Example Request:
cURL
1
curl --request DELETE \
2
  --url https://api.mailjet.com/v1/rest/templates/1 \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 204

Create template content
Endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents
Once you have created your template, you should use this endpoint to add content to your template. You will need to specify the template ID and include either MJML, HTML or plain text.

URL Parameters:
id = The ID of the template.
Body Parameters
Name

Type

Description

Author

string

The name of the person or entity creating the template content.

Name

string

The name of the template content.

Locale

string

Required. Specifies the locale (language and region) for the template content. See the full list of accepted locales.

MJMLPart

string

The MJML code for the template. Either MJMLPart, TextPart or HTMLPart must be provided.

HTMLPart

string

The HTML code for the template. Either MJMLPart, TextPart or HTMLPart must be provided.

TextPart

string

The plain text version of the template content. Either MJMLPart, TextPart or HTMLPart must be provided.

Headers

json string

Additional headers for the template in JSON format. This can be used to set custom headers for the email content.

Example Request:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/rest/templates/27/contents \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{
6
      "Name": "First content",
7
      "Headers": {
8
          "Subject": "Welcome to Mailjet",
9
          "From": "MyCompany <info@mycompany.com>",
10
          "Reply-To": "",
11
          "SenderName": "My Company",
12
          "SenderEmail": "info@mycompany.com"
13
      },
14
      "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
15
      "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
16
      "Locale": "en_US"
17
}'
`
Status code: 201

Response Data Field Structure
Name

Type

Description

ID

integer

This is the ID of the version of your content.

TemplateID

integer

This is the ID of the template.

ContentType

string

"D", "P" or "A". Always "D" when created.

Author

string or null

The name of the person or entity creating the template content.

Name

string

The name of the template content.

IsLocked

boolean

If this field is true (locked), the template content cannot be edited.

Locale

string

Specifies the locale (language and region) for the template content.

MJMLPart

string or null

The MJML code for the template.

HTMLPart

string or null

The HTML code for the template.

TextPart

string or null

The plain text version of the template content.

Headers

json string

Headers for the template in JSON format.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Example Response:
API response:

1
{
2
  "ID": 16,
3
  "OrganisationID": 2,
4
  "UserID": 2,
5
  "TemplateID": 1,
6
  "ContentType": "D",
7
  "Author": "Toto",
8
  "Name": "New Name",
9
  "IsLocked": true,
10
  "Locale": "fr_FR",
11
  "Headers": {
12
    "Subject": "Welcome to Mailjet",
13
    "From": "MyCompany <info@mycompany.com>",
14
    "Reply-To": "",
15
    "SenderName": "My Company",
16
    "SenderEmail": "info@mycompany.com"
17
  },
18
  "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
19
  "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
20
  "CreatedAt": "2024-04-19T15:19:08.322718Z",
21
  "UpdatedAt": "2024-04-19T15:19:08.322718Z"
22
}
`
Get Template Content by Status
Endpoint: GET https://api.mailjet.com/v1/REST/templates/:templateid/contents/types/:content_type
You can retrieve the most recent content of your template. This endpoint allows you to access specific versions of your template content based on their status: Draft, Published, or Autosave. This can be useful for reviewing the content before making further modifications or publishing.

URL Parameters:
templateid: The ID of the template.
content_type: The content status that you wish to retrieve. Accepted values: D (Draft), P (Published), A (Autosave).
Example Request:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com//v1/rest/templates/1/contents/types/D \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the content version.

TemplateID

integer

The ID of the template.

ContentType

string

"D", "P" or "A". Always "D" when created.

Author

string or null

The name of the person or entity creating the template content.

Name

string

The name of the template content.

IsLocked

boolean

If this field is true (locked), the template content cannot be edited.

Locale

string

Specifies the locale (language and region) for the template content.

MJMLPart

string or null

The MJML code for the template.

HTMLPart

string or null

The HTML code for the template.

TextPart

string or null

The plain text version of the template content.

Headers

json string

Headers for the template in JSON format.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Response Example:
API response:

1
{
2
  "Count": 1,
3
  "Total": 1,
4
  "Data": [
5
    {
6
      "ID": 22,
7
      "OrganisationID": 2,
8
      "UserID": 2,
9
      "TemplateID": 27,
10
      "ContentType": "D",
11
      "Author": "",
12
      "Name": "First content",
13
      "IsLocked": false,
14
      "Locale": "fr_FR",
15
      "Headers": {
16
        "Subject": "Welcome to Mailjet",
17
        "From": "MyCompany <info@mycompany.com>",
18
        "Reply-To": "",
19
        "SenderName": "My Company",
20
        "SenderEmail": "info@mycompany.com"
21
      },
22
      "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
23
      "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
24
      "CreatedAt": "2024-05-23T09:21:23.672175Z",
25
      "UpdatedAt": "2024-05-23T09:21:23.672175Z"
26
      }
27
  ]
28
}
`
List All Template Content
Endpoint: GET https://api.mailjet.com/v1/REST/templates/:id/contents
You can use this endpoint to retrieve previous versions of your template's content. Specifically, you can access the five most recent versions for each status: Draft, Published and Autosave.

This feature is particularly useful when looking to revert your template content to a previous version. Learn how to revert your template content to a previous version in the FAQ.

URL Parameters:
id = The ID of the template.
Query Parameters
Name

Type

Description

Sort

string

Sort is available for UpdatedAt. Default: UpdatedAt DESC.

ID

integer

The ID of the content version.

Locale

string

Specifies the locale (language and region) for the template content.

ContentType

string

"D", "P" or "A". Always "D" when created

IsLocked

boolean

If this field is true (locked), the template content cannot be edited.

Example Request:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com//v1/rest/templates/1/contents?Limit=2&Sort=Updated%20ASC&Locale=fr_FR' \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the content version.

TemplateID

integer

The ID of the template.

ContentType

string

"D", "P" or "A". Always "D" when created.

Author

string or null

The name of the person or entity creating the template content.

Name

string

The name of the template content.

IsLocked

boolean

If this field is true (locked), the template content cannot be edited.

Locale

string

Specifies the locale (language and region) for the template content. See the full list of accepted locales.

MJMLPart

string or null

The MJML code for the template.

HTMLPart

string or null

The HTML code for the template.

TextPart

string or null

The plain text version of the template content.

Headers

json string

Additional headers for the template in JSON format.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Response Example:
API response:

1
{
2
  "Count": 2,
3
  "Total": 2,
4
  "Data": [
5
    {
6
      "ID": 2,
7
      "OrganisationID": 2,
8
      "UserID": 2,
9
      "TemplateID": 1,
10
      "ContentType": "P",
11
      "Author": "",
12
      "Name": "",
13
      "IsLocked": false,
14
      "Locale": "fr_FR",
15
      "Headers": {
16
        "Subject": "Welcome to Mailjet",
17
        "From": "MyCompany <info@mycompany.com>",
18
        "Reply-To": "",
19
        "SenderName": "My Company",
20
        "SenderEmail": "info@mycompany.com"
21
      },
22
      "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
23
      "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
24
      "CreatedAt": "2024-03-27T16:15:44.812084Z",
25
      "UpdatedAt": "2024-03-27T16:15:44.812084Z"
26
    },
27
    {
28
      "ID": 1,
29
      "OrganisationID": 2,
30
      "UserID": 2,
31
      "TemplateID": 1,
32
      "ContentType": "D",
33
      "Author": "",
34
      "Name": "",
35
      "IsLocked": false,
36
      "Locale": "fr_FR",
37
      "Headers": {
38
        "Subject": "Welcome to Mailjet",
39
        "From": "MyCompany <info@mycompany.com>",
40
        "Reply-To": "",
41
        "SenderName": "My Company",
42
        "SenderEmail": "info@mycompany.com"
43
      },
44
      "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
45
      "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
46
      "CreatedAt": "2024-03-19T13:37:27.11497Z",
47
      "UpdatedAt": "2024-03-19T13:37:27.11497Z"
48
    }
49
  ]
50
}
`
Update Template Content
Endpoint: PUT https://api.mailjet.com/v1/REST/templates/:id/contents/types/:content_type
You can use this endpoint to update draft template content. When you make updates, the endpoint takes the latest draft version, applies your changes, and creates a new draft version. This enables you to modify various elements of the template, such as the text, HTML, and headers.

If your template content is published, you will can create template content at the following endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents.

Once it is created, you can publish it using this endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents/publish.

URL Parameters:
id = The ID of the template.
content_type = The content status that you wish to update. Accepted value: D (Draft).
Body Parameters
Name

Type

Description

Author

string

The name of the person or entity creating the template content.

Name

string

The name of the template content.

Locale

string

Specifies the locale (language and region) for the template content. See the full list of accepted locales.

MJMLPart

string or null

The MJML code for the template.

HTMLPart

string or null

The HTML code for the template.

TextPart

string or null

The plain text version of the template content.

Headers

json string

Additional headers for the template in JSON format.

Example Request:
cURL
1
curl --request PUT \
2
  --url https://api.mailjet.com//v1/rest/templates/27/contents/types/D \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{
6
      "Locale": "fr_FR",
7
      "Headers": {
8
          "Subject": "Welcome to Mailjet",
9
          "From": "MyCompany <info@mycompany.com>",
10
          "Reply-To": "",
11
          "SenderName": "My Company",
12
          "SenderEmail": "info@mycompany.com"
13
      },
14
      "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
15
      "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
16
      "Name": "New Name",
17
      "Author": "John Doe"
18
}'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the content version.

TemplateID

integer

The ID of the template.

ContentType

string

"D", "P" or "A". Always "D" when created.

Author

string or null

The name of the person or entity creating the template content.

Name

string

The name of the template content.

IsLocked

boolean

If this field is true (locked), the template content cannot be edited.

Locale

string

Specifies the locale (language and region) for the template content.

MJMLPart

string or null

The MJML code for the template.

HTMLPart

string or null

The HTML code for the template.

TextPart

string or null

The plain text version of the template content.

Headers

json string

Additional headers for the template in JSON format.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Response Example:
API response:

1
{
2
  "Count": 1,
3
  "Total": 1,
4
  "Data": [
5
    {
6
      "ID": 23,
7
      "OrganisationID": 2,
8
      "UserID": 2,
9
      "TemplateID": 27,
10
      "ContentType": "D",
11
      "Author": "John Doe",
12
      "Name": "New Name",
13
      "IsLocked": false,
14
      "Locale": "fr_FR",
15
      "Headers": {
16
        "Subject": "Welcome to Mailjet",
17
        "From": "MyCompany <info@mycompany.com>",
18
        "Reply-To": "",
19
        "SenderName": "My Company",
20
        "SenderEmail": "info@mycompany.com"
21
      },
22
      "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
23
      "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
24
      "CreatedAt": "2024-05-23T09:54:37.300091Z",
25
      "UpdatedAt": "2024-05-23T09:54:37.300091Z"
26
    }
27
  ]
28
}
`
Publish Template Content
Endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents/publish
You can publish the content of your template to make it available for sending.

When you publish your template content, it is always the most recent draft content that is published. Be careful to verify that your most recent draft is the content that you wish to publish as that is what will be sent.
URL Parameters:
id = The ID of the template.
Example Request:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/rest/templates/1/contents/publish \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the content version.

TemplateID

integer

The ID of the template.

ContentType

string

"D", "P" or "A". Always "D" when created.

Author

string or null

The name of the person or entity creating the template content.

Name

string

The name of the template content.

IsLocked

boolean

If this field is true (locked), the template content cannot be edited.

Locale

string

Specifies the locale (language and region) for the template content.

MJMLPart

string or null

The MJML code for the template.

HTMLPart

string or null

The HTML code for the template.

TextPart

string or null

The plain text version of the template content.

Headers

json string

Additional headers for the template in JSON format.

CreatedAt

Date RFC3339

The date and time when the template was created.

UpdatedAt

Date RFC3339

The date and time when the template was last updated.

Example Response:
API response:

1
{
2
    "Count": 1,
3
  "Total": 1,
4
  "Data": 
5
  [{
6
    "ID": 24,
7
    "OrganisationID": 2,
8
    "UserID": 2,
9
    "TemplateID": 27,
10
    "ContentType": "P",
11
    "Author": "John Doe",
12
    "Name": "New Name",
13
    "IsLocked": false,
14
    "Locale": "fr_FR",
15
    "Headers": {
16
      "Subject": "Welcome to Mailjet",
17
      "From": "MyCompany <info@mycompany.com>",
18
      "Reply-To": "",
19
      "SenderName": "My Company",
20
      "SenderEmail": "info@mycompany.com"
21
    },
22
    "HTMLPart": "<!doctype html><html><body><p>May the delivery force be with you!</p></body></html>",
23
    "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
24
    "CreatedAt": "2024-05-23T09:56:00.667109Z",
25
    "UpdatedAt": "2024-05-23T09:56:00.667109Z"
26
    }]
27
}
`
Lock or Unlock Template Content
Locking the content of your template prevents any further edits, ensuring that the current version remains unchanged until it is unlocked. This can be particularly useful when you have finalized a template and want to prevent accidental modifications.

In contrast, unlocking the content of your template allows you to make changes to the template again.

You can use the following endpoints to lock and unlock your templates.

Lock Template Content
Endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents/lock
URL Parameters:
id = The ID of the template.
Example Request:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/rest/templates/1/contents/lock \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \'
`
Status code: 204

Unlock Template Content
Endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents/unlock
URL Parameters:
id = The ID of the template.
Example Request:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/rest/templates/1/contents/unlock \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \'
`
Status code: 204


Image Management
Overview
With the Content API, you can upload images to the Mailjet image gallery, making them available in the user interface (UI). You can also manage or update the images that you have uploaded. You can also retrieve the URLs of images in order to add them to your templates.

Locking images
You can control whether an image can be edited by setting its status in the Status field. When the status is set to locked, edits are prevented. Conversely, when the status is set to open, the image can be modified. The Status field is required when uploading an image.

Upload an image
Endpoint: POST https://api.mailjet.com/v1/data/images
Upload an image along with its metadata. This endpoint accepts multipart/mixed and multipart/form-data where the image file and its metadata are submitted together.

The maximum upload size for a single image is 2MB. Image files that will be used in emails should not exceed 200 KB to optimize loading times.

Request Content Type: multipart/mixed or multipart/form-data
Request Parts:
file (required): The binary data of the image. Supported content types: image/jpeg, image/png, image/svg, image/gif, image/webp.
Metadata(required): A JSON object containing the following body parameters:
Name

Type

Description

Name

string

Required.

Status

string

Required. Accepted values: open or locked.

LabelIDs

array of integers

An array of IDs representing labels associated with the image.

IsStarred

boolean

Indicates whether the template is marked as a favorite. True = favorite.

Example Request:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/data/images \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --form 'file=@"postman-cloud:///1eee6a09-165d-4570-99d2-1e863ed3ac2c";type=image/jpeg' \
5
  --form 'Metadata="{
6
\"Name\": \"My Image\",
7
\"Status\": \"open\"
8
}";type=application/json'
`
Status code: 201

Response Data Field Structure
Name

Type

Description

ID

string

The ID of the image.

Name

string

The name of the image.

Status

string

Indicates whether the image is open or locked.

TargetContent

string

Indicates the purpose of the image. Possible values: image, background, video or social.

ImageSize

integer

The size of the image file in bytes.

LabelIDs

array of integers

An array of IDs representing labels associated with the image.

IsStarred

boolean

Indicates whether the image is marked as a favorite.

ImageURL

string

The URL where the image is stored.

ThumbnailUrl

string

The URL where the thumbnail is stored.

CreatedAt

DateTime UTC

The date and time when the image was created.

UpdatedAt

DateTime UTC

The date and time when the image was last updated.

ExpiresAt

DateTime UTC

The date and time when the image will expire.

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": "a3da1de2-2319-44e9-9c75-e6a00a2ec5da",
7
            "OrganisationID": 2,
8
            "Name": "My Image",
9
            "Status": "open",
10
            "TargetContent": "image",
11
            "ImageSize": 425155,
12
            "ThumbnailSize": 0,
13
            "TotalSize": 425155,
14
            "LabelIDs": [],
15
            "IsStarred": false,
16
            "ImageUrl": "https://0abcd.mjt.lu/img2/0abcd/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/content",
17
            "ThumbnailUrl": null,
18
            "CreatedAt": "2024-05-23T12:51:58.97041Z",
19
            "UpdatedAt": "2024-05-23T12:51:58.97041Z",
20
            "ExpiresAt": "2024-12-10T00:00:00Z"
21
        }
22
    ]
23
}
`
Upload a Thumbnail or Update an Image
Endpoint: PUT https://api.mailjet.com/v1/data/images/:id/:content_type
A thumbnail is a smaller version of your image. We strongly recommend uploading a thumbnail to improve loading times in the Mailjet gallery.

Upload or update the thumbnail of an existing image or update an existing image. The content_type parameter determines whether the request is for an image (content) or a thumbnail (thumbnail).

URL Parameters:
id: The ID of the image.
content_type: Either content or thumbnail.
Request Content Type: multipart/mixed or multipart/form-data
Request Parts:
file (required): The binary data of the image. Supported content types: image/jpeg, image/png, image/svg, image/gif, image/webp.

Example Request:
cURL
1
curl --request PUT \
2
  --url https://api.mailjet.com/v1/data/images/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/thumbnail \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --form 'file=@"postman-cloud:///1eee6a09-165d-4570-99d2-1e863ed3ac2c";type=image/jpeg'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

string

The ID of the image.

Name

string

The name of the image.

Status

string

Indicates whether the image is open or locked.

TargetContent

string

Indicates the purpose of the image. Possible values: image, background, video or social.

ImageSize

integer

The size of the image file in bytes.

LabelIDs

array of integers

An array of IDs representing labels associated with the image.

IsStarred

boolean

Indicates whether the image is marked as a favorite.

ImageURL

string

The URL where the image is stored.

ThumbnailUrl

string

The URL where the thumbnail is stored.

CreatedAt

DateTime UTC

The date and time when the image was created.

UpdatedAt

DateTime UTC

The date and time when the image was last updated.

ExpiresAt

DateTime UTC

The date and time when the image will expire.

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": "a3da1de2-2319-44e9-9c75-e6a00a2ec5da",
7
            "OrganisationID": 2,
8
            "Name": "My Image",
9
            "Status": "open",
10
            "TargetContent": "image",
11
            "ImageSize": 425155,
12
            "ThumbnailSize": 425155,
13
            "TotalSize": 850310,
14
            "LabelIDs": [],
15
            "IsStarred": false,
16
            "ImageUrl": "https://0abcd.mjt.lu/img2/0abcd/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/content",
17
            "ThumbnailUrl": "https://0abcd.mjt.lu/img2/0abcd/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/thumbnail",
18
            "CreatedAt": "2024-05-23T12:51:58.97041Z",
19
            "UpdatedAt": "2024-05-23T13:17:52.522524Z",
20
            "ExpiresAt": "2024-12-10T00:00:00Z"
21
        }
22
    ]
23
}
`
List of Image Metadata
Endpoint: GET https://api.mailjet.com/v1/REST/images
Retrieve metadata for multiple images, including details such as image ID, status, name, and label IDs. This endpoint can be useful for retrieving the URLs of images you would like to use in your templates.

Query Parameters
Name

Type

Description

ID

string

The ID of the image.

IDs

array of strings

An array of image IDs.

IsStarred

boolean

Indicates whether the image is marked as a favorite.

Status

string

Accepted values: "open" or "locked".

LabelIDs

array of integers

An array of IDs representing labels associated with the image or images.

Name

string

The name of the image.

PartialName

string


Example Request:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com/v1/rest/images \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

string

The ID of the image.

Name

string

The name of the image.

Status

string

Indicates whether the image is open or locked.

TargetContent

string

Indicates the purpose of the image. Possible values: image, background, video or social.

ImageSize

integer

The size of the image file in bytes.

LabelIDs

array of integers

An array of IDs representing labels associated with the image.

IsStarred

boolean

Indicates whether the image is marked as a favorite.

ImageURL

string

The URL where the image is stored.

ThumbnailUrl

string

The URL where the thumbnail is stored.

CreatedAt

DateTime UTC

The date and time when the image was created.

UpdatedAt

DateTime UTC

The date and time when the image was last updated.

ExpiresAt

DateTime UTC

The date and time when the image will expire.

Example Response:
API response:

1
{
2
    "Count": 2,
3
    "Total": 2,
4
    "Data": [
5
        {
6
            "ID": "07ea8ad6-161a-4bfe-9f38-3311c9e38984",
7
            "OrganisationID": 2,
8
            "Name": "My Image",
9
            "Status": "open",
10
            "TargetContent": "image",
11
            "ImageSize": 425155,
12
            "ThumbnailSize": 0,
13
            "TotalSize": 425155,
14
            "LabelIDs": [],
15
            "IsStarred": false,
16
            "ImageUrl": "https://0abcd.mjt.lu/img2/0abcd/07ea8ad6-161a-4bfe-9f38-3311c9e38984/content",
17
            "ThumbnailUrl": null,
18
            "CreatedAt": "2024-05-06T07:32:41.262245Z",
19
            "UpdatedAt": "2024-05-06T07:32:41.262245Z",
20
            "ExpiresAt": "2024-11-23T00:00:00Z"
21
        },
22
        {
23
            "ID": "83732525-8a61-48b1-86ef-b54cac7aa897",
24
            "OrganisationID": 2,
25
            "Name": "My Other Image",
26
            "Status": "open",
27
            "TargetContent": "image",
28
            "ImageSize": 425155,
29
            "ThumbnailSize": 0,
30
            "TotalSize": 425155,
31
            "LabelIDs": [],
32
            "IsStarred": false,
33
            "ImageUrl": "https://0abcd.mjt.lu/img2/0abcd/83732525-8a61-48b1-86ef-b54cac7aa897/content",
34
            "ThumbnailUrl": null,
35
            "CreatedAt": "2024-04-16T14:29:54.182242Z",
36
            "UpdatedAt": "2024-04-16T14:29:54.182242Z",
37
            "ExpiresAt": "2024-11-03T00:00:00Z"
38
        },
39
    ]
40
}
`
Retrieve Image Metadata
Endpoint: GET https://api.mailjet.com/v1/REST/images/:id
Retrieve metadata for a single image using its unique ID, including details such as the status, name, and label IDs.

URL Parameters
id: The ID of the image.
Example Request:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com/v1/rest/images/a3da1de2-2319-44e9-9c75-e6a00a2ec5da \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

string

The ID of the image.

Name

string

The name of the image.

Status

string

Indicates whether the image is open or locked.

TargetContent

string

Indicates the purpose of the image. Possible values: image, background, video or social.

ImageSize

integer

The size of the image file in bytes.

LabelIDs

array of integers

An array of IDs representing labels associated with the image.

IsStarred

boolean

Indicates whether the image is marked as a favorite.

ImageURL

string

The URL where the image is stored.

ThumbnailUrl

string

The URL where the thumbnail is stored.

CreatedAt

DateTime UTC

The date and time when the image was created.

UpdatedAt

DateTime UTC

The date and time when the image was last updated.

ExpiresAt

DateTime UTC

The date and time when the image will expire.

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": "a3da1de2-2319-44e9-9c75-e6a00a2ec5da",
7
            "OrganisationID": 2,
8
            "Name": "My Image",
9
            "Status": "open",
10
            "TargetContent": "image",
11
            "ImageSize": 425155,
12
            "ThumbnailSize": 425155,
13
            "TotalSize": 850310,
14
            "LabelIDs": [],
15
            "IsStarred": false,
16
            "ImageUrl": "https://0abcd.mjt.lu/img2/0abcd/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/content",
17
            "ThumbnailUrl": "https://0abcd.mjt.lu/img2/0abcd/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/thumbnail",
18
            "CreatedAt": "2024-05-23T12:51:58.97041Z",
19
            "UpdatedAt": "2024-05-23T13:17:52.522524Z",
20
            "ExpiresAt": "2024-12-10T00:00:00Z"
21
        }
22
    ]
23
}
`
Update Image Metadata
Endpoint: PUT https://api.mailjet.com/v1/REST/images/:id
Update the metadata of an existing image using its unique ID. This endpoint allows you to modify the metadata of the image, such as the name, status and more.

Only the metadata of the image can be updated through this endpoint, not the image file itself.
URL Parameters
id: The ID of the image.
Body Parameters
Name

Type

Description

Name

string

The name of the image.

Status

string

Accepted values: open or locked.

LabelIDs

array of integers

An array of IDs representing labels associated with the image or images.

IsStarred

boolean

Indicates whether the image is marked as a favorite. True = favorite.

Example Request:
cURL
1
curl --request PUT \
2
  --url https://api.mailjet.com/v1/data/images/a3da1de2-2319-44e9-9c75-e6a00a2ec5da \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{  
6
"Name": "myotherimage"
7
}'
`
Status code: 200

Response Data Field Structure:
Name

Type

Description

ID

string

The ID of the image.

Name

string

The name of the image.

Status

string

Indicates whether the image is open or locked.

TargetContent

string

Indicates the purpose of the image. Possible values: image, background, video or social.

ImageSize

integer

The size of the image file in bytes.

LabelIDs

array of integers

An array of IDs representing labels associated with the image.

IsStarred

boolean

Indicates whether the image is marked as a favorite.

ImageURL

string

The URL where the image is stored.

ThumbnailUrl

string

The URL where the thumbnail is stored.

CreatedAt

DateTime UTC

The date and time when the image was created.

UpdatedAt

DateTime UTC

The date and time when the image was last updated.

ExpiresAt

DateTime UTC

The date and time when the image will expire.

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": "a3da1de2-2319-44e9-9c75-e6a00a2ec5da",
7
            "OrganisationID": 2,
8
            "Name": "myotherimage",
9
            "Status": "open",
10
            "TargetContent": "image",
11
            "ImageSize": 425155,
12
            "ThumbnailSize": 425155,
13
            "TotalSize": 850310,
14
            "LabelIDs": [],
15
            "IsStarred": false,
16
            "ImageUrl": "https://0abcd.mjt.lu/img2/0abcd/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/content",
17
            "ThumbnailUrl": "https://0abcd.mjt.lu/img2/0abcd/a3da1de2-2319-44e9-9c75-e6a00a2ec5da/thumbnail",
18
            "CreatedAt": "2024-05-23T12:51:58.97041Z",
19
            "UpdatedAt": "2024-05-23T13:20:14.461823Z",
20
            "ExpiresAt": "2025-03-20T14:13:28.08024Z"
21
        }
22
    ]
23
}
`
Delete an Image
Endpoint: DELETE https://api.mailjet.com/v1/rest/images/:id
Permanently delete an image using its unique ID.

Once an image is deleted through this endpoint, it cannot be restored. Ensure you have verified the image ID and are certain about deleting the image before proceeding with this action.
URL Parameters
id: The ID of the image.
Example Request:
cURL
1
curl --request DELETE \
2
  --url https://api.mailjet.com/v1/rest/images/9c803aa4-4e97-453c-aa89-4a9134f7f01f
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 204


Label Management
Overview
Labels are used to categorize your images or templates by assigning tags to them. Each label has a unique name, a color represented as a hexadecimal code, and a type indicating whether it is used for images (image) or templates (resource).

Create a Label
Endpoint: POST https://api.mailjet.com/v1/rest/labels
You can create a label using this endpoint. Labels can be used to categorize resources (templates) or images for better organization.

Body Parameters
Name

Type

Description

Name

string

Required and unique.

Color

string

Required and should be a valid hexadecimal color (e.g., #FFFFFF).

UsedFor

string

Indicates if the label is used for a template (resource) or an image. Possible values are image or resource. Default is resource.

Request Example for a Template Label:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/rest/labels/ \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{
6
    "Name": "Sport templates",
7
    "Color": "#FFFFFF",
8
    "UsedFor": "resource"
9
}'
`
Status code: 201

Request Example for an Image Label:
cURL
1
curl --request POST \
2
  --url https://api.mailjet.com/v1/rest/labels/ \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{
6
    "Name": "Cat images",
7
    "Color": "#FFFFFF",
8
    "UsedFor": "image"
9
}'
`
Status code: 201

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the label.

Name

string

The name of the label.

Color

string

The hexidecimal color of the label.

UsedFor

string

Indicates if the label is used for a template (resource) or an image.

Response Example for a Template Label:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
      {   
6
          "ID": 5,
7
          "OrganisationID": 2,
8
          "Name": "Sport templates",
9
          "Color": "#FFFFFF",
10
          "UsedFor": "resource"
11
      }
12
    ]
13
}
`
Response Example for an Image Label:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
      {
6
        "ID": 6,
7
        "OrganisationID": 2,
8
        "Name": "Cat images",
9
        "Color": "#FFFFFF",
10
        "UsedFor": "image"
11
      }
12
    ]
13
}
`
List Labels
Endpoint: GET https://api.mailjet.com/v1/rest/labels
You can retrieve a list of your labels using this endpoint.

Query Parameters
Sort is available for Name. Default: ID ASC.
Name

Type

Description

Name

string

Search by the name of the label.

IDs

array of integers

Search using an array of label IDs.

UsedFor

string

Specify if you want to retrieve labels for images or templates (resource). Possible values are image or resource. You cannot retrieve both in one request. Default: resource.

Request Example:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com/v1/rest/labels?Limit=3&Sort=name%20asc,id%20asc&UsedFor=image' / \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the label.

Name

string

The name of the label.

Color

string

The hexidecimal color of the label.

UsedFor

string

Indicates if the label is used for a template (resource) or an image.

Response Example:
API response:

1
{
2
    "Count": 2,
3
    "Total": 2,
4
    "Data": [
5
        {
6
            "ID": 6,
7
            "OrganisationID": 2,
8
            "Name": "Cat images",
9
            "Color": "#FFFFFF",
10
            "UsedFor": "image"
11
        },
12
        {
13
            "ID": 7,
14
            "OrganisationID": 2,
15
            "Name": "Cat images 2",
16
            "Color": "#FFFFFF",
17
            "UsedFor": "image"
18
        }
19
    ]
20
}
`
Retrieve a single label
Endpoint: GET https://api.mailjet.com/v1/rest/labels/:id
You can retrieve a single label using this endpoint. The label is identified by its unique ID.

URL Parameters:
id = The ID of the label.
Request Example:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com/v1/rest/labels/5 \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the label.

Name

string

The name of the label.

Color

string

The hexidecimal color of the label.

UsedFor

string

Indicates if the label is used for a template (resource) or an image.

Response Example:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
    {
6
        "ID": 5,
7
        "OrganisationID": 2,
8
        "Name": "Cat images",
9
        "Color": "#FFFFFF",
10
        "UsedFor": "image"
11
    }]
12
}
`
Update a Label
Endpoint: PUT https://api.mailjet.com/v1/rest/labels/:id
You can update a label using this endpoint. The label is identified by its unique ID, and you can update its name and color.

URL Parameters:
id = The ID of the label.
Body Parameters
Name

Type

Description

Name

string

Must be unique.

Color

string

Should be a valid hexadecimal color (e.g., #FFFFFF).

Request Example:
cURL
1
curl --request PUT \
2
  --url https://api.mailjet.com/v1/rest/labels/5 / \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
  --data '{
6
    "Name": "Dog images",
7
}'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the label.

Name

string

The name of the label.

Color

string

The hexidecimal color of the label.

UsedFor

string

Indicates if the label is used for a template (resource) or an image.

Response Example:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
    {
6
        "ID": 5,
7
        "OrganisationID": 2,
8
        "Name": "Dog images",
9
        "Color": "#FFFFFF",
10
        "UsedFor": "image" 
11
      }
12
}
`
Delete a Label
Endpoint: DELETE https://api.mailjet.com/v1/rest/labels/:id
You can delete a label using the label ID.

Once a label is deleted, it will be removed from all images or templates and cannot be restored. Ensure you have verified the label ID and are certain about deleting the label before proceeding with this action.
URL Parameters:
id = The ID of the label.
Request Example:
cURL
1
curl --request DELETE \
2
  --url https://api.mailjet.com/v1/rest/labels/5 \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3'
`
Status code: 204

Token Permissions
Tokens can be assigned specific permissions to control access to resources. Each permission is represented as a string that corresponds to an action a user can perform.

List of Permissions
Below is a comprehensive list of permission categories, each containing specific permissions that can be assigned to a token.

To grant access to additional permissions within a category, the token must first have the corresponding read permission.
Token Auth Permissions
Value

Description

read_token_auth

User can read token auth. Must be added to token if providing other Token Auth permissions.

create_token_auth

User can create token auth.

update_token_auth

User can update token auth.

delete_token_auth

User can delete token auth.

Template Permissions
Value

Description

read_template

User can read templates. Must be added to token if providing other Template permissions.

create_template

User can create templates.

update_template

User can update templates.

delete_template

User can delete templates.

lock_template

User can lock templates.

publish_template

User can publish templates.

Marketing Template Permissions
Token must have corresponding template permissions.

Value

Description

read_template_marketing

User can read marketing templates. Must be added to token if providing other Marketing Template permissions.

create_template_marketing

User can create marketing templates.

update_template_marketing

User can update marketing templates.

delete_template_marketing

User can delete marketing templates.

lock_template_marketing

User can lock marketing templates.

publish_template_marketing

User can publish marketing templates.

Transactional Template Permissions
Token must have corresponding template permissions.

Value

Description

read_template_transactional

User can read transactional templates. Must be added to token if providing other Transactional Template permissions.

create_template_transactional

User can create transactional templates.

update_template_transactional

User can update transactional templates.

delete_template_transactional

User can delete transactional templates.

lock_template_transactional

User can lock transactional templates.

publish_template_transactional

User can publish transactional templates.

Automation Template Permissions
Token must have corresponding template permissions.

Value

Description

read_template_automation

User can read automation templates. Must be added to token if providing other Automation Template permissions.

create_template_automation

User can create automation templates.

update_template_automation

User can update automation templates.

delete_template_automation

User can delete automation templates.

lock_template_automation

User can lock automation templates.

publish_template_automation

User can publish automation templates.

Opt-In Template Permissions
Token must have corresponding template permissions.

Value

Description

read_template_opt_in

User can read opt-in templates. Must be added to token if providing other Opt-in Template permissions.

create_template_opt_in

User can create opt-in templates.

update_template_opt_in

User can update opt-in templates.

delete_template_opt_in

User can delete opt-in templates.

lock_template_opt_in

User can lock opt-in templates.

publish_template_opt_in

User can publish opt-in templates.

Image Management Permissions
Value

Description

read_image

User can read images. Must be added to token if providing other Image Management permissions.

create_image

User can create images.

update_image

User can update images.

delete_image

User can delete images.

Label Permissions
Value

Description

read_image_label

User can read an image label. Must be added to token if providing other Image Label permissions.

create_image_label

User can create an image label.

update_image_label

User can update an image label.

delete_image_label

User can delete an image label.

read_resource_label

User can read a template label. Must be added to token if providing other Resource Label permissions.

create_resource_label

User can create a template label.

update_resource_label

User can update a template label.

delete_resource_label

User can delete a template label.

Error Codes
Like Mailjet's Send API, the Content API uses conventional HTTP response codes to indicate the success or failure of an API request. See the full list of status codes. for more information.

In this section of the API documentation, we will provide comprehensive information about the specific error codes returned by the API, the format of error responses, and the structure of specific error details.

Error Response Format
The API returns errors in the following format:

API response:

1
{
2
  "RequestGUID": "string",
3
  "ErrorCode": "string",
4
  "ErrorMessage": "string",
5
  "StatusCode": "integer",
6
  "Details": "varies"
7
}
`
Fields
Name

Type

Description

RequestGUID

string

A unique identifier for the request

ErrorCode

string

A code representing the specific error.

ErrorMessage

string

A human-readable message describing the error.

StatusCode

integer

The HTTP status code associated with the error.

Details

varies

Additional details about the error. This varies depending on the type of error.

Details Field Structure
Validation Error
When the error is a validation error, the Details field follows this structure:

1
[
2
  {
3
    "Field": "string",
4
    "Constraint": "string",
5
    "Message": "string"
6
  }
7
]
`
Fields
Name

Type

Description

Field

string

The name of the field that caused the validation error.

Constraint

string

The specific validation constraint that failed.

Message

string

A message describing the validation error.

List of Error Codes
Error Code

Error Definition

MJ-OOOO

Unknown error

MJ-0001

Invalid request

MJ-0002

Validation error

MJ-0003

Resource not found

MJ-0004

Unauthorized

PS-OOO1

Resource already exists

PS-0002

Connector error

PS-0003

Invalid limit param

PS-0004

Cannot delete a template used somewhere else

PS-0006

Cannot update published content

PS-0007

Max upload size exceeded

PS-0008

Cannot publish locked template content

PS-0009

Cannot update locked template content

PS-0010

Cannot revert locked template content

List of Validation Error Constraint Codes
Error Code

Error Definition

MJC-0000

Unexpected value

MJC-0001

Should be present

MJC-0002

Required

MJC-0003

Too short

MJC-0004

Too long

MJC-0005

Too short integer

MJC-0006

Too long integer

MJC-0007

Value not in list

MJC-0008

Invalid request parameter

MJC-0009

Required with

MJC-0010

Invalid hexadecimal color

MJC-0011

Invalid GUID

MJC-0012

Array too long

MJC-0013

Invalid user permissions

MJC-0014

Should contain min one element

MJC-0015

Invalid locale value

MJC-0016

Invalid UTF8 value

MJC-0017

Invalid length

MJC-0018

Invalid Email

MJC-0019

Invalid locale value

PSC-0001

Should contain only UT8 format

PSC-0002

Should contain only UT8 format

PSC-0003

Should contain only UT8 format


Tokens
You can generate a Bearer Token to allow users to access and use the Mailjet Content API. This token carries permissions that may restrict access to certain resources. For a detailed list of available permissions, refer to the full list of Token Permissions.

When a token is created, the token value will be displayed to the user only once. It is crucial that you securely manage and store the token value at the time of creation.
Create a Token
Endpoint: POST https://api.mailjet.com/v1/REST/tokens
You can create a token to authenticate requests and manage permissions for different operations.

Body Parameters
Name

Type

Description

Name

string

Required. A unique identifier for the token.

Permissions

array of strings

List of permissions assigned to the token. See full list of permissions.

ExpiresInDays

integer

Number of days until it expires. Default: 365 days.

ExpiresAt

Date RFC3339

Date at which the token expires

Example Request:
cURL
1
curl -X POST -H "Authorization: Basic bWFpbGpldDpyb2Nrcw==" https://api.mailjet.com/v1/rest/tokens -d '{
2
 "Name": "marketing team",
3
 "Permissions": [
4
    "read_template_marketing",
5
    "create_template_marketing",
6
    "update_template_marketing"
7
 ],
8
 "ExpiresAt": "2024-01-25T17:42:46.705583Z"
9
}'
`
Status code: 201

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the token.

Name

string

Required. A unique identifier for the token.

Permissions

array of strings

List of permissions assigned to the token. See full list of permissions.

AccessToken

string

The token value to use for authentication

ExpiresAt

Date RFC3339

Date at which the token expires

CreatedAt

Date RFC3339

Date on which the token was created

UpdatedAt

Date RFC3339

Date on which the token was last updated

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": 46,
7
            "UserID": 2,
8
            "OrganisationID": 2,
9
            "AccessToken": "612d5125131d406081abb9cd2afdc4e3",
10
            "Name": "marketing team",
11
            "Permissions": [
12
                "read_template_marketing",
13
                "create_template_marketing",
14
                "update_template_marketing"
15
            ],
16
            "CreatedAt": "2024-05-23T08:45:29.186711Z",
17
            "UpdatedAt": "2024-05-23T08:45:29.186711Z"
18
        }
19
    ]
20
}
`
List of Tokens
Endpoint: GET https://api.mailjet.com/v1/REST/tokens/
To effectively manage and monitor your tokens, you can retrieve a comprehensive list of all tokens created. This allows for easy oversight and management of token permissions and statuses.

Query Parameters
Sort is available for Name.
Name

Type

Description

Name

string

Will only return an exact match.

Example Request:
cURL
1
curl --request GET \
2
  --url https://api.mailjet.com/v1/rest/tokens \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the token.

Name

string

Required. A unique identifier for the token.

Permissions

array of strings

List of permissions assigned to the token. See full list of permissions.

ExpiresAt

Date RFC3339

Date at which the token expires.

CreatedAt

Date RFC3339

Date on which the token was created.

UpdatedAt

Date RFC3339

Date on which the token was last updated.

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": 1,
7
            "UserID": 2,
8
            "OrganisationID": 2,
9
            "AccessToken": null,
10
            "Name": "marketing team",
11
            "Permissions": [
12
                "read_template_marketing",
13
                "create_template_marketing",
14
                "update_template_marketing"
15
            ],
16
            "CreatedAt": "2024-03-19T10:19:37.911136Z",
17
            "UpdatedAt": "2024-03-19T10:19:37.911136Z"
18
        }
19
    ]
20
}
`
Update a Token
Endpoint: PUT https://api.mailjet.com/v1/REST/tokens/:id
Updating a token allows you to modify its properties, such as its name or permissions, to reflect changes in your security policies or operational requirements. You should also use this endpoint to renew a token.

URL Parameters:
id = The ID of the token.
Body Parameters
Name

Type

Description

Name

string

Required. Name of the existing token.

Permissions

array of strings

List of permissions assigned to the token. See full list of permissions.

ExpiresAt

Date RFC3339

Date at which the token expires

Example Request:
cURL
1
curl --request PUT \
2
  --url https://api.mailjet.com/v1/rest/tokens/1 \
3
  --header 'Authorization: Bearer 612d5125131d406081abb9cd2afdc4e3' \
4
  --header 'Content-Type: application/json' \
5
    --data '{
6
  "Permissions": [
7
        "read_template_marketing",
8
        "create_template_marketing",
9
        "update_template_marketing"
10
    ],
11
  "Name": "marketing team"
12
}'
`
Status code: 200

Response Data Field Structure
Name

Type

Description

ID

integer

The ID of the token.

Name

string

Required. A unique identifier for the token.

Permissions

array of strings

List of permissions assigned to the token. See full list of permissions.

ExpiresAt

Date RFC3339

Date at which the token expires.

CreatedAt

Date RFC3339

Date on which the token was created.

UpdatedAt

Date RFC3339

Date on which the token was last updated.

Example Response:
API response:

1
{
2
    "Count": 1,
3
    "Total": 1,
4
    "Data": [
5
        {
6
            "ID": 32,
7
            "UserID": 6,
8
            "OrganisationID": 10,
9
            "AccessToken": null,
10
            "Name": "marketing team",
11
            "Permissions": [
12
                "read_template_marketing",
13
                "create_template_marketing",
14
                "update_template_marketing"
15
            ],
16
            "CreatedAt": "2024-04-19T08:57:00.195202Z",
17
            "UpdatedAt": "2024-04-19T10:16:20.290549Z"
18
        }
19
    ]
20
}



Frequently Asked Questions
How do I give someone access to the Content API?
The Content API supports two types of authentication:

Basic Authentication
Bearer Token
Basic Authentication requires a Mailjet API Key and Secret Key which can be found on your API Key Management page in Mailjet.

Once authenticated, you can create a Bearer token with a POST to https://api.mailjet.com/v1/REST/tokens. You can assign permissions to the token. Consult the full list of permissions.

How do I create a template?
Creating a template is a two-step process.

Use the Template Creation endpoint POST https://api.mailjet.com/v1/REST/templates to specify the name, description, and purpose of your template.
Be sure to retrieve the ID of your template. This is the equivalent of creating an envelope for your template content.

Once your template has been created, use the Template Content endpoint POST https://api.mailjet.com/v1/REST/templates/:id/contents to add content to your template by specifying the ID of your template. Content includes body text, images, links and more.
How do I revert to a previous version of my template?
If you would like to revert your template content to a previous version, here are the necessary steps:

Ensure you have the ID of the template you want to revert. *You can retrieve the template ID using this endpoint: GET https://api.mailjet.com/v1/REST/templates

Retrieve the versions of the template content:
Use the following endpoint to get a list of all versions of the template content: GET http://api.mailjet.com/v1/REST/templates/:id/contents.
Replace :id with your template ID.

Review the retrieved versions and identify the one to which you would like to revert.

Copy the Headersas well as HTMLPart, MJMLPart and/or TextPart of the desired version and use the following endpoint to update the template: PUT http://api.mailjet.com/v1/REST/templates/:id/contents/types/:content_type.
Replace :id with your template ID and :content_type with the appropriate content type.
Accepted content types are: D (Draft) P (Published)

Note: A template with a content type of D (Draft) cannot be sent until its content is published using the following endpoint: POST https://api.mailjet.com/v1/REST/templates/:id/contents/publish.

How do I send an email with a template that I created using the Content API?
You've created your template using the Content API. Now you'd like to send it using Mailjet's Send API. To do this, you must:

Ensure your template is published
If you created an HTML template via API or created a template using the Mailjet drag-and-drop editor: the template must be published either through the UI or via the API.
Use this endpoint to publish via API: POST https://api.mailjet.com/v1/REST/templates/:id/contents/publish.
If you created an MJML template via API (Edit Mode 4): the template must be published in the Mailjet UI.

Retrieve Your Template's External ID
The ExternalID can be obtained with the following endpoint: GET https://api.mailjet.com/v1/REST/templates.
Once your template is publshed and you have its ExternalID, you can proceed to the Send API to send your email.

How do I add an image using the Content API?
Uploading images for use in the Mailjet image gallery is a two-part process:

Upload the image content and meta data using this endpoint: POST https://api.mailjet.com/v1/data/images
Upload a thumbnail for the image using this endpoint: PUT https://api.mailjet.com/v1/data/images/:id/:content_type
When you upload a thumbnail, you will need to specify the image ID and specify a content type of thumbnail. If you do not upload a thumbnail, the image will appear in the Mailjet image gallery with a generic placeholder.



SMTP Relay Overview
With the Mailjet SMTP Relay you can send emails in an easy way, requiring minimum integration effort on your side.

The SMTP Relay is useful if you have an existing solution for transactional emailing by SMTP or if you cannot use the Send API. Using the SMTP relay, you have to take care of email headers, MIME type handling and completely format and personalize your message content.

The best and fastest way to use the SMTP Relay is to have your own local mail server relaying messages to the Mailjet SMTP. Your local mail server will give you reliable management of the messages and connections between our 2 systems. In case of breakage in the connection, your mail server will properly handle the error and retry sending your messages.

In case you don't have a local mail server, you can still use the SMTP Relay by using one of the many SMTP libraries available or configuring your exiting system (frameworks, CMS, CRM...). However, some of these libraries or systems can lack the advanced error handling necessary to queue and resend the messages in case of an error. The use of Send API can be a better choice as it requires less interactions between our systems and limits the risk of failures. The error handling is also a lot simpler with the API as we are managing the delivery and queuing of your messages for you.

Using Mailjet's SMTP servers to send your transactional emails is very simple. All you have to do is update your SMTP server settings to use our server as a "relay" or "smarthost" with the credentials provided by Mailjet. The credentials are your $MJAPIKEYPUBLIC as a login and $MJAPIKEYPRIVATE as a password.

You can find your SMTP credentials in your Account Setup page.


Standard configuration
To route your emails through Mailjet’s SMTP server you will only have to modify your SMTP settings using our hostname, port and your SMTP credentials.

SMTP hostname
Mailjet’s host name is in-v3.mailjet.com.

SMTP ports
Here’s the list of ports that Mailjet is supporting:

Port

TLS

SSL

25

Optional

No

80

Optional

No

465

No

Yes

587/588

Optional

No

2525

Optional

No

Read our blogpost for details on the supported SMTP ports.

SMTP credentials
Access your Mailjet account and go to the SMTP section to find your SMTP credentials.

Postfix installation
You can configure your Postfix to send via in.mailjet.com relay, depending on the sender, by following these steps:

In this example, all outgoing emails are sent directly to Mail eXchangers (MX), except when From is *@example.com or example@example.net, which are going through Mailjet.

Caution: for Postfix, a sender is not the From: but the sender envelope passed to sendmail (in the 5th mail() argument: -fexample@example.com or in PHP config php.ini : sendmail_path = /path/to/sendmail -t -i -fexample@example.com).

In /etc/postfix/main.cf (remove relayhost).

1
smtp_sender_dependent_authentication = yes
2
sender_dependent_relayhost_maps = hash:/etc/postfix/sender_relay
3
smtp_sasl_auth_enable = yes
4
smtp_sasl_security_options = noanonymous
5
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
In /etc/postfix/sender_relay, list addresses that must go through a relay.

1
@example.com in.mailjet.com
2
example@example.net in.mailjet.com
In /etc/postfix/saslpasswd, provide credentials for each address listed in `/etc/postfix/senderrelay`.

1
@example.com apikey:secretkey
2
example@example.net apikey2:secretkey2
Don't forget the following commands.

1
cd /etc/postfix
2
chmod 600 sasl_passwd
3
chown root:root sasl_passwd
4
postmap sasl_passwd sender_relay
5
postfix reload
Other configurations
Desktop email clients (Outlook, Apple Mail, Thunderbird)
MTA & MDA (exim)
Frameworks and Languages (Php, Java, Asp.net, Zend, CodeIgniter)
Webmail (Gmail and Google Apps)

Overview
When using SMTP relay, you can use the following custom headers to specify how Mailjet will handle your message.

X-Mailjet-Campaign
This header value must be unique for all emails belonging to a specific campaign. This will regroup emails into only one line in your dashboard, and provide cool reports ! It can be an alphanumeric value of your choice (space, dash and underscore are also accepted), up to 255 characters long on one line.

X-Mailjet-DeduplicateCampaign
In combination with X-Mailjet-Campaign, this boolean (true, yes, y, 1) indicates that you do not wish to send a message inside the campaign twice to the same recipient. In this case, we check that the recipient hasn’t been sent the message, or otherwise block any duplicate (only the first message goes through). Please note that this is based on recipient email address, it will not block a message sent to the same person on two different email addresses.

X-MJ-CustomID
This custom value will help you track your message more easily.

X-MJ-EventPayload
If you need more than an ID, no problem: insert a payload to your messages, using any format (XML, JSON, CSV…)

X-Mailjet-TrackOpen
This header indicates whether or not you want to activate the open tracking on the concerned message. This option will override your tracking options set on your user account.

0: disable the tracking
1: enable the tracking
X-Mailjet-TrackClick
This header indicates whether or not you want to activate or not the click tracking on the concerned message. This option will override your tracking options set on your user account.

0: disable the tracking
1: enable the tracking
X-Mailjet-Prio
The header manages the different types of email by defining up to four priority levels. More information

X-MJ-TemplateLanguage
This header is related to the processing of the template language. It activates the template language processing. By default the template language processing is deactivated. Use 1 to activate.

More information on transactional templating

X-MJ-TemplateID
This header allows you to pass the ID of the template stored on the Mailjet system.

More information on transactional templating

X-MJ-Vars
This header allows you to pass a JSON encoded array of variables that can be used with the templating language.

Example: {"varname1": "value1","varname2": "value2", "varname3": "value3"}

X-MJ-TemplateErrorReporting
This header is related to the processing of the template language. It defines the email address, to which a carbon copy with the error message is sent.

More information on transactional templating

X-MJ-TemplateErrorDeliver
This header is related to the processing of the template language. It defines if the message is delivered when an error is discovered in the templating language. By default the delivery is deactivated. Use deliver to let the message be delivered to the recipient, 0 to stop it.

More information on transactional templating


