# CivicLens

## AI-Powered Urban Intelligence Platform for Public Transport Fleets

CivicLens is an AI-powered urban intelligence platform that transforms public transport vehicles into mobile civic monitoring units.

The system uses cameras and GPS/GNSS sensors mounted on buses to automatically detect, classify, geolocate, and track urban civic issues such as potholes, garbage, waterlogging, and encroachment.

The detected information is processed through an AI pipeline, enriched with vehicle and location information, assigned a severity level, and sent to a centralized backend for incident management, department routing, and visualization.

---

## 🚀 Project Overview

Urban authorities traditionally depend on manual inspections and citizen complaints to identify infrastructure problems.

This can result in:

- Delayed identification of road and infrastructure damage
- Limited monitoring coverage
- Manual inspection costs
- Difficulty tracking recurring problems
- Delayed communication with responsible departments
- Lack of accurate real-time geographical information

CivicLens addresses this by using existing public transport fleets as **mobile urban sensing platforms**.

Instead of deploying dedicated monitoring vehicles throughout a city, buses already travelling through urban areas can continuously collect visual information and identify civic issues.

---

# 💡 How CivicLens Works

```text
                    BUS
                     │
              Camera + GPS
                     │
                     ▼
             ┌───────────────┐
             │   Edge AI     │
             │   Processing  │
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────┐
             │ YOLO Detection│
             └───────┬───────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Issue Classification │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  Severity Engine    │
          └──────────┬──────────┘
                     │
                     ▼
          Vehicle + GPS + Time
                     │
                     ▼
             ┌───────────────┐
             │ FastAPI Cloud │
             │    Backend    │
             └───────┬───────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ PostgreSQL + PostGIS│
          └──────────┬──────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Incident System       Analytics
          │                     │
          └──────────┬──────────┘
                     ▼
             Urban Dashboard
                  + Map