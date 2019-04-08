## Conflict Example Server

This example demonstrates how to use the `@aerogear/voyager-conflicts` package to detect and handle data conflicts within the resolver functions.

### Running Example

```
$ node ./conflicts/index.js
🚀 Server ready at http://localhost:4000/graphql
```

### Testing Conflict Resolution

Open [http://localhost:4000/graphql](http://localhost:4000/graphql).
You will see the GraphQL Playground. This is a space where you can try out queries and see the results.

Example contains 2 resolvers:

- changeGreeting: Resolver configured to resolve conflict on server

- changeGreetingClient: Resolver configured to resolve conflict on client


Conflict will be triggered when version supplied as mutation parameter will be
different than version that server expects. To mitigate that in GraphQL Playground please:

1) Execute `changeGreeting` mutation.
First execution of the `changeGreeting` is going to perform successful update.
2) Execute `changeGreeting` mutation again without changing version
Second execution is going to cause conflict because version that is supplied did not change.
3) Increment version and execute mutation again.
Incrementing version will successfully save data without conflict.
