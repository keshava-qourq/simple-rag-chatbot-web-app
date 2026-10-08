"""Unit tests for app.config: fail-fast behaviour and no embedded secrets."""

import pytest

from app import config


def test_validate_required_raises_named_variable(monkeypatch) -> None:
    monkeypatch.delenv("PROVIDER_API_KEY", raising=False)
    monkeypatch.setenv("S3_ENDPOINT", "http://x")
    monkeypatch.setenv("S3_BUCKET", "b")
    monkeypatch.setenv("S3_ACCESS_KEY_ID", "a")
    monkeypatch.setenv("S3_SECRET_ACCESS_KEY", "s")

    with pytest.raises(config.ConfigError, match="PROVIDER_API_KEY"):
        config.validate_required()


def test_validate_required_passes_when_all_set(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "k")
    monkeypatch.setenv("S3_ENDPOINT", "http://x")
    monkeypatch.setenv("S3_BUCKET", "b")
    monkeypatch.setenv("S3_ACCESS_KEY_ID", "a")
    monkeypatch.setenv("S3_SECRET_ACCESS_KEY", "s")

    config.validate_required()  # must not raise


def test_database_url_falls_back_to_sqlite(monkeypatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)

    assert config.get_database_url() == "sqlite:///./app.db"


def test_database_url_reads_from_environment(monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://u:p@host/db")

    assert config.get_database_url() == "postgresql+psycopg://u:p@host/db"


def test_get_provider_api_key_raises_when_missing(monkeypatch) -> None:
    monkeypatch.delenv("PROVIDER_API_KEY", raising=False)

    with pytest.raises(config.ConfigError, match="PROVIDER_API_KEY"):
        config.get_provider_api_key()


def test_get_provider_api_key_returns_value(monkeypatch) -> None:
    monkeypatch.setenv("PROVIDER_API_KEY", "shh")

    assert config.get_provider_api_key() == "shh"


def test_get_s3_config_raises_named_variable_when_missing(monkeypatch) -> None:
    monkeypatch.setenv("S3_ENDPOINT", "http://x")
    monkeypatch.delenv("S3_BUCKET", raising=False)
    monkeypatch.setenv("S3_ACCESS_KEY_ID", "a")
    monkeypatch.setenv("S3_SECRET_ACCESS_KEY", "s")

    with pytest.raises(config.ConfigError, match="S3_BUCKET"):
        config.get_s3_config()


def test_get_s3_config_returns_all_four(monkeypatch) -> None:
    monkeypatch.setenv("S3_ENDPOINT", "http://x")
    monkeypatch.setenv("S3_BUCKET", "b")
    monkeypatch.setenv("S3_ACCESS_KEY_ID", "a")
    monkeypatch.setenv("S3_SECRET_ACCESS_KEY", "s")

    values = config.get_s3_config()

    assert values == {
        "S3_ENDPOINT": "http://x",
        "S3_BUCKET": "b",
        "S3_ACCESS_KEY_ID": "a",
        "S3_SECRET_ACCESS_KEY": "s",
    }


def test_allowed_origins_parses_comma_separated_list(monkeypatch) -> None:
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://a.com, https://b.com")

    assert config.get_allowed_origins() == ["https://a.com", "https://b.com"]


def test_allowed_origins_empty_when_unset(monkeypatch) -> None:
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)

    assert config.get_allowed_origins() == []
