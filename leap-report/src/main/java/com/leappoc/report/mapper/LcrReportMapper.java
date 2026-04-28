package com.leappoc.report.mapper;

import com.leappoc.report.model.lcr.LcrReportData;
import com.leappoc.report.model.lcr.LcrReportLineLevel;
import com.leappoc.shared.dto.lcr.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class LcrReportMapper {

    public List<OsfiLcrReportDto> toLcrReport(List<LcrReportData> dataList) {
        Map<Long, List<LcrReportData>> byLineId = groupByLineId(dataList);
        List<OsfiLcrReportDto> result = new ArrayList<>();

        for (List<LcrReportData> lineData : byLineId.values()) {
            LcrReportData first = lineData.get(0);

            OsfiLcrReportDto dto = new OsfiLcrReportDto();
            dto.setReportCode(first.getReportLine().getReportCode());
            dto.setParaCode(first.getReportLine().getParaCode());
            dto.setLevels(toLevelDtos(first.getReportLine().getLevels()));
            dto.setReportLineCode(first.getReportLine().getReportLineCode());
            dto.setReportLineName(first.getReportLine().getReportLineName());

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

