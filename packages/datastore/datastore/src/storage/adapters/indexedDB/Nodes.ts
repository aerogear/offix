import { OperatorFunctionMap, AllOperators } from "../../../filters/Operators";

/**
 * A Filter node
 */
export interface INode {
    /**
     * Checks if @param input passed the test at this node
     */
    isPassed(input: any): boolean;
}

/**
 * This node has no children.
 * It is a filter operation on one field of an input.
 */
export class LeafNode implements INode {
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
                const op = OperatorFunctionMap[cur as (keyof AllOperators)];
                const targetValue = this.filter[cur];
                return prev && op.opFunction(actualValue, targetValue);
            }, true);
    }
}

/**
 * This Node performs an AND operation on its children
 */
export class ANDNode implements INode {
    private nodes: INode[];

    constructor(nodes: INode[]) {
        this.nodes = nodes;
    }

    isPassed(input: any): boolean {
        return (this.nodes.reduce((prev: boolean, cur: INode) => {
            return (prev && cur.isPassed(input));
        }, true));
    }
}

/**
 * This Node performs an OR operation on its children
 */
export class ORNode implements INode {
    private nodes: INode[];

    constructor(nodes: INode[]) {
        this.nodes = nodes;
    }

    isPassed(input: any): boolean {
        return this.nodes.reduce((prev: boolean, cur: INode) => {
            return prev || cur.isPassed(input);
        }, false);
    }
}

/**
 * This Node negates the result of
 * an AND operation on its children
 */
export class NotNode implements INode {
    private root: ANDNode;

    constructor(root: ANDNode) {
        this.root = root;
    }

    isPassed(input: any): boolean {
        return !this.root.isPassed(input);
    }
}
