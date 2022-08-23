import { opine, serveStatic, urlencoded, Router, raw } from "https://deno.land/x/opine/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";
import { renderFile } from "https://deno.land/x/eta/mod.ts";
import { api } from "./api/api.ts";
import { apiStore } from "./api/stores.ts";
import { apiItem } from "./api/items.ts";
import { apiSale } from "./api/sale.ts";
import { apiTrans } from "./api/transaction.ts";
import { auth } from "./api/auth.ts";


const app = opine()
const port = 5000
const __dirname = dirname(import.meta.url);


app.engine(".html", renderFile);
app.set("view engine", "html");

app.set("view cache", false)
app.set('trust proxy', true)
app.use("/avatar", serveStatic(join(__dirname, "avatar")));
app.use(urlencoded());
app.use("/api", api)
app.use("/api/store", apiStore)
app.use("/api/item", apiItem)
app.use("/api/sale", apiSale)
app.use("/api/transaction", apiTrans)

app.get("/", await auth, async (req,res) => {

  const dataRaw1 = await fetch(`http://localhost:${port}/api/get/user`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const data1 = await dataRaw1.json()

  const dataRaw2 = await fetch(`http://localhost:${port}/api/sale/get/all`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const data2 = await dataRaw2.json()

  const dataRaw3 = await fetch(`http://localhost:${port}/api/transaction/get/all`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const data3 = await dataRaw3.json()

  res.render("index", { user: data1.data, sale: data2, transaction: data3 })
})

app.get("/stores", await auth, async (req,res) => {

  const stores = await fetch(`http://localhost:${port}/api/store/list`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })

  const dataRaw2 = await fetch(`http://localhost:${port}/api/sale/get/all`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const data2 = await dataRaw2.json()

  const dataRaw3 = await fetch(`http://localhost:${port}/api/transaction/profits`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const data3 = await dataRaw3.json()

  res.render("store",  { stores: await stores.json(), sale: data2, profits:data3, user: res.locals.user.user })
})

app.get("/sales", await auth, async (req,res) => {

  const stores = await fetch(`http://localhost:${port}/api/store/list`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })

  const dataRaw2 = await fetch(`http://localhost:${port}/api/sale/get/all`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const data2 = await dataRaw2.json()

  const dataRaw3 = await fetch(`http://localhost:${port}/api/transaction/profits`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const data3 = await dataRaw3.json()

  res.render("sales",  { stores: await stores.json(), sale: data2, profits:data3, user: res.locals.user.user })
})

app.get("/stores/:id", await auth, async (req,res) => {

  const storeRaw = await fetch(`http://localhost:${port}/api/store/get/${req.params.id}`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const store = await storeRaw.json()

  const saleRaw = await fetch(`http://localhost:${port}/api/sale/get/all/${req.params.id}`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const sale = await saleRaw.json()

  const itemsRaw = await fetch(`http://localhost:${port}/api/item/store/${store.id}/${store.storeName}`,{
    headers: {
      cookie: req.get("cookie")!.toString()
    }
  })
  const items = await itemsRaw.json()

  res.render("storefront", { store: store, items: items.data, sale: sale, user: res.locals.user.user })
})

app.get("/login", async (req,res) => {
  res.render("login")
})

app.get("/register", async (req,res) => {
  res.render("register")
})




app.listen(port);
console.log(`Opine started on localhost:${port}`)


//https://github.com/ikatson/rqbit
