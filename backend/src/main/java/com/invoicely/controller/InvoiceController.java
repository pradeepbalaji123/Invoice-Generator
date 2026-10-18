package com.invoicely.controller;

import com.invoicely.dto.InvoiceRequest;
import com.invoicely.dto.InvoiceResponse;
import com.invoicely.security.UserPrincipal;
import com.invoicely.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping({"/api/invoices", "/invoices"})
    public ResponseEntity<List<InvoiceResponse>> getInvoices(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(invoiceService.getInvoices(currentUser.getId()));
    }

    @GetMapping({"/api/invoices/{id}", "/invoices/{id}"})
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id,
                                                      @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(invoiceService.getInvoice(id, currentUser.getId()));
    }

    @PostMapping({"/api/invoices", "/invoices"})
    public ResponseEntity<InvoiceResponse> createInvoice(@RequestBody InvoiceRequest request,
                                                         @AuthenticationPrincipal UserPrincipal currentUser) {
        InvoiceResponse created = invoiceService.createInvoice(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping({"/api/invoices/{id}", "/invoices/{id}"})
    public ResponseEntity<InvoiceResponse> updateInvoice(@PathVariable Long id,
                                                         @RequestBody InvoiceRequest request,
                                                         @AuthenticationPrincipal UserPrincipal currentUser) {
        InvoiceResponse updated = invoiceService.updateInvoice(id, request, currentUser.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping({"/api/invoices/{id}", "/invoices/{id}"})
    public ResponseEntity<Map<String, String>> deleteInvoice(@PathVariable Long id,
                                                             @AuthenticationPrincipal UserPrincipal currentUser) {
        invoiceService.deleteInvoice(id, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Invoice deleted successfully"));
    }

    @GetMapping({"/api/invoices/{id}/pdf", "/invoices/{id}/pdf"})
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id,
                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        byte[] pdfBytes = invoiceService.generatePdf(id, currentUser.getId());
        InvoiceResponse invoice = invoiceService.getInvoice(id, currentUser.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + invoice.getInvoiceNumber() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PostMapping({"/api/invoices/{id}/send", "/invoices/{id}/send"})
    public ResponseEntity<Map<String, String>> sendInvoice(@PathVariable Long id,
                                                           @AuthenticationPrincipal UserPrincipal currentUser) {
        invoiceService.sendInvoice(id, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Email sent successfully"));
    }

    @PatchMapping({"/api/invoices/{id}/paid", "/invoices/{id}/paid"})
    public ResponseEntity<InvoiceResponse> markAsPaid(@PathVariable Long id,
                                                      @AuthenticationPrincipal UserPrincipal currentUser) {
        InvoiceResponse updated = invoiceService.markAsPaid(id, currentUser.getId());
        return ResponseEntity.ok(updated);
    }
}
