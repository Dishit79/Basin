import { Router } from "https://deno.land/x/opine/mod.ts";
import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { auth } from "./auth.ts"
import { updateUserBalance, getUser, User } from "./database/user.ts"
import { insertSale, createSale } from "./sale.ts"
import { insertTransfer, createTransfer } from "./transfer.ts"


export const apiTrans = new Router


// Structure of stored documents
interface TransactionDB {
  id: string
  userId: string
  username: string
  recvId: string
  recvUsername: string
  amount: string
  type: any

}
// Initialization
const db = new Database<TransactionDB>('transaction.json');

export class Transaction {
  id: string
  userId: string
  username: string
  recvId: string
  recvUsername: string
  amount: string
  type: any

  constructor(user: any = {}, receiver: any = {}, amount: string, type: any = {}) {
    this.id = v4.generate()
    this.userId = user.id
    this.username = user.name
    this.recvId = receiver.id
    this.recvUsername = receiver.name
    this.amount = amount
    this.type = type
  }
}

export async function insertTransaction(transaction: Transaction) {
  await db.insertOne(transaction)
}

export async function getAll(id: string) {
  const found = await db.findMany({ userId: id })
  return found
}


async function createTransaction(user: any = {}, receiver: any = {}, amount: string, type: any = {}) {

    const transaction = new Transaction(user, receiver, amount, type)
    return {succsess: true, error: null, data: transaction}

}


apiTrans.post("/purchase/:id", await auth, async (req,res) => {

  const i = req.body

  let onSale = await createSale({id: i.purchaserId, name: i.purchaserName}, {id: i.sellerId, name: i.sellerName}, {id: i.storeId, name: i.storeName}, {id: i.itemId, name: i.itemName})
  let onTrans = await createTransaction({id: i.purchaserId, name: i.purchaserName}, {id: i.sellerId, name: i.sellerName}, `-${i.price}`, {type: 'sale', id: onSale.data.id})
  let onTransSeller = await createTransaction({id: i.sellerId, name: i.sellerName}, {id: i.purchaserId, name: i.purchaserName}, `+${i.price}`, {type: 'sale', id: onSale.data.id})

  const purchaser = await getUser(i.purchaserName)
  console.log(i.purchaserName);

  const seller = await getUser(i.sellerName)

  if (purchaser!.data!.balance! >= i.price){

    const newBalance = purchaser!.data!.balance! - i.price

    const t = Number(seller!.data!.balance!)
    const t2 = Number(i.price)
    const newBalanceSeller = t + t2

    await updateUserBalance(i.purchaserName, newBalance)
    await updateUserBalance(i.sellerName, newBalanceSeller)
    await insertSale(onSale.data)
    await insertTransaction(onTrans.data)
    await insertTransaction(onTransSeller.data)


    res.redirect("/stores")
  }

  res.redirect("/")
})

apiTrans.post("/transfer/", await auth, async (req,res) => {

  const i = req.body
  const receiver = await getUser(i.receiverName)

  let onTransfer = await createTransfer({id: i.senderId, name: i.senderName}, {id: receiver!.data!.id!, name: i.receiverName}, i.amount)
  let onTrans = await createTransaction({id: i.senderId, name: i.senderName}, {id: receiver!.data!.id!, name: i.receiverName}, `-${i.amount}`, {type: 'transfer', id: onTransfer.data.id})
  let onTransSeller = await createTransaction({id: receiver!.data!.id!, name: i.receiverName}, {id: i.senderId, name: i.senderName}, `+${i.amount}`, {type: 'transfer', id: onTransfer.data.id})

  const sender = await getUser(i.senderName)

  if (sender!.data!.balance! >= i.amount){

    const newBalance = sender!.data!.balance! - i.amount

    const t = Number(receiver!.data!.balance!)
    const t2 = Number(i.amount)
    const newBalanceSeller = t + t2

    await updateUserBalance(i.senderName, newBalance)
    await updateUserBalance(i.receiverName, newBalanceSeller)
    await insertTransfer(onTransfer.data)
    await insertTransaction(onTrans.data)
    await insertTransaction(onTransSeller.data)

    res.redirect("/")
  }

  res.redirect("/")
})

apiTrans.get("/get/all", await auth, async (req,res) => {

  const data = await getAll(res.locals.user.user.id)
  res.send(data)
})

apiTrans.get("/profits", await auth, async (req,res) => {

  let profit = 0

  const data = await getAll(res.locals.user.user.id)
  for (let i = 0; i < data.length; i++) {
    const d = data[i]

    if (d.amount.includes("+")){
      const num = d.amount.replace("+", "")
      profit += Number(num)
    }
  }

  res.send({profit: profit})
})
