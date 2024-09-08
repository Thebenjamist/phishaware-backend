const Dynamo = require("../common/dynamodb");
const { getResponse } = require("../common/responses");

exports.fetchEmails = async (event) => {
  try {
    const emails = await Dynamo.scan({
      FilterExpression: "attribute_exists(id)",
      TableName: "email-table",
    });
    return getResponse(200, "Emails fetched successfully", emails);
  } catch (err) {
    console.log(err);
    return getResponse(400, "Failed to fetch emails");
  }
};

exports.addInitialEmails = async (event) => {
  // Bulk/ Spear Phishing/ BEC Emails
  const typeA = [
    {
      id: "1",
      senderEmail: "billing-siiansd8@outlook.com",
      senderName: "Payments Department",
      subject: "Urgent Overdue Invoice: Late Payment Penalty!",
      messageGreeting: "Dear Customer (IMPORTANT)",
      messageClosing: "Regards,",
      messageBody:
        "This is a final reminder to settle your outstanding invoice of $100. To avoid a late payment penalty of 10%, please make the payment immediately by clicking here:",
      isPhishing: true,
      phishingType: "A",
    },
    {
      id: "2",
      senderEmail: "john@under-presure.com",
      senderName: "John Smith",
      subject: "Meeting Confirmation",
      messageGreeting: "Hi there,",
      messageClosing: "Cheers,",
      messageBody:
        "Hi there, just wanted to confirm you got the invite for the meeting in couple of minutes, here's the link if you didn't get it",
      isPhishing: true,
      phishingType: "A",
    },
    {
      id: "3",
      senderEmail: "lotterywinnings-2024-new@gmail.co.uk",
      senderName: "International Lottery Commission",
      subject: "Congratulations! You've Won $1,000,000!",
      messageGreeting: "Dear Lucky Winner,",
      messageClosing: "Sincerely,",
      messageBody:
        "You have been selected as the lucky winner of our $1,000,000 lottery! To claim your prize, please contact our agent immediately by replying to this email with your personal information.", // Requests personal information
      isPhishing: true,
      phishingType: "A",
    },
    {
      id: "4",
      senderEmail: "josh-smolder@under-p.com",
      senderName: "CEO - Josh Smolder",
      subject: "Contract Negotiation",
      messageGreeting: "Dear Employee,",
      messageClosing: "Thank you",
      messageBody:
        "Please click the link to schedule a meeting with me ASAP to discuss your contract and future with the company.",
      isPhishing: true,
      phishingType: "A",
    },
  ];
  // Credential Harvesting
  const typeB = [
    {
      id: "5",
      senderEmail: "alex.wong@under-pressure.support",
      senderName: "Alex Wong",
      subject: "Urgent Request",
      messageGreeting: "Hi,",
      messageClosing: "Best regards,",
      messageBody:
        "I need your help urgently with a confidential project. Please reply to this email with your login credentials so I can grant you access. Thanks, Alex.",
      isPhishing: true,
      phishingType: "B",
    },
    {
      id: "6",
      senderEmail: "security.announcements@security-announce.support.me",
      senderName: "IT Security Team",
      subject: "Urgent Action Required: Secure Your Account!",
      messageGreeting: "Dear User,",
      messageClosing: "Sincerely,",
      messageBody:
        "We detected suspicious activity on your account. To avoid losing access to your account, please reset your password by following the link below:",
      isPhishing: true,
      phishingType: "B",
    },
    {
      id: "7",
      senderEmail: "hr@google.help.support.me",
      senderName: "Google",
      subject: "Action Required: Update Your Password",
      messageGreeting: "Good Day,",
      messageClosing: "Best regards,",
      messageBody:
        "Your password is compromised please go to the link below and change it to prevent data loss",
      isPhishing: true,
      phishingType: "B",
    },
    {
      id: "8",
      senderEmail: "it-support@under-pressure-it.com",
      senderName: "IT Support",
      subject: "Password Expiry Notice: Immediate Action Required",
      messageGreeting: "Dear Employee,",
      messageClosing: "Best regards, IT Support Team",
      messageBody:
        "Your password is set to expire in 24 hours. To avoid losing access to your account, please update your password immediately by clicking on the secure company portal link below. Failure to do so will result in temporary deactivation of your account.",
      isPhishing: true,
      phishingType: "B",
    },
  ];
  // Malware Delivery Phishing Emails
  const typeC = [
    {
      id: "9",
      senderEmail: "contracts@underp.support",
      senderName: "Contracts Department",
      subject: "Sign Employment Contract",
      messageGreeting: "Good Day,",
      messageClosing: "Best regards,",
      messageBody:
        "Please download and fill in the attached employment contract. Once completed, please send it back to us for processing.",
      isPhishing: true,
      phishingType: "C",
    },
    {
      id: "10",
      senderEmail: "jonathan1988@under-pressire.com",
      senderName: "Jonathan Smith",
      subject: "Action Required: Review Invoice",
      messageGreeting: "Good Day,",
      messageClosing: "Best regards,",
      messageBody:
        "Please review the attached invoice and let me know if everything is in order. If you have any questions, feel free to reach out.",
      isPhishing: true,
      phishingType: "C",
    },
    {
      id: "11",
      senderEmail: "chris-h@gmail.com",
      senderName: "Under Pressure HR",
      subject: "Document Request",
      messageGreeting: "Hi there",
      messageClosing: "Thank you",
      messageBody:
        "Please find below the link to download the document you requested. Please let me know if you need any further assistance.",
      isPhishing: true,
      phishingType: "C",
    },
    {
      id: "12",
      senderEmail: "meetings@under-pressure-meet.it-support-meeting.support",
      senderName: "Under Pressure HR",
      subject: "Meeting Request",
      messageGreeting: "Hi there",
      messageClosing: "Thank you",
      messageBody:
        "Please download the attached meeting invitation and confirm your attendance. If you have any questions, feel free to reach out.",
      isPhishing: true,
      phishingType: "C",
    },
  ];
  const realEmails = [
    {
      id: "13",
      senderEmail: "john.doe@under-pressure.com",
      senderName: "John Doe",
      subject: "Meeting Reminder",
      messageGreeting: "Good day,",
      messageClosing: "Best regards,",
      messageBody:
        "This is a reminder about our upcoming meeting on this afternoon. Please RSVP.",
      isPhishing: false,
      phishingType: null,
    },
    {
      id: "14",
      senderEmail: "emily.jones@under-pressure.com",
      senderName: "Emily Jones",
      subject: "Vacation Request Approved!",
      messageGreeting: "Hey there,",
      messageClosing: "Regards,",
      messageBody:
        "We're thrilled to approve your vacation request for June 1st to June 10th. Please enjoy your time off and don’t hesitate to reach out if you need anything before you leave.",
      isPhishing: false,
      phishingType: null,
    },
    {
      id: "15",
      senderEmail: "michael.ng@under-pressure.com",
      senderName: "Michael Ng",
      subject: "Project Update",
      messageGreeting: "Hi team,",
      messageClosing: "Thanks,",
      messageBody:
        "Just a quick update on the project. We are making good progress and are on track to meet the deadline. Keep up the great work!",
      isPhishing: false,
      phishingType: null,
    },
    {
      id: "16",
      senderEmail: "david.lee@under-pressure.com",
      senderName: "David Lee",
      subject: "New Product Launch",
      messageGreeting: "Hello,",
      messageClosing: "Regards,",
      messageBody:
        "We are excited to announce the launch of our new revolutionary product, please click the link to check our blog about this", // Legitimate email
      isPhishing: false,
      phishingType: null,
    },
    {
      id: "17",
      senderEmail: "peter.wilson@under-pressure.com",
      senderName: "Peter Wilson",
      subject: "Meeting Request",
      messageGreeting: "Dear colleague,",
      messageClosing: "Sincerely,",
      messageBody:
        "I would like to schedule a meeting to discuss the upcoming project. Please let me know your availability. Thank you.",
      isPhishing: false,
      phishingType: null,
    },
    {
      id: "18",
      senderEmail: "john.anderson@under-pressure.com",
      senderName: "John Anderson",
      subject: "Client Follow-up",
      messageGreeting: "Hi there,",
      messageClosing: "Sincerely,",
      messageBody:
        "Please follow up with the client regarding the outstanding payment. Let me know if you need any assistance",
      isPhishing: false,
      phishingType: null,
    },
    {
      id: "19",
      senderEmail: "peter.wilson@under-pressure.com",
      senderName: "Peter Wilson",
      subject: "Requested docs",
      messageGreeting: "Dear colleague,",
      messageClosing: "Sincerely,",
      messageBody: "Please find attached the requested documents.",
      isPhishing: false,
      phishingType: null,
    },
    {
      id: "20",
      senderEmail: "meetings@under-pressure.com",
      senderName: "Meetings Scheduler",
      subject: "Recurring Compliance Meeting",
      messageGreeting: "Good Day,",
      messageClosing: "Sincerely,",
      messageBody:
        "Please find attached the recurring meeting invite for compliance, please use this to update your calendar applications.",
      isPhishing: false,
      phishingType: null,
    },
  ];

  const mockEmails = [...typeA, ...typeB, ...typeC, ...realEmails];

  try {
    for (const email of mockEmails) {
      await Dynamo.write(email, "email-table");
    }
    return getResponse(200, "Initial emails added successfully");
  } catch (err) {
    console.log(err);
    return getResponse(400, "Failed to add initial emails");
  }
};
