import { v1 as uuidv1 } from "uuid";

export function getStoreNameFromModelName(modelName: string) {
    return `user_${modelName}`;
}

export function generateId() {
    return uuidv1();
}
