import { Router } from "https://deno.land/x/opine/mod.ts";
import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { auth } from "./auth.ts"

export const apiSale = new Router


// Structure of stored documents
interface SaleDB {
  id: string
  purchaserId: string
  purchaserName: string
  sellerId: string
  sellerName: string
  storeId: string
  storeName: string
  itemId: string
  itemName: string
  date: any
  seen: boolean
}
// Initialization
const db = new Database<SaleDB>('sale.json');

export class Sale {
  id: string
  purchaserId: string
  purchaserName: string
  sellerId: string
  sellerName: string
  storeId: string
  storeName: string
  itemId: string
  itemName: string
  date: any
  seen = false

  constructor(purchaser: any = {}, seller: any = {}, store: any = {}, item: any = {}) {
    this.id = v4.generate()
    this.purchaserId = purchaser.id
    this.purchaserName = purchaser.name
    this.sellerId = seller.id
    this.sellerName = seller.name
    this.storeId = store.id
    this.storeName = store.name
    this.itemId = item.id
    this.itemName = item.name
    this.date = new Date
  }
}

export async function insertSale(sale: Sale) {
  await db.insertOne(sale)
}

export async function getAll(id: string) {
  const all = await db.findMany({ sellerId: id });
  const unseen = await db.findMany((document: any) => document.sellerId === id && document.seen == false);
  const seen = await db.findMany((document: any) => document.sellerId === id && document.seen == true);
  return {all: all, seen: seen, unseen: unseen}
}

export async function getAllStoreSale(id: string) {
  const all = await db.findMany({ storeId: id });
  const unseen = await db.findMany((document: any) => document.storeId === id && document.seen == false);
  const seen = await db.findMany((document: any) => document.storeId === id && document.seen == true);
  return {all: all, seen: seen, unseen: unseen}
}

export async function updateSeen(id:string) {
  const all = await db.updateOne({ id: id }, { seen: true});
}


export async function createSale(purchaser: any = {}, seller: any = {}, store: any = {}, item: any = {}) {

    const sale = new Sale(purchaser, seller, store, item)

    return {succsess: true, error: null, data: sale}

}


apiSale.post("/create", await auth, async (req,res) => {
  console.log(req.body);

  const i = req.body

  let on = await createSale({id: i.purchaserId, name: i.purchaserName}, {id: i.sellerId, name: i.sellerName}, {id: i.storeId, name: i.storeName}, {id: i.itemId, name: i.itemName})

  if (on.succsess){
    res.redirect("/")
  }
})


apiSale.get("/get/all/", await auth, async (req,res) => {
  const data = await getAll(res.locals.user.user.id)
  res.send(data)
})

apiSale.get("/get/all/:id", await auth, async (req,res) => {
  const data = await getAllStoreSale(req.params.id)
  res.send(data)
})

apiSale.post("/seen/:id", await auth, async (req,res) => {
  const data = await updateSeen(req.params.id)
  res.redirect("/sales")
})
