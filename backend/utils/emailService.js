const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Use your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendAppointmentReminder(appointment, user) {
    const html = `
      <h2>Appointment Reminder</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <ul>
        <li>Date: ${new Date(appointment.appointmentDate).toDateString()}</li>
        <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
        <li>Doctor: Dr. ${appointment.doctor.name}</li>
        <li>Type: ${appointment.consultationType}</li>
      </ul>
      <p>Please arrive 10 minutes early for your appointment.</p>
    `;

    return await this.sendEmail(user.email, 'Appointment Reminder', html);
  }

  async sendPrescriptionReady(prescription, user) {
    const html = `
      <h2>New Prescription Available</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>Your new prescription is ready:</p>
      <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
      <p><strong>Medications:</strong></p>
      <ul>
        ${prescription.medications.map(med => 
          `<li>${med.name} - ${med.dosage}, ${med.frequency} for ${med.duration}</li>`
        ).join('')}
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/prescriptions/${prescription._id}">View Prescription</a></p>
    `;

    return await this.sendEmail(user.email, 'New Prescription Ready', html);
  }

  async sendAssessmentResult(assessment, user) {
    const html = `
      <h2>Your Mental Health Assessment Results</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>Your ${assessment.assessmentName} assessment results:</p>
      <p><strong>Score:</strong> ${assessment.totalScore}/${assessment.maxScore}</p>
      <p><strong>Severity:</strong> ${assessment.severity}</p>
      <p><strong>Interpretation:</strong> ${assessment.interpretation}</p>
      
      ${assessment.recommendations.length > 0 ? `
        <h3>Recommendations:</h3>
        <ul>
          ${assessment.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      ` : ''}
      
      <p><a href="${process.env.FRONTEND_URL}/assessments/${assessment._id}">View Full Results</a></p>
    `;

    return await this.sendEmail(user.email, 'Assessment Results Ready', html);
  }

  async sendCourseRecommendation(course, user) {
    const html = `
      <h2>Recommended Course for You</h2>
      <p>Hello ${user.firstName || user.username},</p>
      <p>Based on your recent activity, we recommend:</p>
      <h3>${course.title}</h3>
      <p>${course.description}</p>
      <p><strong>Duration:</strong> ${course.duration} minutes</p>
      <p><a href="${process.env.FRONTEND_URL}/courses/${course._id}">Enroll Now</a></p>
    `;

    return await this.sendEmail(user.email, 'Recommended Course', html);
  }
}

module.exports = new EmailService();