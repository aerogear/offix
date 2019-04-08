import test from 'ava'
import { VersionedObjectState, ObjectStateData } from '../src'
import { ObjectConflictError } from '../src/api/ConflictResolution'
import { strategies } from '../src/strategies'

test('With conflict', (t) => {
  const objectState = new VersionedObjectState()
  const serverData = { name: 'AeroGear', version: 1 }
  const clientData = { name: 'Red Hat', version: 2 }
  t.deepEqual(objectState.hasConflict(serverData, clientData), true)
})

test('Without conflict', (t) => {
  const objectState = new VersionedObjectState()
  const serverData = { name: 'AeroGear', version: 1 }
  const clientData = { name: 'AeroGear', version: 1 }

  t.deepEqual(objectState.hasConflict(serverData, clientData), false)
})

test('Missing version', (t) => {
  const objectState = new VersionedObjectState()
  const serverData = { name: 'AeroGear'}
  const clientData = { name: 'AeroGear', version: 1 }

  t.throws(() => {
    objectState.hasConflict(serverData, clientData)
  })
})

test('Next state ', async (t) => {
  const serverData = { name: 'AeroGear', version: 1 }
  const objectState = new VersionedObjectState()
  const next = await objectState.nextState(serverData)
  t.deepEqual(next.version, 2)
})

test('resolveOnClient returns the expected conflict response for the client', (t) => {
  const serverState = { name: 'AeroGear', version: 2 }
  const clientState = { name: 'AeroGear Client', version: 1 }
  const objectState = new VersionedObjectState()

  const resolution = objectState.resolveOnClient(serverState, clientState)

  const expected = {
    response: new ObjectConflictError({
      serverState,
      clientState,
      resolvedOnServer: false
    })
  }

  t.falsy(resolution.resolvedState)
  t.truthy(resolution.response)
  t.deepEqual(resolution.response, expected.response)
})

test('resolveOnServer works with the client wins strategy', async (t) => {
  const serverState = { name: 'AeroGear', version: 2 }
  const clientState = { name: 'Client', version: 1 }
  const objectState = new VersionedObjectState()

  const strategy = strategies.clientWins

  const resolution = await objectState.resolveOnServer(strategy, serverState, clientState)

  const expectedResolvedState = {
    name: 'Client' ,
    version: 3
  }

  const expected = {
    resolvedState: expectedResolvedState,
    response: new ObjectConflictError({
      serverState: expectedResolvedState,
      clientState,
      resolvedOnServer: true
    })
  }

  t.truthy(resolution.resolvedState)
  t.truthy(resolution.response)
  t.deepEqual(resolution.resolvedState, expected.resolvedState)
  t.deepEqual(resolution.response, expected.response)
})

test('resolveOnServer works with the server (reject) strategy', async (t) => {
  const serverState = { name: 'AeroGear', version: 2 }
  const clientState = { name: 'Client', version: 1 }
  const objectState = new VersionedObjectState()


  const resolution = await objectState.reject(serverState, clientState)

  const expectedResolvedState = {
    name: 'AeroGear' ,
    version: 2
  }

  const expected = {
    resolvedState: expectedResolvedState,
    response: new ObjectConflictError({
      serverState: expectedResolvedState,
      clientState,
      resolvedOnServer: true
    })
  }

  t.truthy(resolution.resolvedState)
  t.truthy(resolution.response)
  t.deepEqual(resolution.resolvedState, expected.resolvedState)
  t.deepEqual(resolution.response, expected.response)
})

test('resolveOnServer resolves the data using a custom handler', async (t) => {
  const serverState = { name: 'AeroGear', version: 2 }
  const clientState = { name: 'Client', version: 1 }
  const objectState = new VersionedObjectState()

  function customStrategy(serverStateObj: ObjectStateData, clientStateObj: ObjectStateData) {
    return {
      name: `${serverStateObj.name} ${clientStateObj.name}`
    }
  }

  const resolution = await objectState.resolveOnServer(customStrategy, serverState, clientState)

  const expectedResolvedState = {
    name: 'AeroGear Client' ,
    version: 3
  }

  const expected = {
    resolvedState: expectedResolvedState,
    response: new ObjectConflictError({
      serverState: expectedResolvedState,
      clientState,
      resolvedOnServer: true
    })
  }

  t.truthy(resolution.resolvedState)
  t.truthy(resolution.response)
  t.deepEqual(resolution.resolvedState, expected.resolvedState)
  t.deepEqual(resolution.response, expected.response)
})

test('resolveOnServer applies the correct version number to resolvedState', async (t) => {
  const serverState = { name: 'AeroGear', version: 2 }
  const clientState = { name: 'Client', version: 1 }
  const objectState = new VersionedObjectState()

  function customStrategy(serverStateObj: ObjectStateData, clientStateObj: ObjectStateData) {
    return {
      name: `${serverStateObj.name} ${clientStateObj.name}`,
      version: 50 // this gets overwritten with the correct version
    }
  }

  const resolution = await objectState.resolveOnServer(customStrategy, serverState, clientState)

  const expectedResolvedState = {
    name: 'AeroGear Client' ,
    version: 3
  }

  const expected = {
    resolvedState: expectedResolvedState,
    response: new ObjectConflictError({
      serverState: expectedResolvedState,
      clientState,
      resolvedOnServer: true
    })
  }

  t.truthy(resolution.resolvedState)
  t.truthy(resolution.response)
  t.deepEqual(resolution.resolvedState, expected.resolvedState)
  t.deepEqual(resolution.response, expected.response)
})

test('resolveOnServer resolves the data using a custom async handler', async (t) => {
  const serverState = { name: 'AeroGear', version: 2 }
  const clientState = { name: 'Client', version: 1 }
  const objectState = new VersionedObjectState()

  function customStrategy(serverStateObj: ObjectStateData, clientStateObj: ObjectStateData) {
    return new Promise((resolve, reject) => {
      return resolve({
        name: `${serverState.name} ${clientState.name}`
      })
    })
  }

  const resolution = await objectState.resolveOnServer(customStrategy, serverState, clientState)

  const expectedResolvedState = {
    name: 'AeroGear Client' ,
    version: 3
  }

  const expected = {
    resolvedState: expectedResolvedState,
    response: new ObjectConflictError({
      serverState: expectedResolvedState,
      clientState,
      resolvedOnServer: true
    })
  }

  t.truthy(resolution.resolvedState)
  t.truthy(resolution.response)
  t.deepEqual(resolution.resolvedState, expected.resolvedState)
  t.deepEqual(resolution.response, expected.response)
})

test('resolveOnServer throws if custom async strategy rejects', async (t) => {
  const serverState = { name: 'AeroGear', version: 2 }
  const clientState = { name: 'Client', version: 1 }
  const objectState = new VersionedObjectState()

  function customStrategy(serverStateObj: ObjectStateData, clientStateObj: ObjectStateData) {
    return new Promise((resolve, reject) => {
      return reject(new Error('an error occurred'))
    })
  }

  await t.throwsAsync(async () => {
    await objectState.resolveOnServer(customStrategy, serverState, clientState)
  })
})
