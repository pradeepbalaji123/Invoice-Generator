package com.invoicely.service;

import com.invoicely.entity.Invoice;
import com.invoicely.entity.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInvoiceEmail(Invoice invoice, byte[] pdfBytes, User sender) {
        if (invoice.getClient() == null || invoice.getClient().getEmail() == null) {
            log.warn("Cannot send email: Client email is missing for invoice {}", invoice.getInvoiceNumber());
            return;
        }

        String recipientEmail = invoice.getClient().getEmail();
        String subject = String.format("Invoice %s from %s", invoice.getInvoiceNumber(), sender.getCompanyName());
        String bodyText = String.format(
                "Dear %s,\n\nPlease find attached your invoice %s.\nAmount Due: $%.2f\nDue Date: %s\n\nThank you for your business!\n\nBest regards,\n%s\n%s",
                invoice.getClient().getName(),
                invoice.getInvoiceNumber(),
                invoice.getTotal(),
                invoice.getDueDate(),
                sender.getName(),
                sender.getCompanyName()
        );

        try {
            if (fromEmail == null || fromEmail.isBlank()) {
                log.info("Simulating email delivery (SMTP not configured): To={}, Subject={}", recipientEmail, subject);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(bodyText);

            String attachmentFilename = "invoice-" + invoice.getInvoiceNumber() + ".pdf";
            helper.addAttachment(attachmentFilename, new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("Invoice email successfully sent to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send invoice email via SMTP: {}. Invoice status still updated.", e.getMessage());
        }
    }
}
