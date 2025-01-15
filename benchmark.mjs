import { LoroDoc } from "loro-crdt";

const doc = new LoroDoc();

const meta = doc.getMap("meta");
const tree = doc.getTree("main");

meta.set("name", "Topic");

const root1 = tree.createNode();
root1.data.set("label", "Start");
root1.data.set("expanded", true);

const child1 = root1.createNode();
child1.data.set("label", "Child 1");
child1.data.set("expanded", true);

const child2 = root1.createNode();
child2.data.set("label", "Child 2");
child2.data.set("expanded", true);

const grandchild = child1.createNode();
grandchild.data.set("label", "Grand-Child");
grandchild.data.set("expanded", true);

const root2 = tree.createNode();
root2.data.set("label", "Other");
root2.data.set("expanded", true);

const state = doc.export({ mode: "update" });
console.log(`state size: ${state.length}`);

const snapshot = doc.export({ mode: "shallow-snapshot" });
console.log(`snapshot size: ${snapshot.length}`);
