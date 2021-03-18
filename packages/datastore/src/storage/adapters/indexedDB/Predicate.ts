import { ANDNode } from "./Nodes";
import { createNodes } from "./createNodes";

export const getPredicate = (filter: any) => {
    const nodes = createNodes(filter);
    const root = new ANDNode(nodes);
    return (data: any) => (root.isPassed(data));
};
