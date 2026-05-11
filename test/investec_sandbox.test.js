const assert = require('node:assert/strict')
const test = require('node:test')
const express = require('express')

const Investec = require('../modules/investec')
const getAuth = require('../routes/investec/auth')
const investecRouter = require('../routes/investec')

function currentUserForAuthorization(authorization) {
  const req = { headers: { authorization } }
  getAuth(req, {}, () => {})
  return req.currentUser
}

test('auth middleware accepts raw Basic SANDBOX credentials', () => {
  assert.deepEqual(currentUserForAuthorization('Basic SANDBOX'), {
    token: 'SANDBOX',
    username: 'SANDBOX',
    partition: undefined
  })
})

test('Investec adapter returns sandbox accounts and transactions', async () => {
  const investec = new Investec('SANDBOX')

  const accountsResponse = await investec.getWithAuth('/za/pb/v1/accounts')
  assert.equal(accountsResponse.status, 200)
  assert.equal(accountsResponse.data.data.accounts.length, 1)

  const accountId = accountsResponse.data.data.accounts[0].accountId
  const transactionsResponse = await investec.getWithAuth(`/za/pb/v1/accounts/${accountId}/transactions`)
  assert.equal(transactionsResponse.status, 200)
  assert.equal(transactionsResponse.data.data.transactions.length, 2)
  assert.ok(transactionsResponse.data.data.transactions.every((transaction) => transaction.accountId === accountId))
})

test('Investec proxy preserves sandbox response statuses', async (t) => {
  const app = express()
  app.use(express.json())
  app.use('/investec', investecRouter)

  const server = app.listen(0)
  t.after(() => server.close())

  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}/investec`

  const accountsResponse = await fetch(`${baseUrl}/za/pb/v1/accounts`, {
    headers: { authorization: 'Basic SANDBOX' }
  })
  assert.equal(accountsResponse.status, 200)
  assert.equal((await accountsResponse.json()).data.accounts.length, 1)

  const missingResponse = await fetch(`${baseUrl}/za/pb/v1/not-implemented`, {
    headers: { authorization: 'Basic SANDBOX' }
  })
  assert.equal(missingResponse.status, 404)
  assert.equal((await missingResponse.json()).data.path, '/za/pb/v1/not-implemented')
})
