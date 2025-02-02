import type { LoroTree, LoroTreeNode } from "loro-crdt";

import type { Node } from "../model";
import { Doc } from "../model";
import { markdown } from "./index";

const doc = (() => {
  const insert = (tree: LoroTree<Node> | LoroTreeNode<Node>, name: string) => {
    const node = tree.createNode();
    node.data.set("label", name);
    return node;
  };

  const doc = new Doc("Fruits");

  const apple = insert(doc.main, "Apple");
  insert(apple, "Boskoop");
  insert(apple, "Carola");
  insert(apple, "Elstar");

  const banana = insert(doc.main, "Banana");
  insert(banana, "Goldfinger");
  insert(banana, "Gros Michel");

  insert(doc.main, "Clementine");

  return doc;
})();

test("markdown", () => {
  expect(markdown(doc)).toMatchSnapshot();
});
