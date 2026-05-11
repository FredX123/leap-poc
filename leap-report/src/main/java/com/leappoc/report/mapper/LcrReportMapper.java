package com.leappoc.report.mapper;

import com.leappoc.report.model.lcr.LcrCalculatedData;
import com.leappoc.report.model.lcr.LcrCalculatedDependency;
import com.leappoc.report.model.lcr.LcrReferenceData;
import com.leappoc.report.model.lcr.LcrReportData;
import com.leappoc.report.model.lcr.LcrReportLine;
import com.leappoc.report.model.lcr.LcrReportLineLevel;
import com.leappoc.shared.dto.lcr.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class LcrReportMapper {

    // --- OSFI LCR (calculatedData + referenceData) ---

    public OsfiLcrReportDto toOsfiLcrReport(List<LcrCalculatedData> calcData, List<LcrReferenceData> refData) {
        OsfiLcrReportDto dto = new OsfiLcrReportDto();
        dto.setCalculatedData(calcData.stream().map(this::toCalculatedDataDto).collect(Collectors.toList()));
        dto.setReferenceData(refData.stream().map(this::toReferenceDataDto).collect(Collectors.toList()));
        return dto;
    }

    private OsfiLcrCalculatedDataDto toCalculatedDataDto(LcrCalculatedData entity) {
        OsfiLcrCalculatedDataDto dto = new OsfiLcrCalculatedDataDto();
        dto.setRecordId(entity.getRecordId());
        dto.setCalculatedValue(entity.getCalculatedValue());
        dto.setType(entity.getType());
        dto.setFormula(entity.getFormula());
        dto.setWeight(entity.getWeight());
        dto.setDisplayValue(entity.getDisplayValue());
        dto.setDependencies(entity.getDependencies().stream()
                .map(this::toDependencyDto)
                .collect(Collectors.toList()));
        return dto;
    }

    private OsfiLcrDependencyDto toDependencyDto(LcrCalculatedDependency dep) {
        OsfiLcrDependencyDto dto = new OsfiLcrDependencyDto();
        dto.setRecordId(dep.getRecordId());
        dto.setValue(dep.getValue());
        return dto;
    }

    private OsfiLcrReferenceDataDto toReferenceDataDto(LcrReferenceData entity) {
        OsfiLcrReferenceDataDto dto = new OsfiLcrReferenceDataDto();
        dto.setReportingRow(entity.getReportingRow());
        dto.setProductClassResult(entity.getProductClassResult());
        dto.setReportingTypeAmount(entity.getReportingTypeAmount());
        dto.setCalcId(entity.getCalcId());
        dto.setOriginalCurrency(entity.getOriginalCurrency());
        dto.setOriginalAmount(entity.getOriginalAmount());
        dto.setReportingCurrency(entity.getReportingCurrency());
        dto.setReportingAmount(entity.getReportingAmount());
        dto.setReportableCurrency(entity.getReportableCurrency());
        dto.setRowNo(entity.getRowNo());
        return dto;
    }

    // --- OSFI LCR Metric ---


    public List<OsfiLcrMetricReportDto> toLcrMetricReport(List<LcrReportData> dataList) {
        Map<Long, List<LcrReportData>> byLineId = groupByLineId(dataList);
        List<OsfiLcrMetricReportDto> result = new ArrayList<>();

        for (List<LcrReportData> lineData : byLineId.values()) {
            LcrReportData first = lineData.get(0);

            OsfiLcrMetricReportDto dto = new OsfiLcrMetricReportDto();
            dto.setReportCode(first.getReportLine().getReportCode());
            dto.setParaCode(first.getReportLine().getParaCode());
            dto.setLevels(toLevelDtos(first.getReportLine().getLevels()));
            dto.setReportLineCode(first.getReportLine().getReportLineCode());
            dto.setReportLineName(first.getReportLine().getReportLineName());

            List<OsfiLcrMetricSegmentDataDto> segmentDtos = new ArrayList<>();
            for (Map.Entry<String, List<LcrReportData>> segEntry : groupBySegment(lineData).entrySet()) {
                List<LcrReportData> segData = segEntry.getValue();
                OsfiLcrMetricSegmentDataDto segDto = new OsfiLcrMetricSegmentDataDto();
                segDto.setSegmentOrder(segData.get(0).getSegment().getSegmentOrder());
                segDto.setSegmentName(segEntry.getKey());
                segDto.setDateData(segData.stream().map(this::toLcrMetricDateData).collect(Collectors.toList()));
                segmentDtos.add(segDto);
            }
            segmentDtos.sort(Comparator.comparingInt(OsfiLcrMetricSegmentDataDto::getSegmentOrder));
            dto.setSegmentData(segmentDtos);
            result.add(dto);
        }
        return result;
    }

    public List<OsfiLcrReportLineDto> toReportLineDtos(List<LcrReportLine> lines) {
        return lines.stream().map(this::toReportLineDto).collect(Collectors.toList());
    }

    private OsfiLcrReportLineDto toReportLineDto(LcrReportLine entity) {
        OsfiLcrReportLineDto dto = new OsfiLcrReportLineDto();
        dto.setId(entity.getId());
        dto.setLineCode(entity.getReportLineCode());
        dto.setLineName(entity.getReportLineName());
        dto.setLineType(entity.getLineType());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setWeight(entity.getWeight());
        dto.setWeightedLineCode(entity.getWeightedLineCode());
        return dto;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private Map<Long, List<LcrReportData>> groupByLineId(List<LcrReportData> dataList) {
        return dataList.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getReportLine().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));
    }

    private Map<String, List<LcrReportData>> groupBySegment(List<LcrReportData> lineData) {
        return lineData.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getSegment().getSegmentName(),
                        LinkedHashMap::new,
                        Collectors.toList()));
    }

    private List<ReportLineLevelDto> toLevelDtos(List<LcrReportLineLevel> levels) {
        return levels.stream()
                .map(l -> new ReportLineLevelDto(l.getLevelCode(), l.getLevelDesc()))
                .collect(Collectors.toList());
    }


    private OsfiLcrMetricDateDataDto toLcrMetricDateData(LcrReportData d) {
        OsfiLcrMetricDateDataDto dd = new OsfiLcrMetricDateDataDto();
        dd.setDateSkey(d.getDateSkey());
        dd.setCalendarDate(d.getCalendarDate().toString());
        dd.setAmountRptCcy(d.getAmountRptCcy());
        dd.setRwAmountRptCcy(d.getRwAmountRptCcy());
        return dd;
    }
}

