const accountId = 'sandbox-account-1'

const accounts = [
  {
    accountId,
    accountNumber: '10000000001',
    accountName: 'SANDBOX Private Bank Account',
    referenceName: 'SANDBOX',
    productName: 'Private Bank Account'
  }
]

const transactions = [
  {
    accountId,
    type: 'DEBIT',
    transactionType: 'CardPurchases',
    status: 'POSTED',
    description: 'SANDBOX COFFEE SHOP',
    cardNumber: '400000******0001',
    postedOrder: 1,
    postingDate: '2024-01-15',
    transactionDate: '2024-01-15',
    actionDate: '2024-01-15',
    transactionTime: '09:31:00',
    amount: -4500,
    runningBalance: 125500
  },
  {
    accountId,
    type: 'CREDIT',
    transactionType: 'Deposit',
    status: 'POSTED',
    description: 'SANDBOX SALARY',
    postedOrder: 2,
    postingDate: '2024-01-01',
    transactionDate: '2024-01-01',
    actionDate: '2024-01-01',
    transactionTime: '08:00:00',
    amount: 130000,
    runningBalance: 130000
  }
]

function response(data, status = 200) {
  return { status, data }
}

class InvestecSandbox {
  async getWithAuth(path) {
    if (path === '/za/pb/v1/accounts') {
      return response({ data: { accounts } })
    }

    const transactionsMatch = path.match(/^\/za\/pb\/v1\/accounts\/([^/]+)\/transactions/)
    if (transactionsMatch) {
      const requestedAccountId = transactionsMatch[1]
      return response({
        data: {
          transactions: transactions.filter(transaction => transaction.accountId === requestedAccountId)
        }
      })
    }

    return response({
      data: {
        message: 'Sandbox endpoint not implemented',
        path
      }
    }, 404)
  }

  async postWithAuth(path, params) {
    return response({
      data: {
        message: 'Sandbox POST endpoint not implemented',
        path,
        params
      }
    }, 404)
  }
}

module.exports = InvestecSandbox
