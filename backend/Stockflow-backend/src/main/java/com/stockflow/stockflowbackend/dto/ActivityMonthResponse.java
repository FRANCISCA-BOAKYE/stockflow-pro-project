package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityMonthResponse {
    private int year;
    private int month;
    private String label;
    private long entryCount;
    private LocalDateTime clearedAt;
    private String clearedByName;
    private boolean canClear;
}
