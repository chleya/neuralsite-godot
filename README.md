# NeuralSite Godot Project

4D Construction Simulator - Godot 4.3

## Quick Start

1. Download Godot 4.3: https://godotengine.org/download
2. Extract and run godot.exe
3. Click "Import" and select this folder
4. Press F5 to run

## Project Structure

```
neuralsite-godot/
├── project.godot          # Project definition
├── scenes/
│   └── Main.tscn        # Main scene
├── scripts/
│   ├── Main.gd         # Main controller
│   ├── APIClient.gd    # Backend API client
│   └── EventBus.gd    # Event-driven state
└── resources/
```

## Features

- [x] Time slider controls construction progress
- [x] Live/Simulate mode toggle
- [x] Event-driven state management
- [x] API client for backend integration
- [x] Simple 3D road segments

## Controls

- **F5**: Run project
- **Hold UI Accept (Space)**: Rotate camera around scene
- **Slider**: Control timeline/progress

## Connecting to Backend

Edit `scripts/APIClient.gd`:
```gdscript
var base_url: String = "http://localhost:8000"
```

## Next Steps

1. Import road model from Blender (GLTF format)
2. Add more road segments
3. Connect to real backend API
4. Add photo upload
5. Web export

## Integration with NeuralSite Backend

The project connects to your existing FastAPI backend:

```
Godot Client → HTTP → FastAPI → PostgreSQL/PostGIS
                      ↑
                 WebSocket
```

API endpoints used:
- `GET /api/v1/spacetime/query?station={id}`
- `POST /api/v1/spacetime/events`
- `GET /api/v1/spatial/stations`
