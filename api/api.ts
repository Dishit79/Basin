import { Router } from "https://deno.land/x/opine/mod.ts";
import { createUser, loginUser, createToken, auth } from "./auth.ts";
import { updateUserBalance, getUser, User } from "./database/user.ts"
import { MultipartReader } from "https://deno.land/std@0.102.0/mime/mod.ts";
import { upload } from "./upload.ts"



export const api = new Router

api.post("/register", async (req,res) => {
  console.log(req.body);
  let on = await createUser(req.body.username, req.body.password)

  if (on.succsess){
    res.redirect("/")
  }
})

api.post("/login", async (req,res) => {
  let on = await loginUser(req.body.username, req.body.password)

  if (on.succsess){
    let jwt = await createToken(on!.user!.username!, on!.user!.id!)
    res.cookie({name: "token",value: jwt}).redirect("/")
  }
})

api.get("/logout", async (req,res) => {
  res.clearCookie("token").redirect("/")
})


api.get("/get/user/", await auth, async (req,res) => {

  const data = await getUser(res.locals.user.user.username)
  res.send(data)

})


api.post("/avatar/upload/", await auth, await upload, async (req,res) => {
  res.redirect('/')
})
