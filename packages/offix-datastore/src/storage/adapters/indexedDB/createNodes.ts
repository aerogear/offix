import { INode, ORNode, NotNode, ANDNode, LeafNode } from "./Nodes";

export const createNodes = (filter: any): INode[] => {
    return Object.keys(filter)
        .map((fieldKey) => {
            if (fieldKey === "or") {
                return new ORNode(createNodes(filter[fieldKey]));
            }
            if (fieldKey === "not") {
                return new NotNode(new ANDNode(createNodes(filter[fieldKey])));
            }
            if (fieldKey === "and") {
                return new ANDNode(createNodes(filter[fieldKey]));
            }

            return new LeafNode(fieldKey, filter[fieldKey]);
        });
};
