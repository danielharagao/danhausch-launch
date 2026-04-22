from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "dev"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/predictive_history"

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://danielharagao.github.io",
            "https://danhausch.cloud",
        ]
    )
    cors_origin_regex: str = r"https://.*\.github\.io"

    admin_delete_token: str = ""
    docs_root_path: str = "/root/.openclaw/workspace/launch-repo/docs"


settings = Settings()
