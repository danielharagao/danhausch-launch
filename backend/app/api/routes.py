from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import (
    ExplainTopDriversResponse,
    NetworkSnapshotResponse,
    PresetCreate,
    PresetOut,
    PresetUpdate,
    ScenarioRunRequest,
    ScenarioRunResponse,
)

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    database = "up"
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        database = "down"
    return {"status": "ok", "service": "predictive-history-backend", "database": database}


@router.post("/api/scenario/run", response_model=ScenarioRunResponse, status_code=status.HTTP_201_CREATED)
def scenario_run(payload: ScenarioRunRequest, db: Session = Depends(get_db)) -> ScenarioRunResponse:
    query = text(
        """
        INSERT INTO simulation_runs (
            run_key, model_name, model_version, scenario_name, status,
            started_at, finished_at, seed, parameters, result_summary, created_by
        ) VALUES (
            :run_key, :model_name, :model_version, :scenario_name, 'finished',
            NOW(), NOW(), :seed, CAST(:parameters AS JSONB), CAST(:result_summary AS JSONB), :created_by
        )
        RETURNING id, run_key, model_name, scenario_name, status, created_at, result_summary
        """
    )
    try:
        row = db.execute(
            query,
            {
                "run_key": payload.run_key,
                "model_name": payload.model_name,
                "model_version": payload.model_version,
                "scenario_name": payload.scenario_name,
                "seed": payload.seed,
                "parameters": payload.parameters_json(),
                "result_summary": payload.result_summary_json(),
                "created_by": payload.created_by,
            },
        ).mappings().one()
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"unable to create run: {exc}") from exc

    return ScenarioRunResponse.model_validate(row)


@router.get("/api/network/snapshot", response_model=NetworkSnapshotResponse)
def network_snapshot(
    as_of: str | None = Query(default=None, description="ISO timestamp (optional)"),
    db: Session = Depends(get_db),
) -> NetworkSnapshotResponse:
    as_of_expr = "CAST(:as_of AS timestamptz)" if as_of else "NOW()"

    players_count_q = text(f"SELECT COUNT(*) FROM players WHERE status = 'active' ")
    groups_count_q = text("SELECT COUNT(*) FROM groups WHERE status = 'active'")
    relations_count_q = text(
        f"""
        SELECT COUNT(*)
        FROM player_relations
        WHERE valid_from <= {as_of_expr}
          AND (valid_to IS NULL OR valid_to > {as_of_expr})
        """
    )
    top_groups_q = text(
        f"""
        SELECT g.id::text, g.name, COUNT(gm.player_id)::int AS active_members
        FROM groups g
        LEFT JOIN group_memberships gm ON gm.group_id = g.id
         AND gm.valid_from <= {as_of_expr}
         AND (gm.valid_to IS NULL OR gm.valid_to > {as_of_expr})
        GROUP BY g.id, g.name
        ORDER BY active_members DESC, g.name ASC
        LIMIT 5
        """
    )

    params = {"as_of": as_of} if as_of else {}
    players = db.execute(players_count_q).scalar_one()
    groups = db.execute(groups_count_q).scalar_one()
    relations = db.execute(relations_count_q, params).scalar_one()
    top_groups = [dict(row) for row in db.execute(top_groups_q, params).mappings().all()]

    return NetworkSnapshotResponse(
        as_of=as_of,
        active_players=players,
        active_groups=groups,
        active_relations=relations,
        top_groups=top_groups,
    )


@router.get("/api/explain/top-drivers", response_model=ExplainTopDriversResponse)
def explain_top_drivers(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
) -> ExplainTopDriversResponse:
    query = text(
        """
        SELECT
          i.indicator_type,
          AVG(i.value_numeric) AS avg_value,
          COUNT(*)::int AS samples
        FROM indicators i
        WHERE i.value_numeric IS NOT NULL
          AND i.indicator_time >= NOW() - INTERVAL '90 days'
        GROUP BY i.indicator_type
        HAVING COUNT(*) >= 1
        ORDER BY AVG(i.value_numeric) DESC NULLS LAST
        LIMIT :limit
        """
    )
    rows = db.execute(query, {"limit": limit}).mappings().all()
    return ExplainTopDriversResponse(drivers=[dict(r) for r in rows])


@router.post("/api/presets", response_model=PresetOut, status_code=status.HTTP_201_CREATED)
def create_preset(payload: PresetCreate, db: Session = Depends(get_db)) -> PresetOut:
    query = text(
        """
        INSERT INTO api_presets (name, description, payload, tags, created_by)
        VALUES (:name, :description, CAST(:payload AS JSONB), :tags, :created_by)
        RETURNING id, name, description, payload, tags, created_by, created_at, updated_at
        """
    )
    row = db.execute(
        query,
        {
            "name": payload.name,
            "description": payload.description,
            "payload": payload.payload_json(),
            "tags": payload.tags,
            "created_by": payload.created_by,
        },
    ).mappings().one()
    db.commit()
    return PresetOut.model_validate(row)


@router.get("/api/presets", response_model=list[PresetOut])
def list_presets(db: Session = Depends(get_db)) -> list[PresetOut]:
    rows = db.execute(
        text(
            """
            SELECT id, name, description, payload, tags, created_by, created_at, updated_at
            FROM api_presets
            ORDER BY created_at DESC
            """
        )
    ).mappings().all()
    return [PresetOut.model_validate(r) for r in rows]


@router.get("/api/presets/{preset_id}", response_model=PresetOut)
def get_preset(preset_id: UUID, db: Session = Depends(get_db)) -> PresetOut:
    row = db.execute(
        text(
            """
            SELECT id, name, description, payload, tags, created_by, created_at, updated_at
            FROM api_presets
            WHERE id = :preset_id
            """
        ),
        {"preset_id": str(preset_id)},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="preset not found")
    return PresetOut.model_validate(row)


@router.put("/api/presets/{preset_id}", response_model=PresetOut)
def update_preset(preset_id: UUID, payload: PresetUpdate, db: Session = Depends(get_db)) -> PresetOut:
    existing = db.execute(
        text("SELECT id FROM api_presets WHERE id = :preset_id"),
        {"preset_id": str(preset_id)},
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="preset not found")

    row = db.execute(
        text(
            """
            UPDATE api_presets
            SET name = COALESCE(:name, name),
                description = COALESCE(:description, description),
                payload = COALESCE(CAST(:payload AS JSONB), payload),
                tags = COALESCE(:tags, tags),
                updated_at = NOW()
            WHERE id = :preset_id
            RETURNING id, name, description, payload, tags, created_by, created_at, updated_at
            """
        ),
        {
            "preset_id": str(preset_id),
            "name": payload.name,
            "description": payload.description,
            "payload": payload.payload_json() if payload.payload is not None else None,
            "tags": payload.tags,
        },
    ).mappings().one()
    db.commit()
    return PresetOut.model_validate(row)


@router.delete("/api/presets/{preset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_preset(preset_id: UUID, db: Session = Depends(get_db)) -> Response:
    result = db.execute(
        text("DELETE FROM api_presets WHERE id = :preset_id"),
        {"preset_id": str(preset_id)},
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="preset not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
