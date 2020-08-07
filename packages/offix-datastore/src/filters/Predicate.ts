import { OperatorFunctionMap, AllOperators } from "./Operators";

interface INode {
    isPassed(input: any): boolean;
}

class LeafNode implements INode {
    private fieldkey: string;
    private filter: any;

    constructor(fieldkey: string, filter: any) {
        this.fieldkey = fieldkey;
        this.filter = filter;
    }

    public isPassed(input: any) {
        const actualValue = input[this.fieldkey];
        return Object.keys(this.filter)
            .reduce((prev, cur) => {
                const op = OperatorFunctionMap[cur as AllOperators];
                const targetValue = this.filter[cur];
                return prev && op.opFunction(actualValue, targetValue);
            }, true);
    }
}

class ANDNode implements INode {
    private nodes: INode[];

    constructor(nodes: INode[]) {
        this.nodes = nodes;
    }

    isPassed(input: any): boolean {
        return (this.nodes.reduce((prev, cur) => {
            return prev && cur.isPassed(input);
        }, true));
    }
}

class ORNode implements INode {
    private nodes: INode[];

    constructor(nodes: INode[]) {
        this.nodes = nodes;
    }

    isPassed(input: any): boolean {
        return this.nodes.reduce((prev, cur) => {
            return prev || cur.isPassed(input);
        }, false);
    }
}

class NotNode implements INode {
    private root: ANDNode;

    constructor(root: ANDNode) {
        this.root = root;
    }

    isPassed(input: any): boolean {
        return !this.root.isPassed(input);
    }
}

class Predicate {
    private root: ANDNode;

    constructor(root: ANDNode) {
        this.root = root;
    }

    public filter(data: any[]) {
        return data.filter((val) => this.root.isPassed(val));
    }
}

const createNodes = (filter: any): INode[] => {
    return Object.keys(filter)
        .map((fieldKey) => {
            if (fieldKey === 'or') {
                return new ORNode(createNodes(filter[fieldKey]));
            }
            if (fieldKey === 'not') {
                return new NotNode(new ANDNode(createNodes(filter[fieldKey])));
            }
            if (fieldKey === 'and') {
                return new ANDNode(createNodes(filter[fieldKey]));
            }

            return new LeafNode(fieldKey, filter[fieldKey]);
        });
}

export const createPredicateFrom = (filter: any) => {
    const nodes = createNodes(filter);
    return new Predicate(new ANDNode(nodes));
}
