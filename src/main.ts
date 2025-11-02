// src/main.ts

import "../style.css";
import Konva from "konva";
import { GraphModel } from "./MainGame/GraphModel"; // Assuming your model is in model.ts
import { GraphView } from "./MainGame/GraphView"; // The new graph-only view
import { UIView } from "./MainGame/UIView";       // The new UI-only view
import { GraphController } from "./MainGame/GraphController";

// 1. Create the Model (the data)
const model = new GraphModel();
const padding = 20;
model.setOrigin(padding, model.getHeight() - padding);


// 2. Create the shared Konva Stage
const stage = new Konva.Stage({
  container: "container",
  width: model.getWidth(),
  height: model.getHeight(),
});

// 3. Create the Views, passing them the model and the shared stage
// Each view will create and manage its own Konva.Layer
const graphView = new GraphView(model, stage);
const uiView = new UIView(model, stage);

// 4. Create the Controller
// The controller now only needs to talk to the model.
new GraphController(model);

// The app is running.