import { IFilterNode, ORNode, NotNode, ANDNode, LeafNode } from "./Nodes";

export const createNodes = (filter: any): IFilterNode[] => {
    return Object.keys(filter)
        .map((fieldKey) => {
            const value = filter[fieldKey];
            if (fieldKey === "or") {
                return new ORNode(createNodes(value));
            }
            if (fieldKey === "not") {
                return new NotNode(new ANDNode(createNodes(value)));
            }
            if (fieldKey === "and") {
                return new ANDNode(createNodes(value));
            }
            if (value instanceof Object) {
                return new LeafNode(fieldKey, value);
            }
            const defaultFilter = { eq: value };
            return new LeafNode(fieldKey, defaultFilter);
        });
};
