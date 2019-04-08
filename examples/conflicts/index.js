const { app, server } = require('./server')

const port = 4000
app.get('/', (req, res) => res.send('ok'))
app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
)
