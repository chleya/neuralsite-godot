from __future__ import annotations

import csv
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "actuals-starter-package"
OUTPUT_DIR = ROOT / "work-area-fill-packages"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, str]], headers: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def safe_folder_name(work_area_id: str, work_area_name: str) -> str:
    cleaned = re.sub(r"[\\\\/:*?\"<>|]", "_", work_area_name).strip()
    cleaned = re.sub(r"\s+", "_", cleaned)
    return f"{work_area_id}__{cleaned}"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    work_areas = read_csv(SOURCE_DIR / "work_areas.csv")
    quantities = read_csv(SOURCE_DIR / "quantities.csv")
    resource_logs = read_csv(SOURCE_DIR / "resource_logs.csv")

    quantity_headers = ["id", "work_area_id", "item_name", "item_code", "category", "unit", "planned_quantity", "actual_quantity", "notes"]
    resource_headers = ["id", "work_area_id", "resource_type", "resource_name", "quantity", "unit", "record_day", "supplier", "notes"]
    work_area_headers = ["id", "name", "type", "owner", "planned_progress", "actual_progress", "description"]

    package_count = 0

    for work_area in work_areas:
        work_area_id = work_area["id"]
        folder = OUTPUT_DIR / safe_folder_name(work_area_id, work_area["name"])
        folder.mkdir(parents=True, exist_ok=True)

        quantity_rows = [row for row in quantities if row["work_area_id"] == work_area_id]
        resource_rows = [row for row in resource_logs if row["work_area_id"] == work_area_id]

        write_csv(folder / "work_area.csv", [work_area], work_area_headers)
        write_csv(folder / "quantities.csv", quantity_rows, quantity_headers)
        write_csv(folder / "resource_logs.csv", resource_rows, resource_headers)

        (folder / "README.md").write_text(
            "\n".join(
                [
                    f"# {work_area['name']} 填报包",
                    "",
                    f"- 工作面 ID: `{work_area_id}`",
                    f"- 工作面类型: `{work_area['type']}`",
                    f"- 工程量条目数: {len(quantity_rows)}",
                    f"- 资源投入骨架条目数: {len(resource_rows)}",
                    "",
                    "填写建议：",
                    "- `quantities.csv` 只填写 `actual_quantity`，其他字段尽量不改。",
                    "- `resource_logs.csv` 填写 `quantity`、`record_day`、`supplier`，必要时补充 `notes`。",
                    "- `id` 列保持留空，系统会自动创建。",
                    "- `work_area_id` 不要改写。",
                    "",
                    "导入顺序：",
                    "1. 先确认该工作面已存在于系统。",
                    "2. 导入 `quantities.csv`。",
                    "3. 导入 `resource_logs.csv`。",
                ]
            ),
            encoding="utf-8",
        )

        package_count += 1

    (OUTPUT_DIR / "README.md").write_text(
        "\n".join(
            [
                "# 分工作面填报包",
                "",
                "用途：",
                "- 把总的实际量/资源起始包按工作面拆开，便于分批填报和导入。",
                "- 每个工作面一个目录，包含 `work_area.csv`、`quantities.csv`、`resource_logs.csv`。",
                "",
                f"- 工作面包数量: {package_count}",
            ]
        ),
        encoding="utf-8",
    )

    print({"output_dir": str(OUTPUT_DIR), "package_count": package_count})


if __name__ == "__main__":
    main()
