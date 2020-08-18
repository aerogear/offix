---
id: react
title: React - using Datastore Hooks
sidebar_label: React
---

Offix Datastore provides react hooks for CRUD operations and subscription.

For a quick start see [sample react app](https://github.com/aerogear/offix/tree/master/examples/react-datastore).

## useSave

The `useSave` hook provides a lazy `save` function,
a loading indicator `isLoading` and an `error` state variable.
The `save` function accepts the input and returns a promise of the save result.

```javascript
import { useSave } from "offix-datastore";


const AddTask = () => {
    const [taskDetails, setTaskDetails] = useState({
        title: "", description: "", numberOfDaysLeft: 0
    });
    const { isLoading, error, save } = useSave(TaskModel);

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
    const { isLoading, error, data: tasks } = useQuery(TaskModel, filter);

    if (isLoading) return <div>Loading ....</div>
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
const { isLoading, error, data: tasks } = useQuery(TaskModel, documentId);
```

You can also subscribe to more changes using the `subscribeToMore` function

```javascript
const { isLoading, error, data: tasks, subscribeToMore } = useQuery(TaskModel, filter);
useEffect(() => {
    const subscription = subscribeToMore(CRUDEvents.ADD, (newData) => {
        if (!tasks) return [newData];
        return [...tasks, newData];
    });
    return () => subscription.unsubscribe();
}, []);
```

## useLazyQuery

This hook provides a lazy `query` function. The `query` function accepts
a filter, an id or nothing in which case all documents are returned. 

```javascript
import { useLazyQuery } from "offix-datastore";

const Tasks = () => {
    const { isLoading, error, data: tasks, query } = useLazyQuery(TaskModel);

    useEffect(() => query(), []);

    if (isLoading) return <div>Loading ....</div>
    if (error) return <div>{error.message}</div>

    return (
        <TaskFilterForm onFilterChanged={(filter) => query(filter)} />
        {tasks.map((task) => <Task task={task} />)}
    )
}
```

The `query` function also returns a `subscribeToMore` function
that you can use to subscribe to changes for that query. 

## useUpdate

The `useUpdate` works just like the `useSave` hook.
The only difference is that the input to the `update` function must have its primary key defined.

```javascript
import { useUpdate } from "offix-datastore";

const EditTask = ({ task }) => {
    const [taskDetails, setTaskDetails] = useState(task);
    const { isLoading, error, update } = useUpdate(TaskModel);

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
    const { isLoading, remove } = useRemove(TaskModel);
    
    const deleteTask = async () => {
        await remove(task);
        ...
    }
    
    return ...
}
```

## useSubscription

You can subscribe to specific events and receive changes data using this hook.
We listen for updates to the task and render them. The `data` returned
by `useSubscription` is the data carried by the change event.

```javascript
const Task = ({ task }) => {
    // Listen for updates on this task
    const { data } = useSubscription(TaskModel, CRUDEvents.UPDATE, task);
    task = data[0] || task; // data is undefined when no events have been fired

    return <div>{task.title}</div>
}
```
