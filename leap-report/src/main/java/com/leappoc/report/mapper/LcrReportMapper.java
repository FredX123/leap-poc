package com.leappoc.report.mapper;

import com.leappoc.report.model.lcr.LcrReportData;
import com.leappoc.shared.dto.lcr.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class LcrReportMapper {

    public List<OsfiLcrReportDto> toLcrReport(List<LcrReportData> dataList) {
        Map<String, List<LcrReportData>> byLineCode = groupByLineCode(dataList);
        List<OsfiLcrReportDto> result = new ArrayList<>();

        for (List<LcrReportData> lineData : byLineCode.values()) {
            LcrReportData first = lineData.get(0);

            OsfiLcrReportDto dto = new OsfiLcrReportDto();
            mapReportLineFields(dto, first);

            List<OsfiLcrSegmentDataDto> segmentDtos = new ArrayList<>();
            for (Map.Entry<String, List<LcrReportData>> segEntry : groupBySegment(lineData).entrySet()) {
                List<LcrReportData> segData = segEntry.getValue();
                OsfiLcrSegmentDataDto segDto = new OsfiLcrSegmentDataDto();
                segDto.setSegmentOrder(segData.get(0).getSegment().getSegmentOrder());
                segDto.setSegmentName(segEntry.getKey());
                segDto.setDateData(segData.stream().map(this::toLcrDateData).collect(Collectors.toList()));
                segmentDtos.add(segDto);
            }
            segmentDtos.sort(Comparator.comparingInt(OsfiLcrSegmentDataDto::getSegmentOrder));
            dto.setSegmentData(segmentDtos);
            result.add(dto);
        }
        return result;
    }

    public List<OsfiLcrMetricReportDto> toLcrMetricReport(List<LcrReportData> dataList) {
        Map<String, List<LcrReportData>> byLineCode = groupByLineCode(dataList);
        List<OsfiLcrMetricReportDto> result = new ArrayList<>();

        for (List<LcrReportData> lineData : byLineCode.values()) {
            LcrReportData first = lineData.get(0);

            OsfiLcrMetricReportDto dto = new OsfiLcrMetricReportDto();
            mapReportLineFields(dto, first);

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

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private Map<String, List<LcrReportData>> groupByLineCode(List<LcrReportData> dataList) {
        return dataList.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getReportLine().getReportLineCode(),
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

    private void mapReportLineFields(OsfiLcrReportDto dto, LcrReportData data) {
        dto.setReportCode(data.getReportLine().getReportCode());
        dto.setParaCode(data.getReportLine().getParaCode());
        dto.setReportLineLevelCode01(data.getReportLine().getReportLineLevelCode01());
        dto.setReportLineLevelDesc01(data.getReportLine().getReportLineLevelDesc01());
        dto.setReportLineLevelCode02(data.getReportLine().getReportLineLevelCode02());
        dto.setReportLineLevelDesc02(data.getReportLine().getReportLineLevelDesc02());
        dto.setReportLineCode(data.getReportLine().getReportLineCode());
        dto.setReportLineName(data.getReportLine().getReportLineName());
    }

    private void mapReportLineFields(OsfiLcrMetricReportDto dto, LcrReportData data) {
        dto.setReportCode(data.getReportLine().getReportCode());
        dto.setParaCode(data.getReportLine().getParaCode());
        dto.setReportLineLevelCode01(data.getReportLine().getReportLineLevelCode01());
        dto.setReportLineLevelDesc01(data.getReportLine().getReportLineLevelDesc01());
        dto.setReportLineLevelCode02(data.getReportLine().getReportLineLevelCode02());
        dto.setReportLineLevelDesc02(data.getReportLine().getReportLineLevelDesc02());
        dto.setReportLineCode(data.getReportLine().getReportLineCode());
        dto.setReportLineName(data.getReportLine().getReportLineName());
    }

    private OsfiLcrDateDataDto toLcrDateData(LcrReportData d) {
        OsfiLcrDateDataDto dd = new OsfiLcrDateDataDto();
        dd.setDateSkey(d.getDateSkey());
        dd.setCalendarDate(d.getCalendarDate().toString());
        dd.setAmountRptCcy(d.getAmountRptCcy());
        return dd;
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

