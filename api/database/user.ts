import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";

// Structure of stored documents
interface UserDB {
  username: string
  password: string
  id: string
  balance: number
  citizenType: string
}
// Initialization
const db = new Database<UserDB>('user.json');


export class User {
  id = "null"
  username: string
  password: string
  balance: number
  citizenType: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
    this.id = v4.generate()
    this.balance = 1000
    this.citizenType = "simple"
  }
}

export async function checkExistanceUser(user: User) {
  const usernameFound = await db.findOne({ username: user.username });

  if (usernameFound) {
    return { username: true}
  } else {
    return { username: false}
  }
}

export async function insertUser(user: User) {
  await db.insertOne(user)
}

export async function getUser(username: string) {

  const userData = await db.findOne({ username: username });

  if (!userData) {
    return { exists: false}
  }

  return { exists: true, data: userData}
}

export async function updateUserBalance(username: string, newBalance: number) {

  const userData = await db.updateOne({ username: username }, { balance: newBalance});
  return { exists: true, data: userData}
}
