#!/usr/bin/env python3
"""Mapeia fontes de dados do funil no workspace."""
from __future__ import annotations

import json
from pathlib import Path
from datetime import datetime, timezone

WORKSPACE = Path('/root/.openclaw/workspace')

CANDIDATES = [
    WORKSPACE / 'launch-repo/tmp/qa-e2e-artifacts/results.json',
    WORKSPACE / 'apps/openclaw-cockpit/data/crm_interactions.json',
    WORKSPACE / 'apps/openclaw-cockpit/data/crm_lead_events.json',
    WORKSPACE / 'apps/openclaw-cockpit/data/crm_lead_status.json',
    WORKSPACE / 'apps/openclaw-cockpit/data/chat_conversations_cache.json',
    WORKSPACE / 'apps/openclaw-cockpit/docs/crm',
]


def sample(path: Path, max_chars: int = 400):
    if path.is_dir():
        files = sorted([p.name for p in path.glob('*') if p.is_file()])[:8]
        return {'files': files, 'file_count': len(files)}
    try:
        txt = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return None
    return txt[:max_chars]


def main() -> None:
    out = {
        'generated_at_utc': datetime.now(timezone.utc).isoformat(),
        'sources': [],
    }
    for p in CANDIDATES:
        exists = p.exists()
        info = {
            'path': str(p),
            'exists': exists,
        }
        if exists:
            st = p.stat()
            info['size_bytes'] = st.st_size
            info['modified_at_utc'] = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat()
            info['sample'] = sample(p)
        out['sources'].append(info)

    out_dir = WORKSPACE / 'launch-repo/docs/assets/analytics'
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'sources-inventory.json').write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    print(f"OK: {out_dir / 'sources-inventory.json'}")


if __name__ == '__main__':
    main()
