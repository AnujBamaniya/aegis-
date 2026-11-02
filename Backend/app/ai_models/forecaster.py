import torch
from chronos import ChronosBoltPipeline
from typing import List, Dict

try:
    pipeline = ChronosBoltPipeline.from_pretrained(
        "amazon/chronos-bolt-small",
        device_map="cpu",
        dtype=torch.float32,
    )
except Exception as e:
    print(f"Warning: Failed to load Chronos pipeline: {e}")
    pipeline = None

def run_severity_forecast(historical_data: List[float], prediction_length: int = 7) -> Dict[str, List[float]]:
    if not pipeline or not historical_data:
        return {"p10": [], "p50": [], "p90": []}

    context_tensor = torch.tensor(historical_data, dtype=torch.float32).unsqueeze(0)

    # ChronosBoltPipeline uses predict_quantiles directly (shape: [batch, pred_len, num_quantiles])
    quantiles, _ = pipeline.predict_quantiles(
        context_tensor,
        prediction_length=prediction_length,
        quantile_levels=[0.1, 0.5, 0.9],
    )

    q_np = quantiles[0].detach().cpu().numpy()
    p10 = q_np[:, 0].tolist()
    p50 = q_np[:, 1].tolist()
    p90 = q_np[:, 2].tolist()

    return {
        "p10": [round(val, 2) for val in p10],
        "p50": [round(val, 2) for val in p50],
        "p90": [round(val, 2) for val in p90],
    }
