package com.invoicely.controller;

import com.invoicely.dto.ClientDto;
import com.invoicely.security.UserPrincipal;
import com.invoicely.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping({"/api/clients", "/clients"})
    public ResponseEntity<List<ClientDto>> getClients(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(clientService.getClients(currentUser.getId()));
    }

    @GetMapping({"/api/clients/{id}", "/clients/{id}"})
    public ResponseEntity<ClientDto> getClient(@PathVariable Long id,
                                               @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(clientService.getClient(id, currentUser.getId()));
    }

    @PostMapping({"/api/clients", "/clients"})
    public ResponseEntity<ClientDto> createClient(@Valid @RequestBody ClientDto dto,
                                                  @AuthenticationPrincipal UserPrincipal currentUser) {
        ClientDto created = clientService.createClient(dto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping({"/api/clients/{id}", "/clients/{id}"})
    public ResponseEntity<ClientDto> updateClient(@PathVariable Long id,
                                                  @Valid @RequestBody ClientDto dto,
                                                  @AuthenticationPrincipal UserPrincipal currentUser) {
        ClientDto updated = clientService.updateClient(id, dto, currentUser.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping({"/api/clients/{id}", "/clients/{id}"})
    public ResponseEntity<Map<String, String>> deleteClient(@PathVariable Long id,
                                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        clientService.deleteClient(id, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Client deleted successfully"));
    }
}
