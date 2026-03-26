from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "converted-import-package"

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

DATE_PATTERN = re.compile(r"施工日报（(\d{4})年(\d{1,2})月(\d{1,2})日）")
PHONE_PATTERN = re.compile(r"1\d{10}")


@dataclass
class ReportRow:
    report_id: str
    report_day: int
    author: str
    work_area_ids: list[str]
    completed_summary: str
    next_plan: str
    weather: str
    labor_count: int
    machine_count: int
    notes: str


@dataclass
class ResourceRow:
    id: str
    work_area_id: str
    resource_type: str
    resource_name: str
    quantity: float
    unit: str
    record_day: int
    supplier: str
    notes: str


def main() -> None:
    files = sorted(ROOT.glob("*.xlsx"))
    reports: list[ReportRow] = []
    resource_logs: list[ResourceRow] = []
    manifest: list[dict[str, object]] = []

    for index, path in enumerate(files, start=1):
        extracted = extract_report(path, index)
        reports.append(extracted["report"])
        resource_logs.extend(extracted["resource_logs"])
        manifest.append(extracted["manifest"])

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    write_reports(reports, OUTPUT_DIR / "daily_reports.csv")
    write_resource_logs(resource_logs, OUTPUT_DIR / "resource_logs.csv")
    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUTPUT_DIR / "README.md").write_text(build_readme(reports, resource_logs, manifest), encoding="utf-8")

    print(
        {
            "reports": len(reports),
            "resource_logs": len(resource_logs),
            "output_dir": str(OUTPUT_DIR),
        }
    )


def extract_report(path: Path, index: int) -> dict[str, object]:
    title, rows = read_first_sheet(path)
    report_day = parse_report_day(title, index)
    sections = parse_sections(rows)
    completed_parts: list[str] = []
    next_plan_parts: list[str] = []
    note_parts: list[str] = []
    resource_logs: list[ResourceRow] = []
    work_area_ids: list[str] = []

    for section in sections:
        work_area_name = section["work_area_name"]
        work_area_id = map_work_area(work_area_name)
        if work_area_id not in work_area_ids:
            work_area_ids.append(work_area_id)
        completed = section["completed_summary"]
        next_plan = section["next_plan"]
        cumulative = section["cumulative_summary"]
        completed_parts.append(f"{work_area_name}: {completed}")
        if next_plan:
            next_plan_parts.append(f"{work_area_name}: {next_plan}")
        if cumulative:
            note_parts.append(f"{work_area_name}累计: {cumulative}")
        if section["contact_summary"]:
            note_parts.append(f"{work_area_name}联系: {section['contact_summary']}")
        if section["supervisor"]:
            note_parts.append(f"{work_area_name}监理: {section['supervisor']}")

        if section["labor_count"] is not None:
            resource_logs.append(
                ResourceRow(
                    id="",
                    work_area_id=work_area_id,
                    resource_type="labor",
                    resource_name="班组人数",
                    quantity=float(section["labor_count"]),
                    unit="person",
                    record_day=report_day,
                    supplier=work_area_name,
                    notes=f"from_daily_report={path.name}",
                )
            )
        if section["machine_count"] > 0:
            resource_logs.append(
                ResourceRow(
                    id="",
                    work_area_id=work_area_id,
                    resource_type="machine",
                    resource_name="机械设备",
                    quantity=float(section["machine_count"]),
                    unit="set",
                    record_day=report_day,
                    supplier=work_area_name,
                    notes=f"from_daily_report={path.name}; detail={section['machine_summary']}",
                )
            )

    report = ReportRow(
        report_id="",
        report_day=report_day,
        author="日报导入",
        work_area_ids=work_area_ids,
        completed_summary="；".join(filter(None, completed_parts)),
        next_plan="；".join(filter(None, next_plan_parts)),
        weather="",
        labor_count=sum(section["labor_count"] or 0 for section in sections),
        machine_count=sum(section["machine_count"] for section in sections),
        notes=f"source_file={path.name}; " + "；".join(filter(None, note_parts)),
    )

    return {
        "report": report,
        "resource_logs": resource_logs,
        "manifest": {
            "file": path.name,
            "report_day": report_day,
            "section_count": len(sections),
            "resource_log_count": len(resource_logs),
            "work_areas": [section["work_area_name"] for section in sections],
        },
    }


def read_first_sheet(path: Path) -> tuple[str, list[list[str]]]:
    with ZipFile(path) as zf:
        shared_strings = load_shared_strings(zf)
        workbook = ET.fromstring(zf.read("xl/workbook.xml"))
        rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
        first_sheet = workbook.find("main:sheets/main:sheet", NS)
        if first_sheet is None:
            raise ValueError(f"No worksheet found in {path.name}")
        rid = first_sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        target = "xl/" + rel_map[rid].lstrip("/")
        sheet = ET.fromstring(zf.read(target))
        rows = sheet_to_rows(sheet, shared_strings)
        title = rows[0][0] if rows and rows[0] and rows[0][0] else path.stem
        return title, rows


def load_shared_strings(zf: ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    items: list[str] = []
    for node in root.findall("main:si", NS):
        items.append("".join(text.text or "" for text in node.iterfind(".//main:t", NS)).replace("\xa0", " ").strip())
    return items


def sheet_to_rows(sheet: ET.Element, shared_strings: list[str]) -> list[list[str]]:
    rows: list[list[str]] = []
    for row in sheet.findall("main:sheetData/main:row", NS):
        cells: dict[int, str] = {}
        for cell in row.findall("main:c", NS):
            ref = cell.attrib.get("r", "")
            col = col_to_num("".join(ch for ch in ref if ch.isalpha()))
            value = read_cell_value(cell, shared_strings)
            if value != "":
                cells[col] = value
        if not cells:
            rows.append([])
            continue
        max_col = max(cells)
        row_values = [cells.get(i, "") for i in range(1, max_col + 1)]
        rows.append(row_values)
    return rows


def read_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        text = "".join(node.text or "" for node in cell.iterfind(".//main:t", NS))
        return clean_text(text)
    value = cell.find("main:v", NS)
    if value is None or value.text is None:
        return ""
    raw = value.text
    if cell_type == "s":
        idx = int(raw)
        return clean_text(shared_strings[idx] if idx < len(shared_strings) else raw)
    return clean_text(raw)


def parse_sections(rows: list[list[str]]) -> list[dict[str, object]]:
    sections: list[dict[str, object]] = []
    current_work_area = ""
    for row in rows[2:]:
        if not row:
            continue
        first = row[0] if len(row) >= 1 else ""
        second = row[1] if len(row) >= 2 else ""
        third = row[2] if len(row) >= 3 else ""
        completed = row[3] if len(row) >= 4 else ""
        next_plan = row[5] if len(row) >= 6 else ""
        labor_raw = row[6] if len(row) >= 7 else ""
        machine_raw = row[7] if len(row) >= 8 else ""
        contact_raw = row[8] if len(row) >= 9 else ""
        supervisor_raw = row[9] if len(row) >= 10 else ""
        cumulative_raw = row[10] if len(row) >= 11 else ""

        if first and "工区" in first:
            current_work_area = first
        if not completed and not next_plan and not machine_raw and not cumulative_raw and not third:
            continue
        work_area_name = third or current_work_area or "未分类工区"
        sections.append(
            {
                "work_area_name": work_area_name,
                "completed_summary": completed,
                "next_plan": next_plan,
                "labor_count": parse_labor_count(labor_raw),
                "machine_count": count_machine_units(machine_raw),
                "machine_summary": machine_raw,
                "contact_summary": summarize_contacts(contact_raw),
                "supervisor": supervisor_raw,
                "cumulative_summary": cumulative_raw,
                "sequence": second,
            }
        )
    return sections


def map_work_area(work_area_name: str) -> str:
    mapping = {
        "七秩塘桥": "wa_qqtq_r",
        "马宅大桥": "wa_mzdq",
        "横路店大桥": "wa_hlddq_r",
        "梁板预制场": "wa_mzdq",
        "路基1工区": "wa_lm300",
        "路基2工区": "wa_lm300",
        "路基3工区": "wa_lm300",
        "路基4工区": "wa_lm300",
        "桥梁工区": "wa_mzdq",
    }
    for key, value in mapping.items():
        if key in work_area_name:
            return value
    return "wa_lm300"


def parse_report_day(title: str, fallback_index: int) -> int:
    match = DATE_PATTERN.search(title)
    if not match:
        return fallback_index
    year, month, day = (int(part) for part in match.groups())
    return month * 100 + day if year else fallback_index


def parse_labor_count(value: str) -> int | None:
    value = clean_text(value)
    if value == "":
        return None
    match = re.search(r"\d+", value)
    return int(match.group(0)) if match else None


def count_machine_units(value: str) -> int:
    value = clean_text(value)
    if value == "":
        return 0
    total = 0
    for number in re.findall(r"(\d+)\s*(?:台|辆|套)", value):
        total += int(number)
    if total == 0:
        for number in re.findall(r"\d+", value):
            total += int(number)
    return total


def summarize_contacts(value: str) -> str:
    value = clean_text(value)
    if value == "":
        return ""
    phones = PHONE_PATTERN.findall(value)
    return " / ".join(phones[:3]) if phones else value[:120]


def clean_text(value: object) -> str:
    text = str(value or "").replace("\xa0", " ").replace("\n", " ").strip()
    return re.sub(r"\s+", " ", text)


def col_to_num(col: str) -> int:
    result = 0
    for ch in col:
        result = result * 26 + (ord(ch.upper()) - 64)
    return result


def write_reports(rows: list[ReportRow], path: Path) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["id", "report_day", "author", "work_area_ids", "completed_summary", "next_plan", "weather", "labor_count", "machine_count", "notes"])
        for row in rows:
            writer.writerow(
                [
                    row.report_id,
                    row.report_day,
                    row.author,
                    "|".join(row.work_area_ids),
                    row.completed_summary,
                    row.next_plan,
                    row.weather,
                    row.labor_count,
                    row.machine_count,
                    row.notes,
                ]
            )


def write_resource_logs(rows: list[ResourceRow], path: Path) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["id", "work_area_id", "resource_type", "resource_name", "quantity", "unit", "record_day", "supplier", "notes"])
        for row in rows:
            writer.writerow([row.id, row.work_area_id, row.resource_type, row.resource_name, row.quantity, row.unit, row.record_day, row.supplier, row.notes])


def build_readme(reports: list[ReportRow], resource_logs: list[ResourceRow], manifest: list[dict[str, object]]) -> str:
    return "\n".join(
        [
            "# 日报抽取结果",
            "",
            "这批文件由 `extract_daily_reports.py` 从施工日报提取生成。",
            "",
            f"- 日报数量: {len(reports)}",
            f"- 资源投入记录数: {len(resource_logs)}",
            f"- 来源文件数: {len(manifest)}",
            "",
            "输出文件：",
            "- `daily_reports.csv`",
            "- `resource_logs.csv`",
            "- `manifest.json`",
            "",
            "说明：",
            "- 当前只抽取适合映射到 `daily_reports` 和 `resource_logs` 的结构化字段。",
            "- `work_area_id` 采用规则映射，默认桥梁工区/马宅大桥归到 `wa_mzdq`，路基工区归到 `wa_lm300`。",
            "- 累计完成情况先保留在 `notes` 中，暂不自动写入工程量。",
            "- `report_day` 采用 `月*100+日` 的简化业务日编码。",
        ]
    )


if __name__ == "__main__":
    main()
