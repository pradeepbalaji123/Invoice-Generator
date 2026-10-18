package com.invoicely.repository;

import com.invoicely.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUserIdOrderByIdDesc(Long userId);
    Optional<Client> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
}
