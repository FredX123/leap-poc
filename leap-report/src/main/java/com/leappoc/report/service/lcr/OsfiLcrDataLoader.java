package com.leappoc.report.service.lcr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leappoc.report.model.lcr.LcrCalculatedData;
import com.leappoc.report.model.lcr.LcrCalculatedDependency;
import com.leappoc.report.model.lcr.LcrReferenceData;
import com.leappoc.report.repository.lcr.LcrCalculatedDataRepository;
import com.leappoc.report.repository.lcr.LcrReferenceDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads OSFI LCR data (calculatedData + referenceData) from the classpath JSON
 * into the database tables on application startup if the tables are empty.
 */
@Component
public class OsfiLcrDataLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OsfiLcrDataLoader.class);
    private static final String DATA_FILE = "data/osfi-lcr.json";
    private static final int DEFAULT_CALC_ID = 6059;

    private final LcrCalculatedDataRepository calculatedDataRepo;
    private final LcrReferenceDataRepository referenceDataRepo;
    private final ObjectMapper objectMapper;

    public OsfiLcrDataLoader(LcrCalculatedDataRepository calculatedDataRepo,
                             LcrReferenceDataRepository referenceDataRepo,
                             ObjectMapper objectMapper) {
        this.calculatedDataRepo = calculatedDataRepo;
        this.referenceDataRepo = referenceDataRepo;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (calculatedDataRepo.countByCalcId(DEFAULT_CALC_ID) > 0) {
            log.info("OSFI LCR data already loaded for calcId={}; skipping.", DEFAULT_CALC_ID);
            return;
        }

        log.info("Loading OSFI LCR data from classpath:{}...", DATA_FILE);
        try (InputStream is = new ClassPathResource(DATA_FILE).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            loadCalculatedData(root.get("calculatedData"));
            loadReferenceData(root.get("referenceData"));
            log.info("OSFI LCR data loaded successfully.");
        } catch (Exception e) {
            log.error("Failed to load OSFI LCR data from classpath:{} — {}", DATA_FILE, e.getMessage(), e);
        }
    }

    private void loadCalculatedData(JsonNode calculatedArray) {
        if (calculatedArray == null || !calculatedArray.isArray()) return;

        List<LcrCalculatedData> batch = new ArrayList<>();
        for (JsonNode node : calculatedArray) {
            LcrCalculatedData entity = new LcrCalculatedData();
            entity.setCalcId(DEFAULT_CALC_ID);
            entity.setRecordId(node.get("recordId").asText());
            entity.setCalculatedValue(toBigDecimal(node.get("calculatedValue")));
            entity.setType(node.get("type").asText());
            entity.setFormula(node.has("formula") ? node.get("formula").asText() : null);
            entity.setWeight(node.has("weight") ? toBigDecimal(node.get("weight")) : null);
            entity.setDisplayValue(toBigDecimal(node.get("displayValue")));

            JsonNode deps = node.get("dependencies");
            if (deps != null && deps.isArray()) {
                for (JsonNode dep : deps) {
                    LcrCalculatedDependency depEntity = new LcrCalculatedDependency();
                    depEntity.setCalculatedData(entity);
                    depEntity.setRecordId(dep.get("recordId").asText());
                    depEntity.setValue(toBigDecimal(dep.get("value")));
                    entity.getDependencies().add(depEntity);
                }
            }
            batch.add(entity);
        }
        calculatedDataRepo.saveAll(batch);
        log.info("Loaded {} calculatedData records.", batch.size());
    }

    private void loadReferenceData(JsonNode referenceArray) {
        if (referenceArray == null || !referenceArray.isArray()) return;

        List<LcrReferenceData> batch = new ArrayList<>();
        for (JsonNode node : referenceArray) {
            LcrReferenceData entity = new LcrReferenceData();
            entity.setCalcId(node.get("calc_id").asInt());
            entity.setReportingRow(node.get("reporting_row").asInt());
            entity.setProductClassResult(node.get("product_class_result").asText());
            entity.setReportingTypeAmount(node.get("reporting_type_amount").asText());
            entity.setOriginalCurrency(node.get("original_currency").asText());
            entity.setOriginalAmount(toBigDecimal(node.get("original_amount")));
            entity.setReportingCurrency(node.get("reporting_currency").asText());
            entity.setReportingAmount(toBigDecimal(node.get("reporting_amount")));
            entity.setReportableCurrency(node.has("reportable_currency") ? node.get("reportable_currency").asText() : null);
            entity.setRowNo(node.has("rowNo") ? node.get("rowNo").asInt() : null);
            batch.add(entity);
        }
        referenceDataRepo.saveAll(batch);
        log.info("Loaded {} referenceData records.", batch.size());
    }

    private BigDecimal toBigDecimal(JsonNode node) {
        if (node == null || node.isNull()) return null;
        return node.decimalValue();
    }
}

