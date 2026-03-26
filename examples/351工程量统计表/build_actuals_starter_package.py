from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "renamed-import-package-shortcodes"
OUTPUT_DIR = ROOT / "actuals-starter-package"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, str]], headers: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def build_quantities_rows(design_quantities: list[dict[str, str]]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for item in design_quantities:
        rows.append(
            {
                "id": "",
                "work_area_id": item["work_area_id"],
                "item_name": item["item_name"],
                "item_code": item["item_code"],
                "category": item["category"],
                "unit": item["unit"],
                "planned_quantity": item["target_quantity"],
                "actual_quantity": "",
                "notes": f"starter_from_design={item['design_version']}; target_quantity={item['target_quantity']}",
            }
        )
    return rows


def build_resource_rows(work_areas: list[dict[str, str]]) -> list[dict[str, str]]:
    skeleton = [
        ("labor", "施工班组", "person"),
        ("machine", "主要机械", "set"),
        ("material", "主要材料", "t"),
    ]
    rows: list[dict[str, str]] = []
    for work_area in work_areas:
        for resource_type, resource_name, unit in skeleton:
            rows.append(
                {
                    "id": "",
                    "work_area_id": work_area["id"],
                    "resource_type": resource_type,
                    "resource_name": resource_name,
                    "quantity": "",
                    "unit": unit,
                    "record_day": "",
                    "supplier": "",
                    "notes": f"starter_for={work_area['name']}",
                }
            )
    return rows


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    work_areas = read_csv(SOURCE_DIR / "work_areas.csv")
    design_quantities = read_csv(SOURCE_DIR / "design_quantities.csv")

    quantities = build_quantities_rows(design_quantities)
    resource_logs = build_resource_rows(work_areas)

    write_csv(
        OUTPUT_DIR / "work_areas.csv",
        work_areas,
        ["id", "name", "type", "owner", "planned_progress", "actual_progress", "description"],
    )
    write_csv(
        OUTPUT_DIR / "quantities.csv",
        quantities,
        ["id", "work_area_id", "item_name", "item_code", "category", "unit", "planned_quantity", "actual_quantity", "notes"],
    )
    write_csv(
        OUTPUT_DIR / "resource_logs.csv",
        resource_logs,
        ["id", "work_area_id", "resource_type", "resource_name", "quantity", "unit", "record_day", "supplier", "notes"],
    )

    (OUTPUT_DIR / "README.md").write_text(
        "\n".join(
            [
                "# 实际量与资源投入起始填报包",
                "",
                "用途：",
                "- `work_areas.csv`：当前短编码工作面清单",
                "- `quantities.csv`：由设计量自动展开的实际工程量填报起始表",
                "- `resource_logs.csv`：按工作面展开的人机料填报骨架",
                "",
                "建议：",
                "- 在 Excel 中填写 `actual_quantity`、`quantity`、`record_day` 等真实值",
                "- `id` 列留空即可，系统会自动创建",
                "- `work_area_id`、`resource_type` 不要随意改写",
                "",
                f"- 工作面数量: {len(work_areas)}",
                f"- 实际工程量起始条目数: {len(quantities)}",
                f"- 资源投入骨架条目数: {len(resource_logs)}",
            ]
        ),
        encoding="utf-8",
    )

    print(
        {
            "output_dir": str(OUTPUT_DIR),
            "work_areas": len(work_areas),
            "quantities": len(quantities),
            "resource_logs": len(resource_logs),
        }
    )


if __name__ == "__main__":
    main()
