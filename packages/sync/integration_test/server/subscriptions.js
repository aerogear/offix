const { PubSub } = require('apollo-server');


// TODO write helper for building this classical event object
const eventsArray = {
    TASK: {
        CREATED: 'TaskCreated',
        DELETED: 'TaskDeleted',
        MODIFIED: 'TaskModified'
    }
};

module.exports = {
    EVENTS: eventsArray,
    pubSub: new PubSub()
}