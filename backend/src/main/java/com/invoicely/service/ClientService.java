package com.invoicely.service;

import com.invoicely.dto.ClientDto;
import com.invoicely.entity.Client;
import com.invoicely.entity.User;
import com.invoicely.repository.ClientRepository;
import com.invoicely.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public ClientService(ClientRepository clientRepository, UserRepository userRepository) {
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ClientDto> getClients(Long userId) {
        return clientRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientDto getClient(Long id, Long userId) {
        Client client = clientRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + id));
        return mapToDto(client);
    }

    @Transactional
    public ClientDto createClient(ClientDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Client client = new Client(
                user,
                dto.getName(),
                dto.getEmail(),
                dto.getCompany(),
                dto.getAddress(),
                dto.getPhone()
        );

        Client saved = clientRepository.save(client);
        return mapToDto(saved);
    }

    @Transactional
    public ClientDto updateClient(Long id, ClientDto dto, Long userId) {
        Client client = clientRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        client.setName(dto.getName());
        client.setEmail(dto.getEmail());
        client.setCompany(dto.getCompany());
        client.setAddress(dto.getAddress());
        client.setPhone(dto.getPhone());

        Client updated = clientRepository.save(client);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteClient(Long id, Long userId) {
        Client client = clientRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        clientRepository.delete(client);
    }

    public ClientDto mapToDto(Client client) {
        if (client == null) return null;
        return new ClientDto(
                client.getId(),
                client.getName(),
                client.getEmail(),
                client.getCompany(),
                client.getAddress(),
                client.getPhone(),
                client.getCreatedAt()
        );
    }
}
