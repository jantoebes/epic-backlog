import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";
import { COLORS } from "./src/data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YAML_PATH = path.join(__dirname, "board.yaml");

const addIds = (lists) =>
  lists.map((list, listIndex) => ({
    ...list,
    id: `list-${listIndex}`,
    color: COLORS[listIndex % COLORS.length],
    items: list.items.map((item, i) => ({
      description: "",
      ...item,
      id: `list-${listIndex}-item-${i}`,
    })),
  }));

const stripIds = (lists) =>
  lists.map(({ id: _id, color: _color, items, ...list }) => ({
    ...list,
    items: items.map(({ id: _iid, description, ...item }) =>
      description ? { ...item, description } : item
    ),
  }));

const readBoard = () => {
  if (!fs.existsSync(YAML_PATH)) return null;
  const raw = yaml.load(fs.readFileSync(YAML_PATH, "utf8"));
  return { lists: addIds(raw.lists) };
};

const writeBoard = (lists) =>
  fs.writeFileSync(YAML_PATH, yaml.dump({ lists: stripIds(lists) }, { lineWidth: -1 }), "utf8");

const initBoard = () => {
  writeBoard([]);
  return { lists: [] };
};

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/board", (_req, res) => {
  const data = readBoard() ?? initBoard();
  res.json(data);
});

app.put("/api/board", (req, res) => {
  writeBoard(req.body.lists);
  res.sendStatus(204);
});

app.listen(3001, () => console.log("Board API running on http://localhost:3001"));
