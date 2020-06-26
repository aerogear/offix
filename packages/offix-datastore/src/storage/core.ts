import { v1 as uuidv1 } from "uuid";

export function generateId() {
    return uuidv1();
}
