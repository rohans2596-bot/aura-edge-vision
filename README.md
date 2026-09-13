# Aura Edge Vision Intelligence

> **High-Performance Multimodal Computer Vision Pipeline**  
> Engineered by **ROHAN S** — Full Stack Developer & AI Enthusiast

[![Inference Latency](https://img.shields.io/badge/inference-18ms-brightgreen.svg)](#)
[![Model](https://img.shields.io/badge/backbone-YOLO--Edge%20INT8-blue.svg)](#)
[![WebRTC](https://img.shields.io/badge/stream-60FPS%20Canvas-orange.svg)](#)

---

## Overview

**Aura Edge Vision Intelligence** is an embedded real-time computer vision inference engine engineered to run directly within browser clients and low-power edge accelerators. It features live WebRTC webcam ingestion, synthetic video test streams, bounding box spatial localization, confidence threshold modulation, and continuous FPS performance telemetry.

### Key Capabilities

- **Real-Time Edge Detection**: Evaluates incoming frames with sub-20ms latency using quantized INT8 tensor representations.
- **WebRTC Camera & Synthetic Feed**: Toggle seamlessly between live user camera input and high-definition synthetic surveillance/traffic feeds.
- **Dynamic Spatial Overlays**: Bounding boxes with classification tags (`person`, `face`, `hardware`, `sensor`), confidence scores, and centroid trackers.
- **Live Performance HUD**: Instant feedback on frame processing times, memory throughput, and detection density.

---

## Quick Start

```bash
git clone https://github.com/rohans2596-bot/aura-edge-vision.git
cd aura-edge-vision
npm start
```

Access the app at `http://localhost:3000/apps/aura-vision`.

---

## License
MIT License © 2026 Rohan S.
