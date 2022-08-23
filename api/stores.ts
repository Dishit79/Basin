import { Router } from "https://deno.land/x/opine/mod.ts";
import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { auth } from "./auth.ts"

export const apiStore = new Router


// Structure of stored documents
interface StoreDB {
  id: string
  storeName: string
  owner: any
  storeInfo: any
  type: number
}
// Initialization
const db = new Database<StoreDB>('store.json');

export class Store {
  id: string
  storeName: string
  owner: any = {}
  storeInfo: any = {}
  type = 1

  constructor(storeName: string, owner: any = {}, storeInfo: any = {}) {
    this.storeName = storeName
    this.owner = owner
    this.storeInfo = storeInfo
    this.id = v4.generate()
  }
}

export async function insertStore(store: Store) {
  await db.insertOne(store)
}

export async function getStore(storeName: string, ) {
  const storeData = await db.findOne({ storeName: storeName });

  if (!storeData) {
    return { exists: false}
  }

  return { exists: true, data: storeData}
}

export async function getStoreID(id: string, ) {
  const storeData = await db.findOne({ id: id });
  return storeData
}

export async function deleteStore(id: string, ) {
  const storeData = await db.deleteOne({ id: id });
}

export async function getManyStore() {
  const storeData = await db.findMany({ type: 1 });

  return storeData
}






async function createStore(username: string, owner: any = {}, storeInfo: any = {}) {

  const store = new Store(username, owner, storeInfo )

  await insertStore(store)
  return {succsess: true, error: null}

}


apiStore.post("/create", await auth, async (req,res) => {
  console.log(req.body);

  let on = await createStore(req.body.storeName, res.locals.user.user, {info: req.body.storeInfo})

  if (on.succsess){
    res.redirect("/stores")
  }
})

apiStore.post("/delete/:id", await auth, async (req,res) => {
  await deleteStore(req.params.id)
 res.redirect("/stores")
})


apiStore.get("/list", await auth, async (req,res) => {

  const stores = await getManyStore()
  res.send(stores)
})

apiStore.get("/get/:id", await auth, async (req,res) => {
  const storeData = await getStoreID(req.params.id)
  res.send(storeData)
})
