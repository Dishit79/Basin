import { Router } from "https://deno.land/x/opine/mod.ts";
import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { auth } from "./auth.ts"


// Structure of stored documents
interface ItemDB {
  id: string
  itemName: string
  store: any
  seller: any
  itemInfo: any
  itemPrice: number
  type: number
}
// Initialization
const dbItem = new Database<ItemDB>('item.json');

export class Item {
  id: string
  itemName: string
  store: any = {}
  seller: any = {}
  itemInfo: any = {}
  itemPrice: number
  type = 1

  constructor(itemName: string, store: any = {}, seller: any = {},  itemInfo: any = {}, itemPrice: number) {
    this.id = v4.generate();
    this.store = store
    this.seller = seller
    this.itemName = itemName
    this.itemInfo = itemInfo
    this.itemPrice = itemPrice
  }
}

export async function insertItem(item: Item) {
  console.log(item);

  await dbItem.insertOne(item)
}

export async function getManyItem(storeId: string, storeName: string) {
  const itemData = await dbItem.findMany({ store: {storeName: storeName, storeId: storeId} });

  if (!itemData) {
    return { exists: false}
  }

  return { exists: true, data: itemData}
}

export async function deleteItem(id: string, ) {
  const itemData = await dbItem.deleteOne({ id: id });
}


export const apiItem = new Router

async function createItem(itemName: string, store: any = {}, seller: any = {}, itemInfo:any = {}, itemPrice: number) {

  const item = new Item(itemName, store, seller, itemInfo, itemPrice )
  await insertItem(item)
  return {succsess: true, error: null}

}


apiItem.post("/create", await auth, async (req,res) => {

  const i = req.body

  let on = await createItem(i.itemName, {storeName: i.storeName, storeId: i.storeId}, {username: i.username, id: i.userId} , {itemDesc: i.itemDesc}, i.itemPrice)

  if (on.succsess){
   res.redirect(`/stores/${i.storeId}`)
  }

  res.send('test')
})

apiItem.post("/delete/:id", await auth, async (req,res) => {
  await deleteItem(req.params.id)
  res.redirect(`/stores/${req.body.storeId}`)

})

apiItem.get("/store/:id/:name", await auth, async (req,res) => {

  const data = await getManyItem(req.params.id, req.params.name)
  res.send(data)
})
