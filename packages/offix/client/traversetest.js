const traverse = require('traverse')

const variables = {
  input: {
    "id": "5e5fa07295ea8401bfefb1f7",
    "title": "updated for conflict agaon",
    "description": "wqqw",
    "status": null,
    "version": 13
  }
}

const resolved = {
  "id": "5e5fa07295ea8401bfefb1f7",
  "title": "updated for conflict",
  "description": "wqqw",
  "version": 14
}

function replaceNestedObjectByIdValue(srcObject, targetObject, idField) {
  return traverse(srcObject).map(function(val) {
    if (val && this.notLeaf && val[idField] && val[idField] === targetObject[idField]) {
      console.log('updating')
      this.update(targetObject, true)
    }
  })
}

console.log(variables)

const result = replaceNestedObjectByIdValue(variables, resolved, 'id')

console.log(result)