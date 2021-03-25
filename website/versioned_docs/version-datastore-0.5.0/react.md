---
id: react
title: React - using Datastore Hooks
sidebar_label: React
---

Offix Datastore provides react hooks for CRUD operations and subscription.

For a quick start see [sample react app](https://github.com/aerogear/offix/tree/master/examples/react-datastore).

## useSave

The `useSave` hook provides a lazy `save` function,
a loading indicator `loading` and an `error` state variable.
The `save` function accepts the input and returns a promise of the save result.

```javascript
import { useSave } from "offix-datastore";


const AddTask = () => {
    const [taskDetails, setTaskDetails] = useState({
        title: "", description: "", numberOfDaysLeft: 0
    });
    const { loading, error, save } = useSave(TaskModel);

    async function handleSubmit(e) {
        e.preventDefault();
        const result = await save(taskDetails);
        setTaskDetails(result);
    }

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setTaskDetails((d) => ({ ...d, [name]: value }));
    }

    const { title, description, numberOfDaysLeft } = taskDetails;
    return (
        {(error ? <div>{error.message}</div>)}
        <form onSubmit={handleSubmit}>
            <input name="title" value={title} onChange={handleOnChange} />
            <input name="description" value={description} onChange={handleOnChange} />
            <input name="numberOfDaysLeft" type="number" value={numberOfDaysLeft} onChange={handleOnChange} />
            <button type="submit">Submit</button>
        </form>
    )
}
```

## useQuery

You can query using this hook, with or without filters or id. When no filter or id is supplied
all the data is returned.

Query using a filter;

```javascript
import { useQuery } from "offix-datastore";

const Tasks = () => {
    const [filter, setFilter] = useState();
    const { loading, error, data: tasks } = useQuery(TaskModel, filter);

    if (loading) return <div>Loading ....</div>
    if (error) return <div>{error.message}</div>

    return (
        <TaskFilterForm onFilterChanged={(filter) => setFilter(filter)} />
        {tasks.map((task) => <Task task={task} />)}
    )
}
```

Query by id;

```javascript
const documentId = "";
const { loading, error, data: tasks } = useQuery(TaskModel, documentId);
```

You can also subscribe to changes using the `subscribeToUpdates` function.

```javascript
const { loading, error, data: tasks, subscribeToUpdates } = useQuery(TaskModel, filter);
useEffect(() => {
    const subscription = subscribeToUpdates();
    return () => subscription.unsubscribe();
}, []);
```

`subscribeToUpdates` can take an array of events to watch

`const subscription = subscribeToUpdates([CRUDEvents.ADD, CRUDEvents.UPDATE]);`

Offix Datastore reponds to events and updates your Application state for you. You can also override
Datastore's event handlers.

```javascript
const { loading, error, data: tasks, subscribeToUpdates } = useQuery(TaskModel, filter);
useEffect(() => {
    const subscription = subscribeToUpdates([CRUDEvents.ADD], (newData) => {
        if (!tasks) return [newData];
        return [...tasks, newData];
    });
    return () => subscription.unsubscribe();
}, []);
```

## useLazyQuery

This hook provides a lazy `query` function. The `query` function accepts
a filter, an id or nothing, in which case, all documents are returned. 

```javascript
import { useLazyQuery } from "offix-datastore";

const Tasks = () => {
    const { loading, error, data: tasks, query } = useLazyQuery(TaskModel);

    useEffect(() => query(), []);

    if (loading) return <div>Loading ....</div>
    if (error) return <div>{error.message}</div>

    return (
        <TaskFilterForm onFilterChanged={(filter) => query(filter)} />
        {tasks.map((task) => <Task task={task} />)}
    )
}
```

The `useLazyQuery` hook also provides a `subscribeToUpdates` function
that you can use to subscribe to events on your data.

## useUpdate

The `useUpdate` works just like the `useSave` hook.
The only difference is that the input to the `update` function must have its primary key defined.

```javascript
import { useUpdate } from "offix-datastore";

const EditTask = ({ task }) => {
    const [taskDetails, setTaskDetails] = useState(task);
    const { loading, error, update } = useUpdate(TaskModel);

    async function handleSubmit(e) {
        e.preventDefault();
        const result = await update(taskDetails);
        setTaskDetails(result);
    }

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setTaskDetails((d) => ({ ...d, [name]: value }));
    }

    const { title, description, numberOfDaysLeft } = taskDetails;
    return (
        {(error ? <div>{error.message}</div>)}
        <form onSubmit={handleSubmit}>
            <input name="title" value={title} onChange={handleOnChange} />
            <input name="description" value={description} onChange={handleOnChange} />
            <input name="numberOfDaysLeft" type="number" value={numberOfDaysLeft} onChange={handleOnChange} />
            <button type="submit">Submit</button>
        </form>
    )
}
```

The `update` function accepts an optional `upsert` parameter(which is `false` by default) that can be used to
perform a `saveOrUpdate` operation instead of an `update` operation.

```Javascript
async function handleSubmit(e) {
    e.preventDefault();
    const result = await update(taskDetails, true);
    setTaskDetails(result);
}
```

## useRemove

```javascript
import { useRemove } from "offix-datastore";

const Task = ({ task }) => {
    const { loading, remove } = useRemove(TaskModel);
    
    const deleteTask = async () => {
        await remove(task);
        ...
    }
    
    return ...
}
```

## useSubscription

You can subscribe to multiple events and receive changes data using this hook.
We listen for updates to the task and render them. The `data` returned
by `useSubscription` is the data carried by the change event.

```javascript
const Task = ({ task }) => {
    const { data } = useSubscription(TaskModel, [CRUDEvents.UPDATE]);
    // data is undefined when no events have been fired
    const task = data ? data.find((d) => (d._id === task._id)) : task;

    return <div>{task.title}</div>
}
```

We can listen to all events on all documents

`const { data } = useSubscription(TaskModel);`
