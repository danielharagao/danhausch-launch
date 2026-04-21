# V6 Events Pack — Wars & Geopolitical Conflict (2020–2025)

This addendum enriches the simulation with high-impact conflict events from the last 5 years, with explicit coverage of:
- Russia–Ukraine war (multi-phase escalation)
- Iran escalation dynamics (including proxy conflicts)
- Strait of Hormuz disruption/blockade risk
- Taiwan Strait crisis cycles
- Adjacent high-impact regional conflict spillovers

## Added Events (integrated into `events.v4.json` and seed `v5`)

| ID | Date | Focus | Why it matters for the model |
|---|---|---|---|
| `ukraine-war-grain-corridor-collapse-2023` | 2023-07 | Black Sea food/trade security | Raises trade disruption, inflation pressure, and grievance in food-insecure groups. |
| `iran-proxy-escalation-regional-2023` | 2023-11 | Iran-aligned proxy escalation | Captures regionalized conflict diffusion and institutional legitimacy stress. |
| `us-uk-strikes-houthi-yemen-2024` | 2024-01 | Red Sea intervention cycle | Converts maritime insecurity into trade/inflation shocks with geopolitical volatility. |
| `iran-israel-direct-strike-cycle-2024` | 2024-04 | Direct Iran–Israel confrontation | Models rare state-to-state direct escalation risk and confidence shock. |
| `hormuz-seizure-and-jamming-incidents-2024` | 2024-04 | Hormuz chokepoint risk | Encodes blockade-risk premium via trade contraction + energy-driven inflation impulse. |
| `taiwan-strait-joint-sword-2024` | 2024-05 | Encirclement drill signaling | Captures semicon/logistics fragility and deterrence-volatility loop. |
| `ukraine-russia-crossborder-escalation-2024` | 2024-08 | War intensification phase | Extends attrition model with renewed volatility and macro spillovers. |
| `lebanon-israel-frontier-war-risk-2024` | 2024-09 | Multi-front Levant risk | Adds displacement/grievance dynamics and confidence deterioration. |
| `russia-north-korea-arms-axis-2024` | 2024-06 | Conflict endurance axis | Represents external rearmament channel that prolongs conflict tempo. |

## Modeling rationale

1. **Conflict now propagates through chokepoints** (Black Sea, Red Sea, Hormuz, Taiwan maritime envelope), not only frontlines.
2. **Proxy networks are first-order drivers** of volatility and mobilization, especially in MENA.
3. **War shocks are multi-domain**: security events now map to trade, inflation, confidence, legitimacy, and social grievance simultaneously.
4. **Last-5-years coverage** is reinforced with explicit event markers that can be scheduled in campaigns and scenario tests.

## Compatibility notes

- Event objects include complete fields: `date`, `atStep`, `intensity`, `scope`, `target`, `effects`.
- Engine compatibility preserved: core executor uses `atStep/intensity/effects`; additional fields (`date`, structured `target`) are metadata-safe.
- Seed active version bumped to `5.1.0` to reflect integrated war pack.
