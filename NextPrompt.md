Paystack Documentation
Welcome to the Paystack Developer Documentation where you’ll learn how to build amazing payment experiences with the Paystack API.

Quick start
Accept Payments
Collect payments from cards, bank and mobile money accounts

Send Money
Make instant transfers to bank accounts and mobile money numbers

Identify your Customers
Verify phone numbers, bank accounts or card details

Other ways to use Paystack
Explore libraries and tools for accepting payments without the API

Accept a payment
Here’s how to use the Paystack API to accept a payment

Before you begin
Authenticate all Paystack API calls using your secret keys

Next
post
api.paystack.co/transaction/initialize
cURL
curl https://api.paystack.co/transaction/initialize 
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-X POST

Make a transfer
Here’s how quickly you can send money on Paystack

Before you begin
Authenticate all Paystack API calls using your secret keys

Next
post
api.paystack.co/transferrecipient
cURL
curl https://api.paystack.co/transferrecipient 
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-X POST

Explore demos
We’ve put together simple projects to demonstrate how to use the Paystack API for various financial services. Explore all demos or start with the most popular ones below:

Gift Store
PaystackOSS/sample-gift-store
APIS USED
Accept Payments
Verify Payments
Vue
Movie Ticket
PaystackOSS/sample-movie-ticket
APIS USED
Accept Payments
Verify Payments
Android
Invoice Payments
PaystackOSS/sample-logistics
APIS USED
Create Customer
Payment Request
Vue
Push Payment Requests
PaystackOSS/sample-restaurant
APIS USED
Payment Request
Terminal Event
React
Join Payslack
Ask questions and discuss ideas with 2000+ developers on Slack
Paystack CLI
Learn how to use our CLI to improve your integration experience
Need something else?
If you have any questions or need general help, visit our support page

Payments
Learn how to receive fast and secure payments with Paystack.

Getting started
Accept Payments
Customers can pay you using any of our supported payment methods.

Recurring Charges
Charge customers on a recurring basis with subscriptions or authorizations.

Split Payments
Automatically split your transaction payouts into multiple accounts.

Libraries and Plugins
Integrate to Paystack with plugins and libraries of your preferred language.

Explore demos
We’ve put together simple projects to demonstrate how the Paystack API works for various financial services. Explore all demos or start with the most popular ones below.

Gift Store
PaystackOSS/sample-gift-store
APIS USED
Accept Payments
Verify Payments
Vue
Movie Ticket
PaystackOSS/sample-movie-ticket
APIS USED
Accept Payments
Verify Payments
Android
On this Page
Getting started
Explore demos
Join Payslack
Ask questions and discuss ideas with 2000+ developers on Slack
Paystack CLI
Learn how to use our CLI to improve your integration experience
Need something else?
If you have any questions or need general help, visit our support page

Accept Payments
In a nutshell
To accept a payment, create a transaction using our API, our client Javascript library, Popup JS, or our SDKs. Every transaction includes a link that can be used to complete payment.

Popup
Paystack Popup is a Javascript library that allow developers to build a secure and convenient payment flow for their web applications. You can add it to your frontend application via CDN, NPM or Yarn:

CDNNPMYarn
<script src="https://js.paystack.co/v2/inline.js">
If you used NPM or Yarn, ensure you import the library as shown below:

import PaystackPop from '@paystack/inline-js'
With the library successfully installed, you can now begin the three-step integration process:

Initialize transaction
Complete transaction
Verify transaction status
Initialize transaction
To get started, you need to initialize the transaction from your backend. Initializing the transaction from the backend ensures you have full control of the transaction details. To do this, make a POST request from your backend to the Initialize TransactionAPI endpoint:


cURL
Show Response

curl https://api.paystack.co/transaction/initialize
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "email": "customer@email.com", 
      "amount": "500000"
    }'
-X POST
The data object of the response contains an access_code parameter that is needed to complete the transaction. You should store this parameter and send it to your frontend.

Do not use your secret key in your frontend
Never call the Paystack API directly from your frontend to avoid exposing your secret key on the frontend. All requests to the Paystack API should be initiated from your server, and your frontend gets the response from your server.

Complete transaction
Your frontend application should make a request to your backend to initialize the transaction and get the access_code as described in the previous section. On getting the access_code from your backend, you can then use Popup to complete the transaction:

const popup = new PaystackPop()
popup.resumeTransaction(access_code)
The resumeTransaction method triggers the checkout in the browser, allowing the user to choose their preferred payment channel to complete the transaction. You can check out the InlineJS reference guide to learn about the features available in Popup V2.

Verify transaction status
Finally, you need to confirm the status of the transaction by using either webhooks or the verify transactions endpoint. Regardless of the method used, you need to use the following parameter to confirm if you should deliver value to your customer or not:

Parameter	Description
data.status	This inidicates if the payment is successful or not
data.amount	This indicates the price of your product or service in the lower denomination of your currency.
Verify amount
When verifying the status of a transaction, you should also verify the amount to ensure it matches the value of the service you are delivering. If the amount doesn't match, do not deliver value to the customer.

Redirect
Here, you call the Initialize TransactionAPI from your server to generate a checkout link, then redirect your users to the link so they can pay. After payment is made, the users are returned to your website at the callback_url

Warning
Confirm that your server can conclude a TLSv1.2 connection to Paystack's servers. Most up-to-date software have this capability. Contact your service provider for guidance if you have any SSL errors.

Collect customer information
To initialize the transaction, you'll need to pass information such as email, first name, last name amount, transaction reference, etc. Email and amount are required. You can also pass any other additional information in the metadata object field.

The customer information can be retrieved from your database, session or cookie if you already have it stored, or from a form like in the example below.

HTML
<form action="/save-order-and-pay" method="POST"> 
  <input type="hidden" name="user_email" value="<?php echo $email; ?>"> 
  <input type="hidden" name="amount" value="<?php echo $amount; ?>"> 
  <input type="hidden" name="cartid" value="<?php echo $cartid; ?>"> 
  <button type="submit" name="pay_now" id="pay-now" title="Pay now">Pay now</button>
</form>
Initialize transaction
When a customer clicks the payment action button, initialize a transaction by making a POST request to our API. Pass the email, amount and any other parameters to the Initialize TransactionAPI endpoint.

If the API call is successful, we will return an authorization URL which you will redirect to for the customer to input their payment information to complete the transaction.

Important notes

The amount should be in the subunit of the supported currency.
We used the cart_id from the form above as our transaction reference. You should use a unique transaction identifier from your system as your reference.
We set the callback_url in the transaction_data array. If you don't do this, we'll use the one that is set on your dashboard. Setting it in the code allows you to be flexible with the redirect URL if you need to
If you don't set a callback URL on the dashboard or on the code, the users will not be redirected back to your site after payment.
You can set test callback URLs for test transactions and live callback URLs for live transactions.
PHP
<?php
  $url = "https://api.paystack.co/transaction/initialize";

  $fields = [
    'email' => "customer@email.com",
    'amount' => "20000",
    'callback_url' => "https://hello.pstk.xyz/callback",
    'metadata' => ["cancel_action" => "https://your-cancel-url.com"]
  ];

  $fields_string = http_build_query($fields);

  //open connection
  $ch = curl_init();
  
  //set the url, number of POST vars, POST data
  curl_setopt($ch,CURLOPT_URL, $url);
  curl_setopt($ch,CURLOPT_POST, true);
  curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: Bearer SECRET_KEY",
    "Cache-Control: no-cache",
  ));
  
  //So that curl_exec returns the contents of the cURL; rather than echoing it
  curl_setopt($ch,CURLOPT_RETURNTRANSFER, true); 
  
  //execute post
  $result = curl_exec($ch);
  echo $result;
?>
Verify Transaction
If the transaction is successful, Paystack will redirect the user back to a callback_url you set. We'll append the transaction reference in the URL. In the example above, the user will be redirected to http://your_website.com/postpayment_callback.php?reference=YOUR_REFERENCE.

So you retrieve the reference from the URL parameter and use that to call the verify endpoint to confirm the status of the transaction. Learn more about verifying transactions.

It's very important that you call the Verify endpoint to confirm the status of the transactions before delivering value. Just because the callback_url was visited doesn't prove that transaction was successful.

Handle Webhook
When a payment is successful, Paystack sends a charge.success webhook event to webhook URL that you provide. Learn more about using webhooks.

Mobile SDKs
With our mobile SDKs, we provide a collection of methods and interfaces tailored to the aesthetic of the platform. Transactions are initiated on the server and completed in the SDK. The SDK requires an access_code to display the UI component that accepts payment.

To get the access_code, you need to initialize a transaction by making a POST request on your server to the Initialize TransactionAPI endpoint:


cURL
Show Response

curl https://api.paystack.co/transaction/initialize
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "email": "customer@email.com", 
      "amount": "500000"
    }'
-X POST
On a successful initialization of the transaction, you get a response that contains an access_code. You need to return this access_code back to your mobile app.

Secret key safeguarding
Do not make an API request to the Initialize Transaction endpoint directly on your mobile app because it requires your secret key. Your secret key should only be used on your server where stronger security measures can be put in place.

With the access_code in place, you can now use the SDKs to complete the transaction.

Android SDK
You need to install the SDK by adding the paystack-ui dependency to the dependencies block of your app-level build.gradle file:

Latest dependency version
You should check Maven Central to get the latest version before installation.

build.gradle
dependencies {
  implementation 'com.paystack.android:paystack-ui:0.0.9'
}
With all the requirements for accepting payment now in place, you can initialize and use the SDK as shown below:

KotlinJava
// other imports

import com.paystack.android.core.Paystack
import com.paystack.android.ui.paymentsheet.PaymentSheet
import com.paystack.android.ui.paymentsheet.PaymentSheetResult

class MainActivity : AppCompatActivity() {
    private lateinit var paymentSheet: PaymentSheet

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Other code snippets

        Paystack.builder()
            .setPublicKey("pk_test_xxxx")
            .build()
        paymentSheet = PaymentSheet(this, ::paymentComplete)

    }

    private fun makePayment() {
        // Pass access_code from transaction initialize call
        paymentSheet.launch("br6cgmvflhn3qtd")
    }


    private fun paymentComplete(paymentSheetResult: PaymentSheetResult) {
        val message = when (paymentSheetResult) {
            PaymentSheetResult.Cancelled -> "Cancelled"
            is PaymentSheetResult.Failed -> {
                Log.e("Something went wrong", paymentSheetResult.error.message.orEmpty(), paymentSheetResult.error)
                paymentSheetResult.error.message ?: "Failed"
            }

            is PaymentSheetResult.Completed -> {
                // Returns the transaction reference  PaymentCompletionDetails(reference={TransactionRef})
                Log.d("Payment successful", paymentSheetResult.paymentCompletionDetails.toString())
                "Successful"
            }
        }
    }
}
You can check out the Android SDK reference to learn more about the methods and interfaces available for integration.

iOS SDK
The installation of the SDK can be done via the Swift Package Manager. To add the required packages, ensure you have the latest version of XCode installed and follow these steps:

Select File > Add Package Dependencies…
Copy the repo URL and paste it in the search box of the package dependency popup
You can read the Swift Package Manager documentation to learn more about adding packages to your project.

With all the requirements for accepting payment now in place, you can initialize and use the SDK:

SwiftUIUIKit
import SwiftUI
import PaystackCore
import PaystackUI

struct PaymentView: View {
	let paystack = try? PaystackBuilder
			.newInstance
			.setKey("pk_domain_xxxxxxxx")
			.build()

	var body: some View {
		VStack(spacing: 8) {
			Text("Make Payemnt")

			paystack?.chargeUIButton(accessCode: "0peioxfhpn", onComplete: paymentDone) {
				Text("Initiate Payment")
			}
		}
		.padding()
	}

	func paymentDone(_ result: TransactionResult) {
		// Handle transaction result
		print(result)
	}
}

// ....
You can check out the iOS SDK reference to learn more about the methods and interfaces available for integration.

Charge API
The Create ChargeAPI endpoint allows you to pass details of any payment channel directly to Paystack, along with the transaction details (email, amount, etc). We provide a couple of payment channels that you can harness based on your use case.

Use cases
The Charge API exposes the core components powering our checkout. Developers can use these component to develop solutions that will cater to their customers specific needs. Some of these needs include:

Serving non-smartphone users. Some of your users might be using mobile phones that can't access the internet. With the charge API, you can initiate a payment request form your server and send a prompt for payment completion via phone numbers to these users.
Harnessing mobile OS APIs for a better user experience. Some businesses offer their products via mobile apps (Android and iOS). Mobile operating systems provide a rich set of APIs that developers can take advantage of. One of such APIs allow developers to autofill an OTP in a form. There are also APIs for dialing codes. Developers can combine the charge API with the mobile OS APIs to provide a richer experience to their users.
Here is a sample payload to the Charge API containing transaction details and an object for a payment instrument - in this case Mobile money:

JSON
{
  "amount": 1000,
  "email": "customer@email.com",
  "currency": "GHS",
  "mobile_money": {
    "phone": "0553241149",
    "provider": "MTN"
  }
}
Handling Charge API responses
When you call the Create ChargeAPI endpoint, the response contains a data.status which tells you what the next step in the process. Depending on the value in the data.status, you may need to prompt the user for an input as indicated in the response message (like OTP or pin or date of birth), or display an action that the user needs to complete on their device - like scanning a QR code or dialling a USSD code or redirecting to a 3DSecure page. So you follow the prompt on the data.status until there is no more user input required, then you listen for events via webhooks.

For the steps that prompt for user input, you will be required to display a form to the user to collect the requested input and send it to the relevant endpoint as shown in the table below. For the steps that require the user to complete an action on their device, we recommend that you display a button for the user to confirm the payment after they have performed that action so that you can listen for events via webhooks.

Below is the list of responses you can receive from the Create ChargeAPI endpoint and what you should do next:

Value	Description
pending	Transaction is being processed. Call Check pending charge at least 10seconds after getting this status to check status
timeout	Transaction has failed. You may start a new charge after showing data.message to user
success	Transaction is successful. You can now provide value
send_birthday	Customer's birthday is needed to complete the transaction. Show data.display_text to user with an input that accepts the birthdate and submit to the Submit BirthdayAPI endpoint with reference and birthday
send_otp	Paystack needs OTP from customer to complete the transaction. Show data.display_text to user with an input that accepts OTP and submit the OTP to the Submit OTPAPI endpoint with reference and otp
failed	Transaction failed. No remedy for this, start a new charge after showing data.message to user
Handle Webhook
When a payment is successful, Paystack sends a charge.success webhook event to webhook URL that you provide. It is highly recommended that you use webhooks to confirm the payment status before delivering value to your customers.

Webhooks
In a nutshell
Webhooks allow you to set up a notification system that can be used to receive updates on certain requests made to the Paystack API.

Introduction
Generally, when you make a request to an API endpoint, you expect to get a near-immediate response. However, some requests may take a long time to process, which can lead to timeout errors. In order to prevent a timeout error, a pending response is returned. Since your records need to be updated with the final state of the request, you need to either:

Make a request for an update (popularly known as polling) or,
Listen to events by using a webhook URL.
Helpful Tip
We recommend that you use webhook to provide value to your customers over using callbacks or polling. With callbacks, we don't have control over what happens on the customer's end. Neither do you. Callbacks can fail if the network connection on a customer's device fails or is weak or if the device goes off after a transaction.

Polling vs Webhooks
Image showing a comparison between polling and webhooks
Polling requires making a GET request at regular intervals to get the final status of a request. For example, when a customer makes a payment for a transaction, you keep making a request for the transaction status until you get a successful transaction status.

With webhooks, the resource server, Paystack in this case, sends updates to your server when the status of your request changes. The change in status of a request is known as an event. You’ll typically listen to these events on a POST endpoint called your webhook URL.

The table below highlights some differences between polling and webhooks:

Polling	Webhooks
Mode of update	Manual	Automatic
Rate limiting	Yes	No
Impacted by scaling	Yes	No
Create a webhook URL
A webhook URL is simply a POST endpoint that a resource server sends updates to. The URL needs to parse a JSON request and return a 200 OK:

NodePHP
// Using Express
app.post("/my/webhook/url", function(req, res) {
    // Retrieve the request's body
    const event = req.body;
    // Do something with event
    res.send(200);
});
When your webhook URL receives an event, it needs to parse and acknowledge the event. Acknowledging an event means returning a 200 OK in the HTTP header. Without a 200 OK in the response header, events are sent for the next 72 hours:

In live mode, webhook events are sent every 3 minutes for the first 4 tries, then retried hourly for the next 72 hours
In test mode, webhook events are sent hourly for 10 hours, with a request timeout of 30 seconds.
Avoid long-running tasks
If you have extra tasks in your webhook function, you should return a 200 OK response immediately. Long-running tasks lead to a request timeout and an automatic error response from your server. Without a 200 OK response, the retry as described in the proceeding paragraph.

Verify event origin
Since your webhook URL is publicly available, you need to verify that events originate from Paystack and not a bad actor. There are two ways to ensure events to your webhook URL are from Paystack:

Signature validation
IP whitelisting
Signature validation
Events sent from Paystack carry the x-paystack-signature header. The value of this header is a HMAC SHA512 signature of the event payload signed using your secret key. Verifying the header signature should be done before processing the event:


Node
const crypto = require('crypto');
const secret = process.env.SECRET_KEY;
// Using Express
app.post("/my/webhook/url", function(req, res) {
    //validate event
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
    // Retrieve the request's body
    const event = req.body;
    // Do something with event  
    }
    res.send(200);
});
IP whitelisting
With this method, you only allow certain IP addresses to access your webhook URL while blocking out others. Paystack will only send webhooks from the following IP addresses:

52.31.139.75
52.49.173.169
52.214.14.220
You should whitelist these IP addresses and consider requests from other IP addresses a counterfeit.

Whitelisting is domain independent
The IP addresses listed above are applicable to both test and live environments. You can whitelist them in your staging and production environments.

Go live checklist
Now that you’ve successfully created your webhook URL, here are some ways to ensure you get a delightful experience:

Add the webhook URL on your Paystack dashboard
Ensure your webhook URL is publicly available (localhost URLs cannot receive events)
If using .htaccess remember to add the trailing / to the URL
Test your webhook to ensure you’re getting the JSON body and returning a 200 OK HTTP response
If your webhook function has long-running tasks, you should first acknowledge receiving the webhook by returning a 200 OK before proceeding with the long-running tasks
If we don’t get a 200 OK HTTP response from your webhooks, we flagged it as a failed attempt
In the live mode, failed attempts are retried every 3 minutes for the first 4 tries, then retried hourly for the next 72 hours
In the test mode, failed attempts are retried hourly for the next 10 hours. The timeout for each attempt is 30 seconds.
Supported events
Customer Identification FailedCustomer Identification SuccessfulDispute CreatedDispute ReminderDispute ResolvedDVA Assignment FailedDVA Assignment SuccessfulInvoice CreatedInvoice FailedInvoice UpdatedPayment Request PendingPayment Request SuccessfulRefund FailedRefund PendingRefund ProcessedRefund ProcessingSubscription CreatedSubscription DisabledSubscription Not RenewingSubscriptions with Expiring CardsTransaction SuccessfulTransfer SuccessfulTransfer FailedTransfer Reversed
{
  "event": "customeridentification.failed",
  "data": {
    "customer_id": 82796315,
    "customer_code": "CUS_XXXXXXXXXXXXXXX",
    "email": "email@email.com",
    "identification": {
      "country": "NG",
      "type": "bank_account",
      "bvn": "123*****456",
      "account_number": "012****345",
      "bank_code": "999991"
    },
    "reason": "Account number or BVN is incorrect"
  }
}
Types of events
Here are the events we currently raise. We would add more to this list as we hook into more actions in the future.

Event	Description
charge.dispute.create	A dispute was logged against your business
charge.dispute.remind	A logged dispute has not been resolved
charge.dispute.resolve	A dispute has been resolved
charge.success	A successful charge was made
customeridentification.failed	A customer ID validation has failed
customeridentification.success	A customer ID validation was successful
dedicatedaccount.assign.failed	This is sent when a DVA couldn't be created and assigned to a customer
dedicatedaccount.assign.success	This is sent when a DVA has been successfully created and assigned to a customer
invoice.create	An invoice has been created for a subscription on your account. This usually happens 3 days before the subscription is due or whenever we send the customer their first pending invoice notification
invoice.payment_failed	A payment for an invoice failed
invoice.update	An invoice has been updated. This usually means we were able to charge the customer successfully. You should inspect the invoice object returned and take necessary action
paymentrequest.pending	A payment request has been sent to a customer
paymentrequest.success	A payment request has been paid for
refund.failed	Refund cannot be processed. Your account will be credited with refund amount
refund.pending	Refund initiated, waiting for response from the processor.
refund.processed	Refund has successfully been processed by the processor.
refund.processing	Refund has been received by the processor.
subscription.create	A subscription has been created
subscription.disable	A subscription on your account has been disabled
subscription.expiring_cards	Contains information on all subscriptions with cards that are expiring that month. Sent at the beginning of the month, to merchants using Subscriptions
subscription.not_renew	A subscription on your account's status has changed to non-renewing. This means the subscription will not be charged on the next payment date
transfer.failed	A transfer you attempted has failed
transfer.success	A successful transfer has been completed
transfer.reversed	A transfer you attempted has been reversed

Verify Payments
In a nutshell
The Verify Transaction API allows you confirm the status of a customer's transaction.

Transaction statuses
Webhooks are the preferred option for confirming a transaction status, but we currently send webhook events for just successful transactions. However, a transaction can have the following statuses:

Status	Meaning
abandoned	The customer has not completed the transaction.
failed	The transaction failed. For more information on why, refer to the message/gateway response.
ongoing	The customer is currently trying to carry out an action to complete the transaction. This can get returned when we're waiting on the customer to enter an otp or to make a transfer (for a pay with transfer transaction).
pending	The transaction is currently in progress.
processing	Same as pending, but for direct debit transactions.
queued	The transaction has been queued to be processed later. Only possible on bulk charge transactions.
reversed	The transaction was reversed. This could mean the transaction was refunded, or a chargeback was successfully logged for this transaction.
success	The transaction was successfully processed.
Verify a transaction
You do this by making a GET request to the Verify TransactionAPI endpoint from your server using your transaction reference. This is dependent on the method you used to initialize the transaction.

From Popup or Mobile SDKs
You'll have to send the reference to your server, then from your server you call the verify endpoint.

From the Redirect API
You initiate this request from your callback URL. The transaction reference is returned as a query parameter to your callback URL.

Helpful Tip
If you offer digital value like airtime, wallet top-up, digital credit, etc, always confirm that you have not already delivered value for that transaction to avoid double fulfillments, especially, if you also use webhooks.

Here's a code sample for verifying transactions:


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/transaction/verify/:reference
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X GET
Warning
The API response has a status key response.status indicating the status of the API call. This is not the status of the transaction. The status of the transaction is in the data object in the verify API response, i.e response.data.status. Learn more about Paystack API format.

Charge returning Users
The verify response also returns information about the payment instrument that the user paid with in the data.authorization object. If the channel is card, then you can store the authorization_code for that card against that user, and use that charge the user for subsequent transaction. Learn more about recurring charges.

On this Page
Transaction statuses
Verify a transaction
Charge returning Users
Join Payslack
Ask questions and discuss ideas with 2000+ developers on Slack
Paystack CLI
Learn how to use our CLI to improve your integration experience
Need something else?
If you have any questions or need general help, visit our support page

Payment Channels
In a nutshell
Paystack enables you accept payments from customers using different payment channels such as: cards, mobile money accounts, QR codes, directly from their bank account or USSD.

If you use the the Popup or Redirect method, the paying customer will be shown all the payment methods selected on your dashboard. But if you don't want to use either option, you can initiate all the different payment channels directly from your server using the Charge API.

What channels are available?
Card payment channels are available on all Paystack accounts, while the other payment channels are only available in countries where they are supported.

Cards
Cards are one of the common payment channels in a lot of countries. We support the following cards across our markets:

Card	Markets
Visa	All
Mastercard	All
Verve	Nigeria
Amex	Nigeria, South Africa and Kenya
Feature Availability
The Card API is available in all our markets for businesses that are PCI Compliant. If you intend to use this API, you should check the compliance requirements outlined below and reach out to us.

The Cards API allows you to send card details securely and compliantly to our server from your custom checkout. With this, PCI-DSS complaint businesses can build bespoke checkout experiences without compromising on security.

The sensitivity of card details requires businesses to adhere to the Payment Card Industry Data Security Standards (PCI-DSS), to ensure that they are securely processed. Paystack adheres to this as a PCI Level 1 Service Provider, allowing non-complaint businesses to use our Checkout and Mobile SDKs for card payments

Compliance Requirements
PCI-DSS certification documents can only be issued on behalf of the PCI Council by an accredited Qualified Security Assessor (QSA) after an audit.

The documents issued by the council are the Attestation of Compliance (AOC) and Report on Compliance. These documents are only valid for one year from the dated they were signed. We require you to submit these documents before you’re allowed to use this API.

For Paystack, a valid AOC needs to show the following:

Issued after an audit by a QSA
Signed off by a QSA
Within one year of issue date
Has the PCI SSC logo on the cover page
Adheres to at least version 3.2.1 of PCI-DSS
If you have met the criteria above please submit your documents to support@paystack.com or through your Paystack relationship manager and we'll grant access to the APIs.

Bank accounts
Feature availability
This feature is currently available to businesses in Nigeria.

The Pay with Bank feature allows customers pay through internet banking portal or by providing their bank account number and authenticating using an OTP sent to their phone or email.

This is different from Bank Transfers where customers transfer money into a bank account.

Collect bank details
To collect bank details, you would need to prompt the user to select their bank and enter their account number. To fetch the list of supported banks, make a GET request to the list banksAPI endpoint, with the additional filter pay_with_bank=true.

The banks can be listed in a dropdown or any other format that allows the user to easily pick their bank of choice.

Create a charge
Send email, amount, metadata, bank (an object that includes the code of the bank and account_number supplied by customer) and birthday to our Charge endpoint to start.


cURL
Show Response

curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "email": "customer@email.com", 
      "amount": "10000", 
      "bank": {
        "code": "057", 
        "account_number": "0000000000" 
      }
    }'
-X POST
If the selected bank is Kuda, you need to make use of phone and token instead of account_number in the bank object:


cURL
Show Response

curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "email": "customer@email.com", 
      "amount": "10000", 
      "bank": {
        "code": "50211", 
        "phone": "+2348100000000",
        "token": "123456"
      }
    }'
-X POST

When the API call is made, the value of the data.status key is pending as the payment is being processed in the background. The data.status then updates to either, success or failed depending on whether the transaction was successful or not.

Pay with Transfer
Feature availability
This feature is currently available to businesses in Nigeria and merchants need to reach out to support@paystack.com to enable it on their integration.

Pay with Transfer (PwT) is a feature that allow merchants or businesses create temporary bank accounts that customers can use to pay for goods or services. The account number is generated and tied to the current customer’s transaction. The account number becomes invalid after the customer’s transaction or when it exceeds it’s expiry time.

Create a PwT charge
At the point of payment, you initiate a request to the Create ChargeAPI endpoint, passing the email, amount and bank_transfer object. The bank_transfer object takes the account_expires_at which is used to set the expiry of an account number for a transaction:


cURL
Show Response

#!/bin/sh

url="https://api.paystack.co/charge"
authorization="Authorization: Bearer YOUR_SECRET_KEY"
content_type="Content-Type: application/json"
data='{ 
  "email": "another@one.com", 
  "amount": "10000", 
  "bank_transfer": {
    "account_expires_at": "2025-04-24T16:40:57.954Z"
  } 
}'

curl "$url" -H "$authorization" -H "$content_type" -d "$data" -X POST
Bank Transfer Param	Type	Description
account_expires_at	String	Account validity period in ISO 8601 format (YYYY-MM-DDThh:mm:ssZ). Minimum time is 15 mins from the current time and maximum time is 8 hours from the current time. You can also set this to null so we automatically set it to 8 hours from the current time.
Account expiry
If the difference between account_expires_at and the current time is less than 15 mins we will default to a 15 mins. If the difference between account_expires_at and the current time exceeds 8 hours we will default to 8 hours.

If you need to control the transfers your business receives you should implement Inbound Transfer Approvals . This enables you to reject or accept transfers based on your various business requirements.

Verifying transfer
Receiving notifications
To receive notifications, you need to implement a webhook URL and set the webhook URL on your Paystack Dashboard

A bank transfer is initiated by a customer and processed by their bank. In order to confirm payment, you need to implement webhooks and listen to the following events:

Event	Description
charge.success	This is sent when the customer’s transfer is successful.
bank.transfer.rejected	This is sent when the customer either sent an incorrect amount or when the customer has been flagged by our fraud system.
Charge SuccessfulTransfer Rejected
{
  "event": "charge.success",
  "data": {
    "id": 3104021987,
    "domain": "test",
    "status": "success",
    "reference": "zuz8ggd1ro",
    "amount": 25000,
    "message": null,
    "gateway_response": "Approved",
    "paid_at": "2023-09-12T13:29:09.000Z",
    "created_at": "2023-09-12T13:27:50.000Z",
    "channel": "bank_transfer",
    "currency": "NGN",
    "ip_address": "172.91.42.100",
    "metadata": "",
    "fees_breakdown": null,
    "log": null,
    "fees": 375,
    "fees_split": null,
    "authorization": {
      "authorization_code": "AUTH_q5nfynycgm",
      "bin": "008XXX",
      "last4": "X553",
      "exp_month": "09",
      "exp_year": "2023",
      "channel": "bank_transfer",
      "card_type": "transfer",
      "bank": null,
      "country_code": "NG",
      "brand": "Managed Account",
      "reusable": false,
      "signature": null,
      "account_name": null,
      "sender_country": "NG",
      "sender_bank": null,
      "sender_bank_account_number": "XXXXXXX553",
      "sender_name": "Jadesola Oluwashina",
      "narration": "Channel Tests"
    },
    "customer": {
      "id": 138496675,
      "first_name": null,
      "last_name": null,
      "email": "another@one.com",
      "customer_code": "CUS_1eq06yu8efl8u63",
      "phone": null,
      "metadata": null,
      "risk_action": "default",
      "international_format_phone": null
    },
    "plan": {},
    "subaccount": {},
    "split": {},
    "order_id": null,
    "paidAt": "2023-09-12T13:29:09.000Z",
    "requested_amount": 25000,
    "pos_transaction_data": null,
    "source": {
      "type": "api",
      "source": "merchant_api",
      "entry_point": "charge",
      "identifier": null
    }
  }
}
Alternatively, you can use the Check Pending ChargeAPI endpoint to manually verify the status of the transaction.

USSD
This Payment method is specifically for Nigerian customers. Nigerian Banks provide USSD services that customers use to perform transactions, and we've integrated with some of them to enable customers complete payments.

The Pay via USSD channel allows your Nigerian customers to pay you by dialling a USSD code on their mobile device. This code is usually in the form of * followed by some code and ending with #. The user is prompted to authenticate the transaction with a PIN and then it is confirmed.

All you need to initiate a USSD charge is the customer email and the amount to charge.

When the user pays, a response will be sent to your webhook. Hence, for this to work properly as expected, webhooks must be set up on your Paystack Dashboard.

Create a charge
Send an email and amount to the chargeAPI endpoint. Specify the USSD type you are charging as well.

Below are all the USSD types we support. We'll add to list as we have more:

Bank	Type
Guaranty Trust Bank	737
United Bank of Africa	919
Sterling Bank	822
Zenith Bank	966

cURL
Show Response

curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "email": "some@body.nice", 
      "amount":"10000",
      "ussd": {
        "type": "737"
      },
      "metadata": {
        "custom_fields":[{
          "value": "makurdi",
          "display_name": "Donation for",
          "variable_name": "donation_for"
        }]
      }
    }'
-X POST
When a charge is made, the default response provides a USSD code for the customer to dial to complete the payment.

Handle response
When the user completes payment, a response is sent to the merchant’s webhook. Hence, for this to work properly as expected, webhooks must be set up for the merchant..

The charge.success event is raised on successful payment. The sample response to be sent to the user’s webhook would look like:

JSON
{
  "event": "charge.success",
  "data": {
    "id": 53561,
    "domain": "live",
    "status": "success",
    "reference": "2ofkbk0yie6dvzb",
    "amount": 150000,
    "message": "madePayment",
    "gateway_response": "Payment successful",
    "paid_at": "2018-06-25T12:42:58.000Z",
    "created_at": "2018-06-25T12:38:59.000Z",
    "channel": "ussd",
    "currency": "NGN",
    "ip_address": "54.246.237.22, 162.158.38.185, 172.31.15.210",
    "metadata": "",
    "log": null,
    "fees": null,
    "fees_split": null,
    "authorization": {
      "authorization_code": "AUTH_4c6mhnmmeusp4yd",
      "bin": "XXXXXX",
      "last4": "XXXX",
      "exp_month": "05",
      "exp_year": "2018",
      "channel": "ussd",
      "card_type": "offline",
      "bank": "Guaranty Trust Bank",
      "country_code": "NG",
      "brand": "offline",
      "reusable": false,
      "signature": null,
      "account_name": null
    },
    "customer": {
      "id": 16200,
      "first_name": "John",
      "last_name": "Doe",
      "email": "customer@email.com",
      "customer_code": "CUS_bpy9ciomcstg55y",
      "phone": "",
      "metadata": null,
      "risk_action": "default"
    },
    "plan": {},
    "subaccount": {},
    "paidAt": "2018-06-25T12:42:58.000Z"
  }
}
USSD recurring charge
Charging returning customers directly is not currently available. Simply call the endpoint to start a new transaction.

Mobile money
Feature Availability
This feature is only available to businesses in Ghana and Kenya.

The Mobile Money channel allows your customers to pay you by using their phone number enabled for mobile money. At the point of payment, the customer is required to authorize the payment on the mobile phones.

Since payment is completed offline, you need to have a webhook URL  which we’ll use to send the final status of the payment to your server.

Create a charge
To initiate a charge for mobile money, you need to make a POST request to the chargeAPI passing the customer’s email, amount, and mobile_money object:


cURL
curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "amount": 100,
      "email": "customer@email.com",
      "currency": "GHS",
      "mobile_money": {
        "phone" : "0551234987",
        "provider" : "mtn"
      }
    }'
-X POST
Sample code for other providers
This sample code above shows how to charge any MoMo providers. You simply change the currency and replace the mtn in the mobile_money object with any other provider code shown in the table below.

Provider code
Here are the character codes for the supported mobile money providers:

Provider	Code	Country
MTN	mtn	Ghana and CIV
ATMoney & Airtel Money	atl	Ghana and Kenya
Vodafone	vod	Ghana
M-PESA	mpesa	Kenya
Orange	orange	CIV
Wave	wave	CIV
All providers, except Vodafone, rely on the customer completing the transaction offline. The data.status field will be pay_offline, and the customer will be prompted to authorise the transaction on their phones. You should show the customer the data.display_text and then listen for the charge.success webhook event. The transaction should be completed within 180 seconds, after which the transactions fail. This is a limitation set by the network providers.

Here is a sample response that requires the customer to complete the process offline:

JSON
{
  "status": true,
  "message": "Charge attempted",
  "data": {
    "reference": "8nn5fqljd0suybr",
    "status": "pay_offline",
    "display_text": "Please complete authorization process on your mobile phone"
  }
}
Transaction Verification
You should call the Verify TransactionAPI endpoint after the 180 seconds to get the status and reason of the transaction failure. This is found in the data.message parameter in the response.

Vodafone
For Vodafone, the customer is required to generate a voucher code by dialing the USSD code show in the data.display_text field, this voucher code should be collected and passed to the submit OTPAPI endpoint to authorize the transaction.

JSON
{
  "status": true,
  "message": "Charge attempted",
  "data": {
    "reference": "r13havfcdt7btcm",
    "status": "send_otp",
    "display_text": "Please dial *110# to generate a voucher code. Then input the voucher"
  }
}
If the mobile money customer enters the otp on time and we are able to get a response just in time, we return the success response:

JSON
{
  "message": "Charge attempted",
  "status": true,
  "data": {
    "amount": 100,
    "channel": "mobile_money",
    "created_at": "2018-11-17T14:39:56.000Z",
    "currency": "GHS",
    "domain": "live",
    "fees": 153,
    "gateway_response": "Approved",
    "id": 59333,
    "ip_address": "35.177.189.123, 162.158.155.220",
    "message": "madePayment",
    "paid_at": "2018-11-17T14:40:18.000Z",
    "reference": "l7lvu4y3xcka6zu",
    "status": "success",
    "transaction_date": "2018-11-17T14:39:56.000Z",
    "authorization": {
      "authorization_code": "AUTH_33lz7ev5tq",
      "bank": "MTN Mobile Money",
      "bin": "055XXX",
      "brand": "Mtn mobile money",
      "channel": "mobile_money",
      "country_code": "GH",
      "exp_month": 12,
      "exp_year": 9999,
      "last4": "X149",
      "reusable": false,
      "account_name": null
    },
    "customer": {
      "customer_code": "CUS_s3aa4mx0yyvrqye",
      "email": "customer@email.com",
      "id": 16763,
      "risk_action": "default"
    }
  }
}
If the transaction is started successfully and the pin is not entered on time, we return this:

JSON
{
  "status": true,
  "message": "Charge attempted",
  "data": {
    "reference": "84oow6t0rf715g6",
    "status": "pending"
  }
}
M-PESA
Feature Availability
M-PESA allows Kenya-based businesses to charge individual customers and M-PESA Till numbers.

With M-PESA merchants can charge individual users by sending an STK push to the number provided. We recommend that you include the country code in the phone number. For example, 0722000000 should be sent as +254722000000 to the chargeAPI endpoint. The customer will be prompted to enter their PIN to complete the transaction.

JSON
{
  "status": true,
  "message": "Charge attempted",
  "data": {
    "reference": "8nn5fqljd0suybr",
    "status": "pay_offline",
    "display_text": "Please complete authorization process on your mobile phone"
  }
}
M-PESA Offline
The offline option allows businesses to create a chargeAPI that will be completed later. This is useful for businesses that offer payment after service completion, for example: restaurants, e-commerce stores, delivery & logistics services. The customer will pay to Paystack's Paybill and the generated account_reference will identify the transaction. Another benefit to businesses is the transaction can’t be completed with the wrong amount. It’ll fail and the customer will have to start again.


cURL
Show Response

curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "amount": 100,
      "email": "customer@email.com",
      "currency": "KES",
      "mobile_money": {
        "phone": "254700000000",
        "provider" : "mpesa_offline"
      }
    }'
-X POST
The acount_number is the Paybill number while the account_reference uniquely identifies the transaction. In case you need to change the amount, you should create a new charge and share the new details with the customer. Wrong amounts will lead to transaction failure.

M-PESA Till
You can also get paid by other businesses from their M-PESA Till numbers. The mobile_money object should have provider set to mptill and the account which is the other business's M-PESA Till number. They will receive a prompt on the phone assigned the till for authorization.


cURL
curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "amount": 100,
      "email": "customer@email.com",
      "currency": "KES",
      "mobile_money": {
        "account" : "1234567",
        "provider" : "mptill"
      }
    }'
-X POST
Both M-PESA Till and individual require the customer to authorise the transaction on their phones. As such you should show them the display_text value when building a custom experience.

JSON
{
  "status": true,
  "message": "Charge attempted",
  "data": {
    "reference": "jq3psd5n96sprwl",
    "status": "pay_offline",
    "display_text": "Please complete authorization process on your mobile phone"
  }
}
Transaction Verification
Since M-PESA transactions happen asynchronously, failures due to customer errors aren’t captured easily. We recommend you implement Verify Transactions when they take too long to get completed.

Handle response
When the user completes payment, a response is sent to the merchant’s webhook. Hence, for this to work properly as expected, webhooks must be set up for the merchant.

The charge.success event is raised on successful payment. The sample response to be sent to the user’s webhook would look like:

JSON
{
  "event": "charge.success",
  "data": {
    "id": 59214,
    "domain": "live",
    "status": "success",
    "reference": "gf4n3ykzj6a7u89",
    "amount": 100,
    "message": "madePayment",
    "gateway_response": "Approved",
    "paid_at": "2018-11-15T06:10:54.000Z",
    "created_at": "2018-11-15T06:10:32.000Z",
    "channel": "mobile_money",
    "currency": "GHS",
    "ip_address": "18.130.236.148, 141.101.99.73",
    "metadata": "",
    "log": null,
    "fees": 153,
    "fees_split": null,
    "authorization": {
      "authorization_code": "AUTH_0aqm8ddx6s",
      "bin": "055XXX",
      "last4": "X149",
      "exp_month": "12",
      "exp_year": "9999",
      "channel": "mobile_money",
      "card_type": "",
      "bank": "MTN Mobile Money",
      "country_code": "GH",
      "brand": "Mtn mobile money",
      "reusable": false,
      "signature": null,
      "account_name": "BoJack Horseman"
    },
    "customer": {
      "id": 16678,
      "first_name": "Babafemi",
      "last_name": "Aluko",
      "email": "customer@email.com",
      "customer_code": "CUS_2jk1i8ezoam49br",
      "phone": "",
      "metadata": null,
      "risk_action": "allow"
    },
    "plan": {},
    "subaccount": {},
    "subaccount_group": {},
    "paidAt": "2018-11-15T06:10:54.000Z"
  }
}
Charging returning customers directly is not currently available. Simply call the endpoint to start a new transaction. We have some test credentials that can be used to run some tests.

EFT
EFT payments are an instant bank transfer payment method where customers pay merchants through their internet banking interfaces. When the developer specifies an EFT provider, we do a redirect to the providers platform where the customer provides their payment details after which the payment is authorized.

Where is this available?
This feature is only available to South African customers.

Create a charge
You need to send the email, amount, currency, and the EFT provider to the chargeAPI endpoint:


cURL
Show Response

curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{
      "amount": 5000,
      "currency": "ZAR",
      "email": "customer@email.com",
      "eft": {
        "provider": "ozow"
      }
}'
-X POST
Available Providers
Ozow is currently the only provider available.

Handle response
When the user completes payment, a response is sent to the merchant’s webhook. The merchant needs to setup webhooks to get the status of the payment. The charge.success event is raised on successful payment.

QR code
The QR option generates a QR code that allow customers to use a supported mobile app to complete payments.

When the customer scans the code, they authenticate on a supported app to complete the payment. When the user pays, a response will be sent to your webhook. This means that you need to implement and set a webhook URL on your Paystack Dashboard.

Create a charge
Send an email and amount to the chargeAPI endpoint along with a qr object. The qr object should contain a provider parameter, specifying the QR provider for the transaction. The available QR providers are:

Provider	Availability
scan-to-pay	South Africa
visa	Nigeria
Supported Apps
The scan-to-pay provider supports both SnapScan and Scan to Pay (formerly Masterpass) supported apps for completing a payment.


cURL
Show Response

curl https://api.paystack.co/charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "amount": 100,
      "email": "customer@email.com",
      "currency": "NGN",
      "qr": {
        "provider" : "visa"
      }
    }'
-X POST
Handle response
When the user completes payment, a response is sent to the merchant’s webhook. Hence, for this to work properly as expected, webhooks must be set up for the merchant.

The charge.success event is raised on successful payment. The sample response to be sent to the user’s webhook would look like:

JSON
{
  "event": "charge.success",
  "data": {
    "id": 59565,
    "domain": "test",
    "status": "success",
    "reference": "48rx32f1womvcr4",
    "amount": 10000,
    "message": "madePayment",
    "gateway_response": "Payment successful",
    "paid_at": "2018-12-05T15:58:45.000Z",
    "created_at": "2018-12-05T15:58:02.000Z",
    "channel": "qr",
    "currency": "NGN",
    "ip_address": "18.130.45.28, 141.101.107.157",
    "metadata": "",
    "log": null,
    "fees": null,
    "fees_split": null,
    "authorization": {
      "authorization_code": "AUTH_2b4zs69fgy7qflh",
      "bin": "483953",
      "last4": "6208",
      "exp_month": "12",
      "exp_year": "2018",
      "channel": "qr",
      "card_type": "DEBIT",
      "bank": "Visa QR",
      "country_code": "NG",
      "brand": "VISA",
      "reusable": false,
      "signature": null,
      "account_name": "BoJack Horseman"
    },
    "customer": {
      "id": 16787,
      "first_name": "I",
      "last_name": "SURRENDER",
      "email": "customer@email.com",
      "customer_code": "CUS_ehg851zbxon0bvx",
      "phone": "",
      "metadata": null,
      "risk_action": "default"
    },
    "plan": {},
    "subaccount": {},
    "subaccount_group": {},
    "paidAt": "2018-12-05T15:58:45.000Z"
  }
}
QR code recurring charge
Charging returning customers directly is currently not available. You need to call the endpoint to start a new transaction.

Supported Apps
In order to complete a payment, your customers can scan or enter the code in a supported application. Here are the supported applications by providers:

Visa
Customers can scan Visa QR codes from the following banking apps:

Ecobank
First Bank
Fidelity Bank
Access Bank
Access (Diamond) Bank
Zenith Bank
SnapScan
Customers can complete a payment in a snap by scanning the QR code with their SnapScan iOS or Android app.

Scan to Pay
Customers can use Scan to Pay (formerly Masterpass) QR codes from any of the mobile apps listed below:

Banking Apps	Wallets	Standalone Scan to Pay
Standard Bank	Ukheshe	Nedbank Scan to Pay
FNB Banking	Spot (by Virgin Money)	Standard Bank Scan to Pay
Nedbank Money	Vodapay	Absa Scan to Pay
Capitec Bank	Telkom Pay	
Absa	Instapay	
RMB	Nedbank Avo

Direct Debit
In a nutshell
A business can initiate a debit authorization request on a customer’s account. Once the customer gives consent, their account can be debited by that business on a recurring basis.

Direct debit is a payment channel that allows a business to debit a customer’s bank account once the customer has given consent. Before a customer’s account can be debited, they need to give consent to the business they’re liaising with. The business can create a mandate seeking the permission of their customer to debit their account.

There are two ways to set up a mandate authorization:

Initialize a transaction
Initiate an authorization request
Feature availability
This feature is available to businesses in Nigeria only.

Initialize transaction
The fastest way to set up an authorization for a customer is to pass the bank channel with a custom filter to the Initialize TransactionAPI endpoint:


cURL
Show Response

curl https://api.paystack.co/transaction/initialize
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "email": "customer@email.com", 
      "amount": "10000", 
      "channels": ["bank"],
      "metadata": {
        "custom_filters": {
          "recurring": true
        }
      }
    }'
-X POST
During the process of completing the transaction, the customer’s consent is gotten giving us the permission to create a mandate that can be used for subsequent payments. A mandate is only created if the customer’s account is among the supported banks for Direct Debit. You can follow the steps in the verify authorization status to get the authorization status.

Initiate an authorization request
Alternatively, you can issue a mandate to a customer to debit their account by using the Initialize AuthorizationAPI endpoint:


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/customer/authorization/initialize
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ 
        "email": "ravi@demo.com",
        "channel": "direct_debit",
        "callback_url": "http://test.url.com"
    }'
-X POST
The response contains a redirect_url that you would redirect the customer to give consent to your request. If you provided a callback_url in your request, the customer will be sent to that page after giving consent.

For a better UI experience, you can pre-fill some of the customer’s information by adding the account and address objects in your request:

curl https://api.paystack.co/customer/authorization/initialize
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{
      "channel": "direct_debit",
      "email": "ravi@demo.com",
      "callback_url": "http://test.url.com",
      "account": {
        "number": "0128034955",
        "bank_code": "058"
      },
      "address": {
        "state": "Lagos",
        "city": "Akoka",
        "street": "17 Beckley Avenue"
      }
    }'
-X POST
While both the account and address objects are optional, when used, all params in both objects are compulsory. The bank_code in the account object represent the customer’s bank.

Supported banks
We currently support the banks listed below. We're actively working with our partners to support more banks and we'll keep you updated on new additions.

Bank	Bank code
Access Bank	044
Citibank Nigeria	023
Ecobank Nigeria	050
Fidelity Bank	070
First Bank of Nigeria	011
First City Monument Bank	214
Globus Bank	00103
Guaranty Trust Bank	058
Heritage Bank	030
Jaiz Bank	301
Keystone Bank	082
Polaris Bank	076
PremiumTrust Bank	105
Providus Bank	101
Stanbic IBTC Bank	221
Standard Chartered Bank	068
Sterling Bank	232
Suntrust Bank	100
Titan Bank	102
Union Bank of Nigeria	032
United Bank For Africa	033
Unity Bank	215
Wema Bank	035
Zenith Bank	057
We do a verification on the bank code before creating the authorization. If the bank code provided isn’t on the list of supported banks, we will return a Bank not supported for direct debit error.

Verify authorization status
We send the following webhook events to your webhook URL to communicate the status of the customer's authorization:

Event	Description
direct_debit.authorization.created	This is sent when the customer approves your authorization request. This doesn't mean that the customer's account is ready to be charged.
direct_debit.authorization.active	This is sent when the customer's authorization is active and their account can be charged.
Authorization CreatedAuthorization Active
{
  "event": "direct_debit.authorization.created",
  "status": true,
  "message": "Authorization retrieved successfully",
  "data": {
    "authorization_code": "AUTH_JV4T9Wawdj",
    "active": false,
    "last4": "1234",
    "channel": "direct_debit",
    "card_type": "mandate",
    "bank": "Guaranty Trust Bank",
    "exp_month": 1,
    "exp_year": 2034,
    "country_code": "NG",
    "brand": "Guaranty Trust Bank",
    "reusable": true,
    "signature": "SIG_u8SqR3E6ty2koQ9i5IrI",
    "account_name": "Ravi Demo",
    "customer": {
      "first_name": "Ravi",
      "last_name": "Demo",
      "code": "CUS_g0a2pm2ilthhh62",
      "email": "ravi@demo.com",
      "phone": "",
      "metadata": null,
      "risk_action": "default"
    }
  }
}
Alternatively, you can confirm the status of an authorization by making a request to the Verify AuthorizationAPI with the reference from the initialization request.

Authorization activation
Mandate activation is dependent on the customer’s bank and can take up to 24 hours (sometimes longer). If a mandate remains pending beyond that, you can try triggering an activation charge again, or reach out to support@paystack.com.


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/customer/authorization/verify/:reference
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X GET
If the authorization hasn't been approved or you try verifying before it’s creation, you’ll get a 404 error with the response show below:

JSON
{
  "status": false,
  "message": "Authorization does not exist or does not belong to integration",
  "metadata": {
    "nextStep": "Try again later"
  },
  "type": "api_error",
  "code": "unknown"
}
Rate limiting
When calling the Verify Authorization endpoint, you are subjected to our rate limiting rules.

Retrying a pending authorization
There could be instances when an authorization is stuck in a pending status. In such cases you can trigger an activation charge for the customer:


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/customer/{id}/directdebit-activation-charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ 
        "authorization_id" : 1069309917
    }'
-X PUT
For multiple customers, you can use the Direct Debit Activation ChargeAPI endpoint as shown below:


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/directdebit/activation-charge
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ 
        "customer_ids": [28958104, 983697220]
    }'
-X PUT
Customer's account validation
This request will cause a debit of NGN 50 on the customer’s account for us to confirm if the customer’s account can be debited. However, this is refunded once we complete the check.

Charge account
Once a customer approves an authorization, we provide an authorization_code that you can use to debit their account on a recurring basis. You can debit the customer’s account by passing the authorization_code with the matching email to the charge authorizationAPI endpoint.


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/transaction/charge_authorization
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ 
      "authorization_code" : "AUTH_JV4T9Wawdj", 
      "email": "ravi@demo.com", 
      "amount": "10000",
      "currency": "NGN"
    }'
-X POST
By default, we return a status of processing while we conclude charging the customer account. You’d need the data.reference parameter to verify the status of the charge.

You can also use the authorization for subscriptions via the Create SubscriptionAPI endpoint. In cases where the customer has other authorizations, ensure you send the authorization_code that’s returned above, otherwise Paystack picks the most recent authorization. Checkout our Subscription docs to learn more.

Verify charge
To verify the status of a charge, you need to listen to the charge.success event on your webhook URL:

JSON
{
  "event": "charge.success",
  "data": {
    "id": 1504238596,
    "domain": "live",
    "status": "success",
    "reference": "nl3eljdd6qgbrho",
    "amount": 10000,
    "message": "madePayment",
    "gateway_response": "Payment successful",
    "paid_at": "2023-10-24T12:32:30.000Z",
    "created_at": "2023-10-24T12:32:24.000Z",
    "channel": "direct_debit",
    "currency": "NGN",
    "ip_address": null,
    "metadata": "",
    "fees_breakdown": null,
    "log": null,
    "fees": 0,
    "fees_split": null,
    "authorization": {
      "authorization_code": "AUTH_JV4T9Wawdj",
      "bin": null,
      "last4": null,
      "exp_month": null,
      "exp_year": null,
      "channel": "direct_debit",
      "card_type": null,
      "bank": "Guaranty Trust Bank",
      "country_code": "NG",
      "brand": null,
      "reusable": true,
      "signature": null,
      "account_name": null
    },
    "customer": {
      "id": 180061682,
      "first_name": "Ravi",
      "last_name": "Demo",
      "email": "ravi@demo.com",
      "customer_code": "CUS_24lze1c8i2zl76y",
      "phone": "",
      "metadata": null,
      "risk_action": "default",
      "international_format_phone": null
    },
    "plan": {},
    "subaccount": {},
    "split": {},
    "order_id": null,
    "paidAt": "2023-10-24T12:32:30.000Z",
    "requested_amount": 10000,
    "pos_transaction_data": null,
    "source": {
      "type": "api",
      "source": "merchant_api",
      "entry_point": "charge",
      "identifier": null
    }
  }
}
Alternatively, you can make a request to the Verify TransactionAPI endpoint using the reference from the response of your charge request.


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/transaction/verify/:reference
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X GET
Deactivate Authorization
You might need to deactivate an authorization either after the completion of a transaction or based on a requst from your customer. To do this, make a POST request to the Deactivate AuthorizationAPI:


cURL
Show Response

#!/bin/sh
curl https://api.paystack.co/customer/authorization/deactivate
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ 
      "authorization_code": "AUTH_xxxIjkZVj5"
    }'
-X POST

Subscriptions
In a nutshell
The Subscriptions API lets developers embed recurring billing functionality in their applications, without having to manage the billing cycle themselves. Merchants can easily create plans and charge customers automatically, on a recurring basis. We support Card and Direct Debit (Nigeria) only.

Here is how to set up a subscription:

Create a plan
Create a subscription
Listen for subscription events
Create a plan
Plans are the foundational building block for subscriptions. A plan represents what you're selling, how much you're selling it for, and how often you're charging for it.

You can create a plan via the Paystack Dashboard, or by calling the create planAPI endpoint, passing:

Param	Type	Description
name	string	The name of the plan
interval	string	The interval at which to charge subscriptions on this plan. Available options are hourly, daily, weekly, monthly, quarterly, biannually (every 6 months) and annually
amount	integer	The amount to charge

cURL
Show Response

curl https://api.paystack.co/plan
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "name": "Monthly Retainer", 
      "interval": "monthly", 
      "amount": 500000
    }'
-X POST
Monthly Subscription Billing
Billing for subscriptions with a monthly interval depends on the day of the month the subscription was created. If the subscription was created on or before the 28th of the month, it gets billed on the same day, every month, for the duration of the plan. Subscriptions created on or between the 29th - 31st, will get billed on the 28th of every subsequent month, for the duration of the plan

You can also pass invoice_limit, which lets you set how many times a customer can be charged on this plan. So if you set invoice_limit: 5 on a monthly plan, then the customer will be charged every month, for 5 months. If you don't pass invoice_limit, we'll continue to charge the customer until the plan is cancelled.

Create a subscription
Now that we have a plan, we can move on to the next step: subscribing a customer to that plan. There are a couple of ways we can go about creating a new subscription.

Adding Plan code to a transaction
Using the create subscriptionAPI endpoint
Adding plan code to a transaction
You can create a subscription for a customer using the initialize transactionAPI endpoint, by adding the plan_code of a plan you've created to the body of your request. This will override the transaction amount passed, and charge the customer the amount of the plan instead.

Once the customer pays, they'll automatically be subscribed to the plan, and will be billed according to the interval (and invoice limit) set on the plan.


cURL
Show Response

curl https://api.paystack.co/transaction/initialize
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "email": "customer@email.com", 
      "amount": "500000", 
      "plan": "PLN_xxxxxxxxxx" 
    }'
-X POST
Using the create subscription endpoint
You can also create a subscription by calling the create subscriptionAPI endpoint, passing a customer and plan. The customer must have already done a transaction on your Paystack integration. This is because the Subscriptions API uses card and direct debit authorizations to charge customers, so there needs to be an existing authorization to charge.

Note
If a customer has multiple authorizations, you can select which one to use for the subscription, by passing the authorization_code as authorization when creating the subscription. Otherwise, Paystack picks the most recent authorization to charge.


cURL
Show Response

curl https://api.paystack.co/subscription
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "customer": "CUS_xxxxxxxxxx", "plan": "PLN_xxxxxxxxxx" }'
-X POST
You can also pass a start_date parameter, which lets you set the date for the first debit. This makes this method useful for situations where you'd like to give a customer a free period before you start charging them, or when you want to switch a customer to a different plan.

Subscriptions are not retried
If a subscription charge fails, we do not retry it. Subscriptions are ideal for situations where value is delivered after payment. e.g. Payment for internet service or a streaming service.

Listen for subscription events
Creating a subscription will result in Paystack sending the following events:

A subscription.create event is sent to indicate that a subscription was created for the customer who was charged.
If you created the subscription by adding a plan code to a transaction, a charge.success event is also sent to indicate that the transaction was successful.
The following steps will happen for each subsequent billing cycle:

An invoice.create event will be sent to indicate a charge attempt will be made on the subscription. This will be sent 3 days before the next payment date.
On the next payment date, a charge.success event will be sent, if the charge attempt was successful. If not, an invoice.payment_failed event will be sent instead.
An invoice.update event will be sent after the charge attempt. This will contain the final status of the invoice for this subscription payment, as well as information on the charge if it was successful
Cancelling a subscription will also trigger events:

A subscription.not_renew event will be sent to indicate that the subscription will not renew on the next payment date.
On the next payment date, a subscription.disable event will be sent to indicate that the subscription has been cancelled.
On completion of all billing cycles for a subscription, a final subscription.disable event will be sent, with status set to complete.

Invoice CreatedInvoice FailedInvoice UpdatedSubscription CreatedSubscription DisabledSubscription Not RenewingTransaction Successful
{
  "event": "invoice.create",
  "data": {
    "domain": "test",
    "invoice_code": "INV_thy2vkmirn2urwv",
    "amount": 50000,
    "period_start": "2018-12-20T15:00:00.000Z",
    "period_end": "2018-12-19T23:59:59.000Z",
    "status": "success",
    "paid": true,
    "paid_at": "2018-12-20T15:00:06.000Z",
    "description": null,
    "authorization": {
      "authorization_code": "AUTH_9246d0h9kl",
      "bin": "408408",
      "last4": "4081",
      "exp_month": "12",
      "exp_year": "2020",
      "channel": "card",
      "card_type": "visa DEBIT",
      "bank": "Test Bank",
      "country_code": "NG",
      "brand": "visa",
      "reusable": true,
      "signature": "SIG_iCw3p0rsG7LUiQwlsR3t",
      "account_name": "BoJack Horseman"
    },
    "subscription": {
      "status": "active",
      "subscription_code": "SUB_fq7dbe8tju0i1v8",
      "email_token": "3a1h7bcu8zxhm8k",
      "amount": 50000,
      "cron_expression": "0 * * * *",
      "next_payment_date": "2018-12-20T00:00:00.000Z",
      "open_invoice": null
    },
    "customer": {
      "id": 46,
      "first_name": "Asample",
      "last_name": "Personpaying",
      "email": "asam@ple.com",
      "customer_code": "CUS_00w4ath3e2ukno4",
      "phone": "",
      "metadata": null,
      "risk_action": "default"
    },
    "transaction": {
      "reference": "9cfbae6e-bbf3-5b41-8aef-d72c1a17650g",
      "status": "success",
      "amount": 50000,
      "currency": "NGN"
    },
    "created_at": "2018-12-20T15:00:02.000Z"
  }
}
Managing subscriptions
So you've set up your plans, and you've started subscribing customers to them. In this section, we'll talk about how to manage those subscriptions, to make sure you don't miss payments, and your customers don't lose service.

Understanding subscription statuses
Subscription statuses are key to managing your subscriptions. Each status contains information about a subscription, that lets you know if you need to take action or not, to keep that customer. There are currently 5 possible statuses a subscription can have.

Status	Description
active	The subscription is currently active, and will be charged on the next payment date.
non-renewing	The subscription is currently active, but we won't be charging it on the next payment date. This occurs when a subscription is about to be complete, or has been cancelled (but we haven't reached the next payment date yet).
attention	The subscription is still active, but there was an issue while trying to charge the customer's card. The issue can be an expired card, insufficient funds, etc. We'll attempt charging the card again on the next payment date.
completed	The subscription is complete, and will no longer be charged.
cancelled	The subscription has been cancelled, and we'll no longer attempt to charge the card on the subscription.
Handling subscription payment issues
As mentioned in the previous section, if a subscription's status is attention, then it means that there was a problem with trying to charge the customer's card, and we were unable to successfully debit them.

To fix the issue, you can take a look at the most_recent_invoice object returned in the body of the fetch subscriptionAPI response. This object contains information about the most recent attempt to charge the card on the subscription. If the subscription's status is attention, then the most_recent_invoice object will have a status field set to failed, and a description field, with more information about what went wrong when attempting to charge the card.

{  

  "data": {  

    "most_recent_invoice": {
      "subscription": 326005,
      "integration": 530700,
      "domain": "test",
      "invoice_code": "INV_fjtns483x9c2fyw",
      "customer": 92740135,
      "transaction": 1430031421,
      "amount": 50000,
      "period_start": "2021-11-10T13:00:00.000Z",
      "period_end": "2021-11-10T13:59:59.000Z",
      "status": "attention",
      "paid": 1,
      "retries": 1,
      "authorization": 242063633,
      "paid_at": "2021-11-10T13:00:09.000Z",
      "next_notification": "2021-11-07T13:59:59.000Z",
      "notification_flag": null,
      "description": "Insufficient Funds",
      "id": 3953926,
      "created_at": "2021-11-10T13:00:05.000Z",
      "updated_at": "2021-11-10T13:00:10.000Z"
      }

  }  
}
At the beginning of each month, we'll also send a subscription.expiring_cards webhook, which contains information about all subscriptions with cards that expire that month. You can use this to proactively reach out to your customers, and have them update the card on their subscription.

{
  "event":"subscription.expiring_cards",
  "data":[
    {
      "expiry_date":"12/2021",
      "description":"visa ending with 4081",
      "brand":"visa",
      "subscription":{
        "id":94729,
        "subscription_code":"SUB_lejj927x2kxciw1",
        "amount":44000,
        "next_payment_date":"2021-11-11T00:00:01.000Z",
        "plan":{
          "interval":"monthly",
          "id":22637,
          "name":"Premium Service (Monthly)",
          "plan_code":"PLN_pfmwz75o021slex"
        }
      },
      "customer":{
        "id":7808239,
        "first_name":"Bojack",
        "last_name":"Horseman",
        "email":"bojackhoresman@gmail.com",
        "customer_code":"CUS_8v6g420rc16spqw"
      }
    }
  ]
}
Updating subscriptions
To make changes to a subscription, you’ll use the Update PlanAPI endpoint. You should consider whether you want to change existing subscriptions or keep them as they are. For example, if you’re updating the price, or the charge intervals. You’ll use the update_existing_subscriptions parameter to control this:

When set to true : All subscriptions will be updated, and the changes will apply on the next billing cycle.
When set to false: Current subscriptions will stay the same, and only new ones will follow the updates.
If you omit this parameter, the updates will automatically apply to all subscriptions.

Updating the card on a subscription
When a customer's subscription has a card or bank with a payment issue, you can generate a link to a hosted subscription management page, where they can update their authorization. On the page, your customer will have the option to either add a new card, a direct debit account, or cancel their subscription. If they choose to add a new card, Paystack will charge the card a small amount to tokenize it. Don't worry, the charge is immediately refunded.


cURL
Show Response

curl https://api.paystack.co/subscription/:code/manage/link
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X GET
If you already have a page where your subscribers can manage their subscriptions, you can choose to have a button or link on that page that will generate the link and redirect the customer to the subscription management page.

Alternatively, you can trigger an email from Paystack to the customer, with the link included.


cURL
Show Response

curl https://api.paystack.co/subscription/:code/manage/email
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X POST

Test Payments
You can use the following test details to test different payment channels.

Cards
Card expiry date
The expiry date for each card can be any date in the future.

Successful Cards
No validation(reusable)
4084 0840 8408 4081
Expiry
09/26
CVV
408
PIN validation
5078 5078 5078 5078 12
Expiry
09/26
CVV
081
Pin
1111
PIN + OTP validation
5060 6666 6666 6666 666
Expiry
09/26
CVV
123
Pin
1234
OTP
123456
PIN + Phone + OTP validation
5078 5078 5078 5078 04
Expiry
09/26
CVV
884
Pin
0000
OTP
123456
Bank Auth Simulation(reusable)
4084 0800 0000 0409
Expiry
09/26
CVV
000
Failed Cards
Declined
4084 0800 0000 5408
Expiry
09/26
CVV
001
Token Not Generated
5078 5078 5078 5078 53
Expiry
09/26
CVV
082
Pin
0000
API Errors
Insufficent funds
4084 0800 0067 0037
Expiry
09/26
CVV
787
Bank Accounts
Nigerian merchants
Nigerian merchants can use a regular bank account to create a transfer recipient when testing in test mode.

Zenith Bank(transaction)
000 000 000 0
Birthday
2006-09-06
OTP
123456
Zenith Bank(transfer)
000 000 000 0
Code
057
Kuda Bank
+234 810 000 000 0
Code
50211
Token
123456
Mobile Money
No PIN/OTP
055 123 498 7
Network
MTN
No PIN/OTP
+254 710 000 000
Network
M-Pesa
CIV - Orange
070 000 000 0
Network
Orange
OTP
1234
Dedicated Virtual Account
You can make use of the sample bank application we created to initiate a transfer to your test virtual account. If you simply want to try out the dedicated virtual account product, kindly make use of the test account below:

Demo Bank
123 000 164 4
Pin
0000

Metadata
Add custom data to your request payload

Crafting Metadata
With metadata, you can add additional parameters that an endpoint doesn't accept naturally. Crafting metadata will depend on your language's handling of JSON. Common metadata are:

Invoice ID
Cart ID
Cart Items
Payment medium (site/app)
There are two ways to add parameters to the metadata object:

Key/value pair: You pass the parameter as a key and value pair like this: cart_id: IU929. Parameters passed this way don't show up on the dashboard, however, they are returned with the API response.
Custom Fields: The custom_fields key is reserved for an array of custom fields that should show on the dashboard when you click the transaction.
Custom fields have 3 keys: display_name, variable_name, and value. The display name will be the label for the value when displaying.

JSON
{
  "metadata": {
    "cart_id": 398,
    "custom_fields": [
      {
        "display_name": "Invoice ID",
        "variable_name": "Invoice ID",
        "value": 209
      },
      {
        "display_name": "Cart Items",
        "variable_name": "cart_items",
        "value": "3 bananas, 12 mangoes"
      }
    ]
  }
}
Cancel Action
You can redirect your users to a chosen URL when they cancel a payment. This is done by setting a cancel_action in your metadata:

"metadata": {
  "cancel_action": "https://your-cancel-url.com"
}
Custom Filters
Custom filters allow you control how a transaction is completed by using the custom_filters object in the metadata object.

Recurring Payment
If you need to debit your customer in future, specify recurring=true in the custom_filters object.

"metadata": {
  "custom_filters": {
    "recurring": true
  }
}
This is supported for the Card and Pay with Bank (PwB) channels with a different behaviour for each channel.

Card
With the card channel, we accept only Verve cards that support recurring billing and force a bank authentication for MasterCard and VISA.

Pay with Bank
With the pwb channel, we'll only make the supported banks available for customers to make payment. Banks that don't support recurring payments are filtered out.

Selected Bank Cards
You can use the banks parameter to specify a the bank codes when you only want particular bank cards to be accepted for a transaction. You can use the List BanksAPI to get the list of supported bank codes.

"metadata": {
  "custom_filters": {
    "banks": ["057", "100"]
  }
}
Selected Card Brands
If you only want certain card brand(s) to be accepted for a transaction, specify the brands in the card_brands array:

"metadata": {
  "custom_filters": {
    "card_brands": ["visa"]
  }
}
We currently support the following card brands:

Brand	Code	Country
Verve	verve	Nigeria
Visa	visa	All regions
Mastercard	mastercard	All regions
The filters can also be combined for a comprehensive rule. In the snippet below, the filters tell us that the customer should be enrolled on recurring billing and we should only accept a visa card from Zenith (057) or Suntrust bank (100).

JSON
{
  "metadata": {
    "custom_filters": {
      "recurring": true,
      "banks": [
        "057",
        "100"
      ],
      "card_brands": [
        "visa"
      ]
    }
  }
}
Selected Bank Accounts
The supported_bank_providers parameter allows you to specify the banks you want on the Pay with Bank channel. When set, the customer will only see the banks you specified. You should use the List BanksAPI endpoint to get the bank codes.

"metadata": {
  "custom_filters": {
    "supported_bank_providers": [
      "033",
      "215",
      "102"
    ]
  }
}
Selected MoMo Provider
Sometimes, you want to give preference to only certain mobile money providers. For example, you might want to run a campaign to allow just a certain provider. To do this, you can specify the provider(s) in the supported_mobile_money_providers parameter:

"metadata": {
  "custom_filters": {
    "supported_mobile_money_providers": ["vod"]
  }
}
Provider	Code	Country
MTN	mtn	Ghana
AirtelTigo	atl	Ghana
Vodafone	vod	Ghana


