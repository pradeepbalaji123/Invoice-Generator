package com.invoicely.service;

import com.invoicely.dto.ClientDto;
import com.invoicely.dto.InvoiceItemDto;
import com.invoicely.dto.InvoiceRequest;
import com.invoicely.dto.InvoiceResponse;
import com.invoicely.entity.*;
import com.invoicely.repository.AuditLogRepository;
import com.invoicely.repository.ClientRepository;
import com.invoicely.repository.InvoiceRepository;
import com.invoicely.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final EmailService emailService;
    private final ClientService clientService;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          ClientRepository clientRepository,
                          UserRepository userRepository,
                          AuditLogRepository auditLogRepository,
                          PdfGeneratorService pdfGeneratorService,
                          EmailService emailService,
                          ClientService clientService) {
        this.invoiceRepository = invoiceRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.pdfGeneratorService = pdfGeneratorService;
        this.emailService = emailService;
        this.clientService = clientService;
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoices(Long userId) {
        return invoiceRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Long id, Long userId) {
        Invoice invoice = findUserInvoice(id, userId);
        return mapToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Client client = null;
        Long clientId = req.getClientId();
        if (clientId != null) {
            client = clientRepository.findByIdAndUserId(clientId, userId)
                    .orElse(null);
        }

        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setClient(client);
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setDate(req.getDate() != null ? req.getDate() : LocalDate.now());
        invoice.setDueDate(req.getDueDate() != null ? req.getDueDate() : LocalDate.now().plusDays(14));
        invoice.setNotes(req.getNotes());
        invoice.setStatus(req.getStatus() != null ? InvoiceStatus.fromString(req.getStatus()) : InvoiceStatus.DRAFT);

        // Process line items & recalculate
        BigDecimal subtotal = BigDecimal.ZERO;
        if (req.getItems() != null) {
            for (InvoiceItemDto itemDto : req.getItems()) {
                BigDecimal qty = BigDecimal.valueOf(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1);
                BigDecimal price = itemDto.getPrice() != null ? itemDto.getPrice() : BigDecimal.ZERO;
                BigDecimal amount = qty.multiply(price);

                InvoiceItem item = new InvoiceItem(
                        invoice,
                        itemDto.getDescription() != null ? itemDto.getDescription() : "Item",
                        itemDto.getQuantity() != null ? itemDto.getQuantity() : 1,
                        price,
                        amount
                );
                invoice.addItem(item);
                subtotal = subtotal.add(amount);
            }
        }

        invoice.setSubtotal(req.getSubtotal() != null ? req.getSubtotal() : subtotal);
        invoice.setTax(req.getTax() != null ? req.getTax() : BigDecimal.ZERO);
        invoice.setDiscount(req.getDiscount() != null ? req.getDiscount() : BigDecimal.ZERO);

        BigDecimal calculatedTotal = invoice.getSubtotal().add(invoice.getTax()).subtract(invoice.getDiscount());
        invoice.setTotal(req.getTotal() != null ? req.getTotal() : calculatedTotal);

        Invoice saved = invoiceRepository.save(invoice);
        auditLogRepository.save(new AuditLog(userId, saved.getId(), "CREATE", "Created invoice " + saved.getInvoiceNumber()));

        return mapToResponse(saved);
    }

    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest req, Long userId) {
        Invoice invoice = findUserInvoice(id, userId);

        Long clientId = req.getClientId();
        if (clientId != null) {
            Client client = clientRepository.findByIdAndUserId(clientId, userId).orElse(null);
            invoice.setClient(client);
        }

        if (req.getDueDate() != null) invoice.setDueDate(req.getDueDate());
        if (req.getNotes() != null) invoice.setNotes(req.getNotes());
        if (req.getStatus() != null) invoice.setStatus(InvoiceStatus.fromString(req.getStatus()));

        if (req.getItems() != null) {
            invoice.getItems().clear();
            BigDecimal subtotal = BigDecimal.ZERO;
            for (InvoiceItemDto itemDto : req.getItems()) {
                BigDecimal qty = BigDecimal.valueOf(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1);
                BigDecimal price = itemDto.getPrice() != null ? itemDto.getPrice() : BigDecimal.ZERO;
                BigDecimal amount = qty.multiply(price);

                InvoiceItem item = new InvoiceItem(
                        invoice,
                        itemDto.getDescription(),
                        itemDto.getQuantity(),
                        price,
                        amount
                );
                invoice.addItem(item);
                subtotal = subtotal.add(amount);
            }
            if (req.getSubtotal() != null) invoice.setSubtotal(req.getSubtotal());
            else invoice.setSubtotal(subtotal);
        }

        if (req.getTax() != null) invoice.setTax(req.getTax());
        if (req.getDiscount() != null) invoice.setDiscount(req.getDiscount());
        if (req.getTotal() != null) {
            invoice.setTotal(req.getTotal());
        } else {
            invoice.setTotal(invoice.getSubtotal().add(invoice.getTax()).subtract(invoice.getDiscount()));
        }

        Invoice updated = invoiceRepository.save(invoice);
        auditLogRepository.save(new AuditLog(userId, updated.getId(), "UPDATE", "Updated invoice " + updated.getInvoiceNumber()));

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteInvoice(Long id, Long userId) {
        Invoice invoice = findUserInvoice(id, userId);
        invoiceRepository.delete(invoice);
        auditLogRepository.save(new AuditLog(userId, id, "DELETE", "Deleted invoice " + invoice.getInvoiceNumber()));
    }

    @Transactional
    public InvoiceResponse markAsPaid(Long id, Long userId) {
        Invoice invoice = findUserInvoice(id, userId);
        invoice.setStatus(InvoiceStatus.PAID);
        Invoice saved = invoiceRepository.save(invoice);
        auditLogRepository.save(new AuditLog(userId, id, "STATUS_CHANGE", "Marked invoice as PAID"));
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(Long id, Long userId) {
        Invoice invoice = findUserInvoice(id, userId);
        return pdfGeneratorService.generateInvoicePdf(invoice);
    }

    @Transactional
    public InvoiceResponse sendInvoice(Long id, Long userId) {
        Invoice invoice = findUserInvoice(id, userId);
        byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(invoice);

        emailService.sendInvoiceEmail(invoice, pdfBytes, invoice.getUser());

        invoice.setStatus(InvoiceStatus.SENT);
        Invoice saved = invoiceRepository.save(invoice);
        auditLogRepository.save(new AuditLog(userId, id, "SEND_EMAIL", "Sent invoice PDF via email"));

        return mapToResponse(saved);
    }

    @Scheduled(cron = "0 0 1 * * ?") // Runs daily at 1:00 AM
    @Transactional
    public void checkOverdueInvoices() {
        log.info("Running automated cron check for overdue invoices...");
        List<Invoice> sentInvoices = invoiceRepository.findOverdueInvoices(InvoiceStatus.SENT, LocalDate.now());
        for (Invoice inv : sentInvoices) {
            inv.setStatus(InvoiceStatus.OVERDUE);
            invoiceRepository.save(inv);
            log.info("Invoice {} marked as OVERDUE", inv.getInvoiceNumber());
        }
    }

    private Invoice findUserInvoice(Long id, Long userId) {
        return invoiceRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + id));
    }

    private String generateInvoiceNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "INV-" + datePrefix + "-" + randomSuffix;
    }

    public InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse res = new InvoiceResponse();
        res.setId(invoice.getId());
        res.setInvoiceNumber(invoice.getInvoiceNumber());
        res.setDate(invoice.getDate());
        res.setDueDate(invoice.getDueDate());
        res.setSubtotal(invoice.getSubtotal());
        res.setTax(invoice.getTax());
        res.setDiscount(invoice.getDiscount());
        res.setTotal(invoice.getTotal());
        res.setStatus(invoice.getStatus().getValue());
        res.setNotes(invoice.getNotes());
        res.setCreatedAt(invoice.getCreatedAt());

        if (invoice.getClient() != null) {
            res.setClient(clientService.mapToDto(invoice.getClient()));
        } else {
            ClientDto fallback = new ClientDto();
            fallback.setName("Deleted Client");
            res.setClient(fallback);
        }

        if (invoice.getItems() != null) {
            List<InvoiceItemDto> itemDtos = invoice.getItems().stream()
                    .map(item -> new InvoiceItemDto(
                            item.getId(),
                            item.getDescription(),
                            item.getQuantity(),
                            item.getPrice(),
                            item.getAmount()
                    ))
                    .collect(Collectors.toList());
            res.setItems(itemDtos);
        }

        return res;
    }
}
