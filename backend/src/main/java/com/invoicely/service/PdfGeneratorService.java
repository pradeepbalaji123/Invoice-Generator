package com.invoicely.service;

import com.invoicely.entity.Invoice;
import com.invoicely.entity.InvoiceItem;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(30, 41, 59));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(51, 65, 85));
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(71, 85, 105));
            Font boldBody = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(30, 41, 59));
            Font whiteHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            // Title
            Paragraph title = new Paragraph("INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_RIGHT);
            document.add(title);

            Paragraph invNumber = new Paragraph("Invoice #: " + invoice.getInvoiceNumber(), boldBody);
            invNumber.setAlignment(Element.ALIGN_RIGHT);
            document.add(invNumber);

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy");
            Paragraph dates = new Paragraph("Date: " + invoice.getDate().format(dtf) +
                    "\nDue Date: " + invoice.getDueDate().format(dtf), bodyFont);
            dates.setAlignment(Element.ALIGN_RIGHT);
            document.add(dates);

            document.add(new Paragraph(" "));

            // Two column company & client info
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);

            // From (User)
            PdfPCell fromCell = new PdfPCell();
            fromCell.setBorder(Rectangle.NO_BORDER);
            fromCell.addElement(new Paragraph("From:", headerFont));
            if (invoice.getUser() != null) {
                fromCell.addElement(new Paragraph(invoice.getUser().getCompanyName(), boldBody));
                fromCell.addElement(new Paragraph(invoice.getUser().getName(), bodyFont));
                fromCell.addElement(new Paragraph(invoice.getUser().getAddress(), bodyFont));
                fromCell.addElement(new Paragraph(invoice.getUser().getEmail(), bodyFont));
                if (invoice.getUser().getPhone() != null) {
                    fromCell.addElement(new Paragraph(invoice.getUser().getPhone(), bodyFont));
                }
            }
            infoTable.addCell(fromCell);

            // To (Client)
            PdfPCell toCell = new PdfPCell();
            toCell.setBorder(Rectangle.NO_BORDER);
            toCell.addElement(new Paragraph("Bill To:", headerFont));
            if (invoice.getClient() != null) {
                if (invoice.getClient().getCompany() != null && !invoice.getClient().getCompany().isBlank()) {
                    toCell.addElement(new Paragraph(invoice.getClient().getCompany(), boldBody));
                }
                toCell.addElement(new Paragraph(invoice.getClient().getName(), boldBody));
                toCell.addElement(new Paragraph(invoice.getClient().getAddress(), bodyFont));
                toCell.addElement(new Paragraph(invoice.getClient().getEmail(), bodyFont));
                if (invoice.getClient().getPhone() != null) {
                    toCell.addElement(new Paragraph(invoice.getClient().getPhone(), bodyFont));
                }
            } else {
                toCell.addElement(new Paragraph("Valued Client", bodyFont));
            }
            infoTable.addCell(toCell);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Items Table
            PdfPTable table = new PdfPTable(new float[]{4f, 1.5f, 2f, 2f});
            table.setWidthPercentage(100);

            // Table Header
            Color headerBg = new Color(59, 130, 246);
            addHeaderCell(table, "Description", whiteHeader, headerBg, Element.ALIGN_LEFT);
            addHeaderCell(table, "Qty", whiteHeader, headerBg, Element.ALIGN_CENTER);
            addHeaderCell(table, "Unit Price", whiteHeader, headerBg, Element.ALIGN_RIGHT);
            addHeaderCell(table, "Amount", whiteHeader, headerBg, Element.ALIGN_RIGHT);

            // Items
            boolean alternate = false;
            Color altBg = new Color(248, 250, 252);
            for (InvoiceItem item : invoice.getItems()) {
                Color rowBg = alternate ? altBg : Color.WHITE;
                addCell(table, item.getDescription(), bodyFont, rowBg, Element.ALIGN_LEFT);
                addCell(table, String.valueOf(item.getQuantity()), bodyFont, rowBg, Element.ALIGN_CENTER);
                addCell(table, "$" + String.format("%.2f", item.getPrice()), bodyFont, rowBg, Element.ALIGN_RIGHT);
                addCell(table, "$" + String.format("%.2f", item.getAmount()), boldBody, rowBg, Element.ALIGN_RIGHT);
                alternate = !alternate;
            }

            document.add(table);
            document.add(new Paragraph(" "));

            // Summary Table
            PdfPTable summaryTable = new PdfPTable(new float[]{6f, 2f, 2f});
            summaryTable.setWidthPercentage(100);

            // Notes cell on the left
            PdfPCell notesCell = new PdfPCell();
            notesCell.setBorder(Rectangle.NO_BORDER);
            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                notesCell.addElement(new Paragraph("Notes:", boldBody));
                notesCell.addElement(new Paragraph(invoice.getNotes(), bodyFont));
            }
            summaryTable.addCell(notesCell);

            // Subtotal
            PdfPCell subtotalLabel = new PdfPCell(new Phrase("Subtotal:", boldBody));
            subtotalLabel.setBorder(Rectangle.NO_BORDER);
            subtotalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(subtotalLabel);

            PdfPCell subtotalVal = new PdfPCell(new Phrase("$" + String.format("%.2f", invoice.getSubtotal()), bodyFont));
            subtotalVal.setBorder(Rectangle.NO_BORDER);
            subtotalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(subtotalVal);

            // Tax
            summaryTable.addCell(getEmptyCell());
            PdfPCell taxLabel = new PdfPCell(new Phrase("Tax:", boldBody));
            taxLabel.setBorder(Rectangle.NO_BORDER);
            taxLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(taxLabel);

            PdfPCell taxVal = new PdfPCell(new Phrase("$" + String.format("%.2f", invoice.getTax()), bodyFont));
            taxVal.setBorder(Rectangle.NO_BORDER);
            taxVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(taxVal);

            // Discount
            summaryTable.addCell(getEmptyCell());
            PdfPCell discountLabel = new PdfPCell(new Phrase("Discount:", boldBody));
            discountLabel.setBorder(Rectangle.NO_BORDER);
            discountLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(discountLabel);

            PdfPCell discountVal = new PdfPCell(new Phrase("-$" + String.format("%.2f", invoice.getDiscount()), bodyFont));
            discountVal.setBorder(Rectangle.NO_BORDER);
            discountVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(discountVal);

            // Grand Total
            summaryTable.addCell(getEmptyCell());
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(16, 185, 129));
            PdfPCell totalLabel = new PdfPCell(new Phrase("Total Due:", totalFont));
            totalLabel.setBorder(Rectangle.TOP);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Phrase("$" + String.format("%.2f", invoice.getTotal()), totalFont));
            totalVal.setBorder(Rectangle.TOP);
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.addCell(totalVal);

            document.add(summaryTable);

            // Footer
            Paragraph footer = new Paragraph("\n\nThank you for your business!", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(8f);
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, Color bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6f);
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }

    private PdfPCell getEmptyCell() {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }
}
