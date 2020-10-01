import { ModelMap } from "./MutationsQueue";
import { MutationRequest } from "./MutationRequest";
import { LocalStorage, CRUDEvents } from "../../storage";
import { Model } from "../../Model";
import traverse from "traverse";

// TODO remove this
/**
 * Swaps all client ids for server ids in queue
 * and updates corresponding item in LocalStorage
 */
export class QueueUpdateProcessor {
    private modelMap: ModelMap;
    private storeName: string;
    private clientData: any;
    private serverData: any;
    private storage: LocalStorage;
    private currentModel: Model;

    constructor(
        modelMap: ModelMap,
        currentItem: MutationRequest,
        serverData: any,
        storage: LocalStorage
    ) {
        this.modelMap = modelMap;
        this.storeName = currentItem.storeName;
        this.clientData = currentItem.data;
        this.serverData = serverData;
        this.storage = storage;
        this.currentModel = modelMap[this.storeName].model;
    }

    /**
     * Swap the client ids in @param items in place
     * while updating LocalStorage and dispatching events
     *
     * @param items The Queue items
     */
    public async updateQueue(items: MutationRequest[]) {
        await this.swapDocumentId();
        const itemUpdates = await this.updateQueueItems(items);
        const persistedItems = await this.persistItems(itemUpdates);

        const events: any = {};
        persistedItems.forEach((result) => {
            if (events[result.storeName]) {
                events[result.storeName].push(result.data);
                return;
            }
            events[result.storeName] = [result.data];
        });
        Object.keys(events).forEach((key) => {
            const itemModel = this.modelMap[key].model;
            itemModel.changeEventStream.publish({
                eventType: CRUDEvents.UPDATE,
                data: events[key]
            });
        });
    }

    private async swapDocumentId() {
        const primaryKey = this.currentModel.getSchema().getPrimaryKey();
        try {
            // Local edits are lost here
            await this.storage.removeById(this.storeName, primaryKey, this.clientData);
            await this.storage.save(this.storeName, this.serverData);
            this.currentModel.changeEventStream.publish({
                eventType: CRUDEvents.ID_SWAP,
                data: [
                    {
                        previous: this.clientData,
                        current: this.serverData
                    }
                ]
            });
        } catch (error) {
            // if key already exists then live update has already saved the result
            // in this case, emit a delete event for the old document
            this.currentModel.changeEventStream.publish({
                eventType: CRUDEvents.DELETE,
                data: [this.clientData]
            });
        }
    }

    private async updateQueueItems(items: MutationRequest[]) {
        const itemUpdates: any = {};
        const primaryKey = this.currentModel.getSchema().getPrimaryKey();
        const clientKey = this.clientData[primaryKey];
        const serverKey = this.serverData[primaryKey];
        const modelMap = this.modelMap;

        let documentRoot: any;
        traverse(items)
            .forEach(function(value) {
                if (this.level < 3) { return; }
                if (this.level === 3 && this.parent?.key === "data") {
                    documentRoot = this;
                }

                if (value === clientKey) {
                    this.update(serverKey);
                    if (this.key === primaryKey) { return; } // id has already been swapped
                }

                const item = documentRoot.parent.parent.node;
                const data = item.data;
                const storeName = item.storeName;
                const itemPrimaryKey = modelMap[storeName].model.getSchema().getPrimaryKey();
                const id = data[itemPrimaryKey];

                if (item.eventType === CRUDEvents.DELETE) {
                    delete itemUpdates[id];
                    return;
                }

                itemUpdates[id] = {
                    storeName, update: {
                        ...(itemUpdates[id] ? itemUpdates[id].update : {}),
                        [itemPrimaryKey]: id,
                        [documentRoot.key]: documentRoot.node
                    }
                };
            });

        return Object.keys(itemUpdates).map((key) => itemUpdates[key]);;
    }

    private async persistItems(itemUpdates: any[]) {
        const promises = itemUpdates.map(async (item: any) => {
            const itemModel = this.modelMap[item.storeName].model;
            const itemKey = itemModel.getSchema().getPrimaryKey();
            const result = await this.storage.updateById(item.storeName, itemKey, item.update);
            return { storeName: itemModel.getStoreName(), data: result };
        });
        return Promise.all(promises);
    }
}
