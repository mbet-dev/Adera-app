
The context inside the context for the PTP Delivery Services -

Use Cases and System Scenario of the Adera app workflow implementation logic -

Suppose Alex sends a parcel to Beza.

Basic Elements in this transaction will be Alex (must be a member of this Adera-app - who has a "customer' role), Beza (she may either be a member of Adera-app or not- simply a walking customer who has no credential to log in to the app), a Dropoff-Point (who is a member of Adera with a role "partner") represented here as "P1" for the sake of simplicity, a Pickup-point (who is a member of Adera with a role "partner") represented here as "P2", the drivers (a member of the Adera system with a role of "driver") represented here by "D1" & "D2", the backend server denoted here as "S" and optionally, the staff who is an employee of Adera working at Parcel Sorting Facility Center/Hub identified by the role "staff" and "S1", "S2", "S3".


Having these notations established, a parcel delivery with Adera system/app always starts with the sender- in this case A. So, he fills out all the required fields in the form and hit the button to raise the CreateSendParcel event to the backend server. So, the data is created temporarily on the database which will be removed within 24 hours of creation if payment is not been made. Note that here- the tracking code which eventually be translated as the QR code affiliated to this order throughout the delivery life is composed of 4 basic components described as follows:

- ** QR Format - Structure **:
  ```
  QR_CODE = TRACKING_ID + PHASE_FLAG + TIMESTAMP + HASH
  Example: ADE20231001-2-1672531005-7c6d3a
  ```
- **Phase Flags**:
  - 0: Created
  - 1: At Dropoff Partner
  - 2: Courier Picked Up (to Hub)/in_transit_to_hub
  - 3: At Sorting Hub
  - 4: Courier Picked Up (to Recipient)/dispatched
  - 5: At Pickup Partner
  - 6: Delivered
- **Validation Logic**:
  - Partners/Couriers scan QR → Backend verifies phase progression
  - Each scan tied to timestamp, location, and user role
  - Phase transitions must follow valid sequence

++> Moreover, the last hash part (in this case, "7c6d3a") is again subjected to another hashing encryption alogorithm by the backend server upon the arrival of the pickup point ("P2") to give us a different string /eg, "k53y7f". Then, this newly generated code is sent to the designated receiver via SMS and/or in-app notificaion. This is to be used as a verification control logic that the right person came to fetch his/her exact parcel. So, at this point, the receiver may go to the the pickup point("P2") and will have to either show the respective partner the QR code generated with the new hash instead of the previous or will literally have to tell the partner the TRACKING_ID and also the new hash string sent to him on SMS. Then, when the partner enters the two codes he got from the receiver (in this case, Beza or someone whom Beza asked to go fetch the parcel), the Pickup Partner ("P2") will be confirmed of the rightful Recipient. Then, an SMS message and/or in-app notificaion will be sent to the receiver (Beza).


# Various Case Scenarios :

Here, we may assume 4 different cases

As stated, in all cases, the parcel delivery and eventually the tracking to follow begins with the creation of the parcel sending procedure by the sender (here, Alex) who is necessarily a user with a "customer" role in our supabase database to a receiver (Beza) whose phone number is inputted by Alex. Now, the possible, different case scenarios we will inspect/discuss here are:

    a) Alex pays the price required by the given parcel sending parameters.
case-1:     Alex pays the payment and sends the parcel

Alex fills the form with the CreateSend form, enters Beza's phone number, selects P1 and P2 of his choice sees the payment required based on the parameters he filled, then he pays the required amount either from his in-app wallet or his bank account through a payment gateway used by the app. Then the Backend Server confirms the parcel sending creation and notifies Alex, P1, H, P2 and Beza (if Beza is present in the profiles table of Adera). Additionally, The Server (S) analyzes and intelligently distributes the task to the staff it assigns and to a designated driver of Adera (D1)- to handle the fetching of the parcel from the Dropoff point.
Moreover, for accomodating both types of receivers and for a persistent, sound and noticeable alert, an SMS will be sent to Beza regardless of being a customer with Adera or not. The SMS will also carry the TRACKING_ID of the given parcel.


    b) Alex, currently has insufficient balance in his in-app wallet and/or his bank accounts with mobile banking, but has the required amount in cash; hence finds his prefered available dropoff-points accepting such payment requests.
case-2:     Alex waives the payment to be done by the dropoff-point partner of Adera.

Alex fills the form selecting a dropoff point that can process such payments, then this is created by S with a tracking id but finalized upon payment at P1. So, alex goes and gives the tracking id to P1, P1 checks for the details and pays after receiving the money. Then the complete database creation is being made at this stage.



    c) Alex waives the payment to be made by the receiver of this particular parcel- (Beza).

case-3:      Alex waived the payment to be done by Beza where Beza is a member of Adera

Here, Alex enters the information required by the form and waives the payment to receiver. Then a notification is sent to the receiver via sms and if no payment is made before 24hours, the order will be canceled. But if payment is being processed well accordingly, the normal transaction will be carried out as in case-1.


case-4:      Alex waived the payment to be done by Beza upon delivery where Beza is a walking customer who pays (the expected fee to Adera's bank account) from her balance at the bank

Here, Alex enters the information required by the form and waives the payment to receiver. Then a notification is sent to the receiver via sms and if no payment is made before 24hours, the order will be canceled. But if payment is being processed well accordingly, the normal transaction will be carried out as in case-1.



case-5:      Alex waived the payment to be done by Beza upon delivery where Beza is a walking customer who has Cash on Hand for this fee and requires the selection of Pickup-point partners with such an option - for them to pay from their wallet while receiving the cash from Beza.

In this case, what seems different from the above is, a P2 who is open for this payment service has to be selected. Then when the recepient delivers the cash payment to P2, then the hashed string will be sent to the receiver as an SMS and only then can the parcel be dispatched.
