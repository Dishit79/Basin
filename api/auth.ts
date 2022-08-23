import { hash, verify } from "https://deno.land/x/scrypt/mod.ts";
import { checkExistanceUser, insertUser, getUser, User } from "./database/user.ts"
import { create, verify as verify1, getNumericDate} from "https://deno.land/x/djwt/mod.ts"


const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

//the create user functions
export async function createUser(username: string, password: string){

  //Hash passwords
  const hashedPassword = await hash(password);
  let user = new User(username, hashedPassword)

  //send to db
  let existance = await checkExistanceUser(user)
  if (existance.username){
    return {succsess: false, error: "username invalid"}
  }

  //insert into db
  await insertUser(user)
  return {succsess: true, error: null}
}

export async function loginUser(username: string, password: string){

  const userData = await getUser(username)

  if (!userData.exists){
    return {succsess: false, error: "User doesnt exist"}
    }


  //check hashed passwords
  const verifyResult = await verify(password, userData!.data!.password);

  if (verifyResult !== true){
    return {succsess: false, error: "password incorrect"}
  }
  return {succsess: true, error: null, user: userData.data }
}

export async function createToken(username: string, id: string){
    let user = {username: username, id: id}
    const jwt = await create({ alg: "HS512", typ: "JWT" }, {   exp: getNumericDate(60 * 60) , user: user }, key)
    return jwt
}

export async function auth(req:any, res:any, next:any){
  const rawToken = req.get("cookie");

  try{
    const payload = await verify1(rawToken.substr(6), key)
    res.locals.user = payload
    next()

  } catch (e) {
    res.redirect("/login")
  }
}
