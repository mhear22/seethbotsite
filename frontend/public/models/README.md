# Mech 3D Models

This directory contains 3D models for mech parts in GLB/GLTF format.

## Directory Structure

```
models/
├── arms/           # Arm weapon models
│   ├── autocannon.glb
│   ├── railgun.glb
│   ├── pile-driver.glb
│   ├── missile-pod.glb
│   ├── flamethrower.glb
│   └── shield-generator.glb
├── core/           # Core/torso models
│   ├── diesel-generator.glb
│   ├── fusion-reactor.glb
│   ├── gas-turbine.glb
│   └── capacitor-bank.glb
├── legs/           # Leg/chassis models
│   ├── bipedal-standard.glb
│   ├── tracked-heavy.glb
│   ├── hover-system.glb
│   └── quadrupedal.glb
├── head/           # Head/sensor models
│   ├── standard-optics.glb
│   ├── targeting-array.glb
│   ├── reinforced-pod.glb
│   └── scout-suite.glb
└── rack/           # Rack/backpack models
    ├── smoke-launcher.glb
    ├── ammo-feed.glb
    ├── jump-jets.glb
    └── repair-drone.glb
```

## Model Requirements

### Format
- Use **GLB** (binary GLTF) format for optimal loading performance
- Alternatively, use **GLTF** with embedded resources

### Scale & Units
- 1 unit = 1 meter
- Models should fit within these bounding boxes:

| Part Type | Max Dimensions (W x H x D) |
|-----------|----------------------------|
| Arms      | 1.0 x 2.5 x 1.0 units      |
| Core      | 2.5 x 3.5 x 2.5 units      |
| Legs      | 2.0 x 2.0 x 2.0 units      |
| Head      | 1.5 x 1.5 x 1.5 units      |
| Rack      | 1.0 x 1.0 x 0.5 units      |

### Origin Point
- Each model's origin should be at the **attachment point**
- The `MechModelLoader` will position parts using `MODEL_ATTACH_POINTS`

### Materials
- Use **PBR materials** (Metallic-Roughness workflow)
- Include:
  - Base color texture
  - Metallic/Roughness texture
  - Normal map (optional)
  - Emissive texture (optional, for energy weapons)

### Naming Convention
- Use kebab-case matching the part ID without the prefix
- Example: `arm-autocannon-mk1` → `arms/autocannon.glb`

## Adding New Models

1. Create your model in Blender, Maya, or other 3D software
2. Export as GLB with these settings:
   - Apply modifiers
   - Include materials and textures
   - Use compression if available
3. Place in the appropriate subdirectory
4. Update `MechParts.ts` to include the `modelPath`

## Fallback Behavior

If a model file is missing or fails to load, the `MechModelLoader` automatically falls back to procedural geometry. This ensures the game remains playable even without 3D models.

### Procedural Models

The system includes detailed procedural models defined in `/lib/battle/ProceduralModels.ts` that provide:

- **Manufacturer-specific materials**: Each manufacturer (ArmsCore, VoltTech, TitanForge, etc.) has distinct visual styling
- **Detailed geometry**: Complex shapes with multiple components (barrels, housings, energy effects)
- **Part-specific designs**: Each of the 20 parts has a unique procedural model
- **Team color integration**: Procedural models can be tinted with team colors
- **Energy effects**: Glowing emissive materials for energy weapons and high-tech components

The procedural models follow the same dimensional constraints and attachment point conventions as GLB models.

### Model Priority

1. **GLB/GLTF file** (if available at the specified `modelPath`)
2. **Procedural model** (detailed Three.js geometry based on part ID)
3. **Simple box** (fallback if no procedural model exists)
