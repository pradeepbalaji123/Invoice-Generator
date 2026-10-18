package com.invoicely;

import com.invoicely.dto.InvoiceItemDto;
import com.invoicely.dto.InvoiceRequest;
import com.invoicely.dto.InvoiceResponse;
import com.invoicely.entity.Invoice;
import com.invoicely.entity.InvoiceStatus;
import com.invoicely.entity.User;
import com.invoicely.repository.AuditLogRepository;
import com.invoicely.repository.ClientRepository;
import com.invoicely.repository.InvoiceRepository;
import com.invoicely.repository.UserRepository;
import com.invoicely.service.ClientService;
import com.invoicely.service.EmailService;
import com.invoicely.service.InvoiceService;
import com.invoicely.service.PdfGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private PdfGeneratorService pdfGeneratorService;
    @Mock
    private EmailService emailService;
    @Mock
    private ClientService clientService;

    @InjectMocks
    private InvoiceService invoiceService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Pradeep Balaji", "pradeep@example.com", "secret123", "Balaji Tech", "123 Anna Nagar", "9876543210");
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("Should create invoice and accurately compute subtotal and total")
    void shouldCreateInvoiceWithCalculations() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice inv = invocation.getArgument(0);
            inv.setId(101L);
            return inv;
        });

        InvoiceRequest req = new InvoiceRequest();
        req.setDate(LocalDate.now());
        req.setDueDate(LocalDate.now().plusDays(10));
        req.setTax(BigDecimal.valueOf(10.00));
        req.setDiscount(BigDecimal.valueOf(5.00));

        InvoiceItemDto item1 = new InvoiceItemDto(null, "DevOps Consulting", 2, BigDecimal.valueOf(100.00), BigDecimal.valueOf(200.00));
        InvoiceItemDto item2 = new InvoiceItemDto(null, "Cloud Architecture", 1, BigDecimal.valueOf(150.00), BigDecimal.valueOf(150.00));
        req.setItems(List.of(item1, item2));

        InvoiceResponse response = invoiceService.createInvoice(req, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(101L);
        assertThat(response.getSubtotal()).isEqualByComparingTo("350.00");
        assertThat(response.getTotal()).isEqualByComparingTo("355.00"); // 350 + 10 tax - 5 discount
        assertThat(response.getStatus()).isEqualTo("draft");
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should mark invoice as paid")
    void shouldMarkInvoiceAsPaid() {
        Invoice invoice = new Invoice();
        invoice.setId(202L);
        invoice.setUser(sampleUser);
        invoice.setStatus(InvoiceStatus.SENT);

        when(invoiceRepository.findByIdAndUserId(202L, 1L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InvoiceResponse response = invoiceService.markAsPaid(202L, 1L);

        assertThat(response.getStatus()).isEqualTo("paid");
        verify(invoiceRepository, times(1)).save(invoice);
    }
}
