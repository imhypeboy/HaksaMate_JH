package com.mega.haksamate.controller;

import com.mega.haksamate.dto.ReportRequestDTO;
import com.mega.haksamate.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<String> submitReport(@RequestBody ReportRequestDTO dto) {
        reportService.submitReport(dto);
        return ResponseEntity.ok("신고 완료");
    }
}
