import { Router } from "https://deno.land/x/opine/mod.ts";
import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { auth } from "./auth.ts"

export const apiSale = new Router

// Structure of stored documents
interface TransferDB {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  amount: number
  date: any
}
// Initialization
const db = new Database<TransferDB>('sale.json');

export class Transfer {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  amount: number
  date: any

  constructor(sender: any = {}, receiver: any = {}, amount:number ) {
    this.id = v4.generate()
    this.senderId = sender.id
    this.senderName = sender.name
    this.receiverId = receiver.id
    this.receiverName = receiver.name
    this.amount = amount
    this.date = new Date
  }
}

export async function insertTransfer(transfer: Transfer) {
  await db.insertOne(transfer)
}

export async function getTransfersUser(id: string) {
  const data = await db.findMany((document: any) => document.senderId === id || document.receiverId == id);
  return data
}


export async function createTransfer(sender: any = {}, receiver: any = {}, amount: number) {
    const transfer = new Transfer(sender, receiver, amount)
    return {succsess: true, error: null, data: transfer}
}



apiSale.get("/get/all/:id", await auth, async (req,res) => {
  const data = await getTransfersUser(req.params.id)
  res.send(data)
})
