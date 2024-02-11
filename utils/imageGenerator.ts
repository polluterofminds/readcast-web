import satori, { SatoriOptions } from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { Book } from "../types";
import fs from "fs";
import { uploadImageFromFile } from "./ipfs";
import axios from 'axios';
const sharp = require('sharp')

async function downloadImage(url: string, filepath: string) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
  });
  return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath)); 
  });
  } catch (error) {
    console.log(error);
  }
}

export const generateBookImageOG = async (book: Book) => {
  const tempPath = "/tmp/image.png";
  const backgroundTemp = "/tmp/background.png"
  const endFile = "/tmp/final.png";
  await downloadImage(book.thumbnail, tempPath)
  await downloadImage("https://readcast.mypinata.cloud/ipfs/QmbD72te2tUWKrfXL311Tt8CMCnc9AuSd6osX4nLB7VWZY", backgroundTemp)
  const { data, info }: any = await sharp(tempPath)
  .resize({
    width: 150
  })
  .toBuffer({ resolveWithObject: true }) 
  
  await sharp(backgroundTemp)       
      .composite([{ 
        input: data
      }])
      .toFile(endFile, function(err: any) {
        console.log("Error: ", err)
      });
  
  const url = await uploadImageFromFile(endFile);
  console.log({ url });
  return url;
}