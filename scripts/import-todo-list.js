#!/usr/bin/env node
import { PublicClientApplication } from '@azure/msal-node'
import axios from 'axios'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { load, dump } from 'js-yaml'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BOARD_FILE = join(__dirname, '..', 'board.yaml')
const TOKEN_CACHE_FILE = join(__dirname, '..', '..', 'taskviewer', '.token-cache.json')
const CLIENT_ID = '14d82eec-204b-4c2f-b7e8-296a70dab67e'
const SCOPES = ['Tasks.Read', 'Tasks.ReadWrite', 'offline_access']
const GRAPH = 'https://graph.microsoft.com/v1.0'

const msalClient = new PublicClientApplication({
  auth: { clientId: CLIENT_ID, authority: 'https://login.microsoftonline.com/common' },
})

const loadToken = () => {
  if (!existsSync(TOKEN_CACHE_FILE)) throw new Error(`Token cache niet gevonden: ${TOKEN_CACHE_FILE}`)
  msalClient.getTokenCache().deserialize(readFileSync(TOKEN_CACHE_FILE, 'utf-8'))
}

const getToken = async () => {
  const accounts = await msalClient.getTokenCache().getAllAccounts()
  if (accounts.length === 0) throw new Error('Geen account in token cache. Log eerst in via taskviewer.')
  const result = await msalClient.acquireTokenSilent({ scopes: SCOPES, account: accounts[0] })
  if (!result) throw new Error('Token ophalen mislukt.')
  return result.accessToken
}

const graphGet = async (url, token) => {
  const results = []
  let nextUrl = url
  while (nextUrl) {
    const { data } = await axios.get(nextUrl, { headers: { Authorization: `Bearer ${token}` } })
    if (data.value) results.push(...data.value)
    nextUrl = data['@odata.nextLink'] ?? null
  }
  return results
}

const graphGetOne = async (url, token) => {
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
  return data
}

const graphDelete = async (url, token) => {
  await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } })
}

const extractListId = (url) => {
  // To Do URLs contain the list ID as the last path segment or as a query/hash param
  // e.g. https://to-do.live.com/tasks/AQMkADAwA...
  const match = url.match(/\/tasks\/([A-Za-z0-9_=+/-]+)/)
  if (match) return decodeURIComponent(match[1])
  throw new Error(`Kan list ID niet extraheren uit URL: ${url}`)
}

const readBoard = () => {
  if (!existsSync(BOARD_FILE)) return { lists: [] }
  return load(readFileSync(BOARD_FILE, 'utf-8'))
}

const writeBoard = (board) => {
  writeFileSync(BOARD_FILE, dump(board, { lineWidth: -1 }))
}

const main = async () => {
  const url = process.argv[2]
  if (!url) {
    console.error('Gebruik: node scripts/import-todo-list.js <todo-list-url>')
    process.exit(1)
  }

  const listId = extractListId(url)
  console.log(`List ID: ${listId}`)

  loadToken()
  const token = await getToken()

  // Fetch list metadata
  const listMeta = await graphGetOne(
    `${GRAPH}/me/todo/lists/${encodeURIComponent(listId)}`,
    token
  )
  console.log(`Lijst: ${listMeta.displayName}`)

  // Fetch all incomplete tasks
  const tasks = await graphGet(
    `${GRAPH}/me/todo/lists/${encodeURIComponent(listId)}/tasks?$filter=status ne 'completed'`,
    token
  )
  console.log(`${tasks.length} taken gevonden`)

  if (tasks.length === 0) {
    console.log('Geen taken te importeren.')
    process.exit(0)
  }

  // Add to board.yaml
  const board = readBoard()
  const newList = {
    name: `import-${listMeta.displayName}`,
    group: 'import',
    items: tasks.map((t) => ({ label: t.title })),
  }
  board.lists.push(newList)
  writeBoard(board)
  console.log(`Toegevoegd aan board.yaml als "${newList.name}"`)

  // Delete tasks from To Do list sequentially to avoid rate limiting
  console.log('Taken verwijderen uit To Do...')
  for (const t of tasks) {
    await graphDelete(
      `${GRAPH}/me/todo/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(t.id)}`,
      token
    )
    console.log(`  Verwijderd: ${t.title}`)
  }

  console.log('Klaar.')
}

main().catch((err) => {
  console.error('Fout:', err.message)
  process.exit(1)
})
