# Predictive History - Analytical Queries (V2)

Consultas de referência para exploração analítica no modelo v2.

---

## 1) Top influenciadores (janela móvel 90 dias)

```sql
SELECT
  pif.player_id,
  pif.player_name,
  pif.events_90d,
  pif.active_relations_90d,
  ROUND(pif.avg_influence_90d::numeric, 4) AS avg_influence_90d,
  ROUND((0.5 * pif.avg_influence_90d + 0.3 * pif.avg_reputation_90d + 0.2 * LEAST(pif.events_90d, 20) / 20)::numeric, 4) AS composite_influence_score
FROM vw_player_influence_features pif
ORDER BY composite_influence_score DESC, pif.events_90d DESC
LIMIT 20;
```

---

## 2) Risco por região (últimos 30 dias)

```sql
SELECT
  vrf.region,
  COUNT(*) AS observed_days,
  SUM(vrf.destabilizing_events) AS destabilizing_events_30d,
  ROUND(AVG(vrf.avg_risk_index)::numeric, 4) AS mean_risk_index_30d,
  ROUND(MAX(vrf.avg_risk_index)::numeric, 4) AS peak_risk_index_30d,
  ROUND(AVG(vrf.avg_event_confidence)::numeric, 4) AS mean_confidence_30d
FROM vw_region_risk_features vrf
WHERE vrf.day >= date_trunc('day', NOW() - INTERVAL '30 days')
GROUP BY vrf.region
ORDER BY mean_risk_index_30d DESC NULLS LAST, destabilizing_events_30d DESC;
```

---

## 3) Sinal de ruptura de coalizão

Identifica grupos com queda recente de estabilidade + presença de evento `coalition_break`.

```sql
WITH stability AS (
  SELECT
    i.entity_id AS group_id,
    AVG(i.value_numeric) FILTER (WHERE i.indicator_time >= NOW() - INTERVAL '30 days') AS stability_30d,
    AVG(i.value_numeric) FILTER (WHERE i.indicator_time >= NOW() - INTERVAL '120 days' AND i.indicator_time < NOW() - INTERVAL '30 days') AS stability_prev_90d
  FROM indicators i
  WHERE i.entity_kind = 'group'
    AND i.indicator_type = 'coalition_stability'
  GROUP BY i.entity_id
), rupture_events AS (
  SELECT
    ep.group_id,
    COUNT(*) FILTER (WHERE e.event_type = 'coalition_break' AND e.event_time >= NOW() - INTERVAL '90 days') AS ruptures_90d
  FROM event_participants ep
  JOIN events e ON e.id = ep.event_id
  WHERE ep.group_id IS NOT NULL
  GROUP BY ep.group_id
)
SELECT
  g.name AS coalition_name,
  ROUND(s.stability_prev_90d::numeric, 4) AS stability_prev_90d,
  ROUND(s.stability_30d::numeric, 4) AS stability_30d,
  ROUND((s.stability_30d - s.stability_prev_90d)::numeric, 4) AS delta_stability,
  COALESCE(r.ruptures_90d, 0) AS ruptures_90d,
  CASE
    WHEN COALESCE(r.ruptures_90d, 0) >= 1 AND (s.stability_30d - s.stability_prev_90d) <= -0.15 THEN 'critical'
    WHEN COALESCE(r.ruptures_90d, 0) >= 1 OR (s.stability_30d - s.stability_prev_90d) <= -0.10 THEN 'warning'
    ELSE 'stable'
  END AS rupture_signal
FROM groups g
LEFT JOIN stability s ON s.group_id = g.id
LEFT JOIN rupture_events r ON r.group_id = g.id
WHERE g.group_type IN ('coalition', 'forum', 'alliance')
ORDER BY rupture_signal DESC, delta_stability ASC NULLS LAST;
```

---

## 4) Tendência temporal de risco (semanal)

```sql
SELECT
  date_trunc('week', i.indicator_time) AS week,
  COALESCE(e.payload->>'region', 'unknown') AS region,
  ROUND(AVG(i.value_numeric)::numeric, 4) AS risk_index_avg,
  ROUND(percentile_cont(0.9) WITHIN GROUP (ORDER BY i.value_numeric)::numeric, 4) AS risk_index_p90,
  COUNT(*) AS observations
FROM indicators i
LEFT JOIN events e ON e.id = i.source_event_id
WHERE i.indicator_type = 'risk_index'
  AND i.indicator_time >= NOW() - INTERVAL '24 weeks'
GROUP BY 1, 2
ORDER BY week DESC, risk_index_avg DESC;
```

---

## 5) Narrativas dominantes por tema e região

```sql
SELECT
  nt.theme_name,
  COALESCE(n.metadata->>'region', 'unknown') AS region,
  COUNT(*) AS narratives,
  ROUND(AVG(COALESCE(ntl.weight, 0))::numeric, 4) AS avg_theme_weight,
  ROUND(AVG(COALESCE(n.confidence, 0))::numeric, 4) AS avg_narrative_confidence
FROM narratives n
JOIN narrative_theme_links ntl ON ntl.narrative_id = n.id
JOIN narrative_themes nt ON nt.id = ntl.theme_id
WHERE n.narrative_time >= NOW() - INTERVAL '90 days'
GROUP BY nt.theme_name, COALESCE(n.metadata->>'region', 'unknown')
ORDER BY narratives DESC, avg_theme_weight DESC;
```
