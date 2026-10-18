package com.invoicely.controller;

import com.invoicely.dto.DashboardStatsDto;
import com.invoicely.security.UserPrincipal;
import com.invoicely.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping({"/api/dashboard/stats", "/dashboard/stats"})
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(currentUser.getId());
        return ResponseEntity.ok(stats);
    }
}
