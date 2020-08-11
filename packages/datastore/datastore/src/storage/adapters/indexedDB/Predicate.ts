import { ANDNode } from "./Nodes";
import { createNodes } from "./createNodes";

export class Predicate {
    private root: ANDNode;

    constructor(root: ANDNode) {
        this.root = root;
    }

    public filter(data: any[]) {
        return data.filter((val) => this.root.isPassed(val));
    }
}

export const createPredicateFrom = (filter: any) => {
    const nodes = createNodes(filter);
    return new Predicate(new ANDNode(nodes));
};

export const getPredicate = (filter: any) => {
    const nodes = createNodes(filter);
    const root = new ANDNode(nodes);
    return (data: any) => (root.isPassed(data));
};
