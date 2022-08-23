import * as R from 'https://cdn.skypack.dev/ramda@^0.27.1'
import { exists } from 'https://deno.land/std@0.102.0/fs/exists.ts'
import { MultipartReader } from "https://deno.land/std@0.102.0/mime/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";


const __dirname = dirname(import.meta.url);


const { compose, nth, split } = R

const getBoundary = compose(
  nth(1),
  split('='),
  nth(1),
  split(';')
)

const fieldName = "file"

export async function upload(req: any, res: any, next: any) {
  let boundary;

  const contentType = req.get('content-type')
  //console.log('contentType: ', contentType)
  if (contentType.startsWith('multipart/form-data')) {
    boundary = getBoundary(contentType);
  }
  console.log('boundary: ', boundary)

  const form = await new MultipartReader(req.body, boundary).readForm({
    maxMemory: 10 << 20,
    dir: "/api/database/avatar/"
  })

  // @ts-ignore
  let test = form.files(fieldName)[0]

  console.log(import.meta.main)

  if (("content" in test)==true){
    console.log("real");
    await Deno.writeFile(`avatar/${res.locals.user.user.id}`, test.content!, {create: true});
  }
  next()
}
