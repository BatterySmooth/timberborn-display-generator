import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';

// === CONFIG ===
const maxHeight = 28;
const maxWidth  = 246;

const rawData = readFileSync('./world.json', 'utf8');
const data = JSON.parse(rawData);
const baseSlice = data.Entities;

const newGuid = () => randomUUID();

function parseName(name) {
  const match = name?.match(/^(.*?-)(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    x: parseInt(match[2], 10),
    y: parseInt(match[3], 10)
  };
}

function buildName(prefix, x, y) {
  return `${prefix}${x}.${y}`;
}

// Build height
const baseNameObjects = baseSlice
  .map(o => parseName(o.Components?.NamedEntity?.EntityName))
  .filter(Boolean);

const minBaseY = Math.min(...baseNameObjects.map(n => n.y));
const maxBaseY = Math.max(...baseNameObjects.map(n => n.y));
const baseHeightSpan = maxBaseY - minBaseY + 1;
const stackCount = Math.ceil((maxHeight - minBaseY + 1) / baseHeightSpan);

let verticalSlice = [];

for (let stack = 0; stack < stackCount; stack++) {
  const cloned = JSON.parse(JSON.stringify(baseSlice));
  const leverMap = new Map();
  for (const obj of cloned) {
    obj.Id = newGuid();
    const nameObj = parseName(
      obj.Components?.NamedEntity?.EntityName
    );

    if (nameObj) {
      const newY = nameObj.y + stack * baseHeightSpan;
      const newName = buildName(
        nameObj.prefix,
        nameObj.x,
        newY
      );
      obj.Components.NamedEntity.EntityName = newName;
      if (obj.Template === "HttpLever.Folktails") {
        leverMap.set(newName, obj.Id);
      }
    }
    if (obj.Components?.BlockObject?.Coordinates) {
      obj.Components.BlockObject.Coordinates.Z +=
        stack * baseHeightSpan;
    }
  }

  for (const obj of cloned) {
    if (obj.Template !== "Indicator.Folktails") continue;
    const name = obj.Components?.NamedEntity?.EntityName;
    const leverId = leverMap.get(name);
    if (leverId) {
      obj.Components.Automatable =
        obj.Components.Automatable || {};
      obj.Components.Automatable.Input = leverId;
    }
  }
  verticalSlice.push(...cloned);
}

// Build width
let finalOutput = [];

for (let x = 1; x <= maxWidth; x++) {
  const cloned = JSON.parse(JSON.stringify(verticalSlice));
  const leverMap = new Map();
  for (const obj of cloned) {
    obj.Id = newGuid();
    const nameObj = parseName(
      obj.Components?.NamedEntity?.EntityName
    );
    if (nameObj) {
      const newName = buildName(nameObj.prefix, x, nameObj.y);
      obj.Components.NamedEntity.EntityName = newName;
      if (obj.Template === "HttpLever.Folktails") {
        leverMap.set(newName, obj.Id);
      }
    }
    if (obj.Components?.BlockObject?.Coordinates) {
      obj.Components.BlockObject.Coordinates.X += (x - 1);
    }
  }
  for (const obj of cloned) {
    if (obj.Template !== "Indicator.Folktails") continue;
    const name = obj.Components?.NamedEntity?.EntityName;
    const leverId = leverMap.get(name);
    if (leverId) {
      obj.Components.Automatable =
        obj.Components.Automatable || {};
      obj.Components.Automatable.Input = leverId;
    }
  }
  finalOutput.push(...cloned);
}

writeFileSync(
  "./output.json",
  JSON.stringify(finalOutput, null, 2),
  "utf8"
);

console.log("Final object count:", finalOutput.length);