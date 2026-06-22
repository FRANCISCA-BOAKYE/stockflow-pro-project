package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateListingRequest {

    private String headline;
    private String description;
    private String deliveryTerms;
    private String creditTerms;
    private String location;
    private String contactEmail;
    private String contactPhone;
}