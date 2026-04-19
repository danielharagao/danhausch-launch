import json
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ScenarioRunRequest(BaseModel):
    run_key: str | None = None
    model_name: str = "predictive-history-core"
    model_version: str | None = "v1"
    scenario_name: str = "default"
    seed: int | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)
    result_summary: dict[str, Any] = Field(default_factory=dict)
    created_by: str | None = "api"

    def parameters_json(self) -> str:
        return json.dumps(self.parameters)

    def result_summary_json(self) -> str:
        return json.dumps(self.result_summary)


class ScenarioRunResponse(BaseModel):
    id: UUID
    run_key: str | None
    model_name: str
    scenario_name: str | None
    status: str
    created_at: datetime
    result_summary: dict[str, Any] | None


class NetworkSnapshotResponse(BaseModel):
    as_of: str | None
    active_players: int
    active_groups: int
    active_relations: int
    top_groups: list[dict[str, Any]]


class ExplainTopDriversResponse(BaseModel):
    drivers: list[dict[str, Any]]


class PresetBase(BaseModel):
    name: str
    description: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)


class PresetCreate(PresetBase):
    created_by: str | None = "api"

    def payload_json(self) -> str:
        return json.dumps(self.payload)


class PresetUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    payload: dict[str, Any] | None = None
    tags: list[str] | None = None

    def payload_json(self) -> str:
        return json.dumps(self.payload)


class PresetOut(PresetBase):
    id: UUID
    created_by: str | None
    created_at: datetime
    updated_at: datetime
