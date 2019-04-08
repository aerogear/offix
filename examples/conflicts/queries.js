const queries =
`mutation changeGreeting {
  changeGreeting(msg: "Hello from GraphQL developer", version: 1){
    msg
    version
  }
}

query greeting {
  greeting
}`

module.exports = queries
