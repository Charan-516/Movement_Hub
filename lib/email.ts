type VolunteerConfirmationEmail = {
  to: string;
  fullName: string;
  eventTitle: string;
  eventDate: Date;
  startTime: string;
  endTime: string;
  location: string;
};

export async function sendVolunteerConfirmationEmail({
  to,
  fullName,
  eventTitle,
  eventDate,
  startTime,
  endTime,
  location,
}: VolunteerConfirmationEmail) {
  // TODO: IS, you can replace this with Outlook email sending.

  console.log("Volunteer confirmation email queued:", {
    to,
    subject: `Volunteer Confirmation: ${eventTitle}`,
    message: `
Hi ${fullName},

Thank you for signing up to volunteer for ${eventTitle}.

Event Details:
Date: ${eventDate.toLocaleDateString("en-US")}
Time: ${startTime} - ${endTime}
Location: ${location}

Thank you,
    `,
  });
}