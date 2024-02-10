import fs from "fs";
import axios from 'axios'
const download = require('image-downloader');
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_KEY || "" });


const rootpath = '/tmp/'

async function downloadImage(url: string, filepath: string) {
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
}

export const uploadImageFromUrl = async (imgUrl: string) => {
  console.log(imgUrl);
  try {
    const filepath = rootpath + Date.now().toString() + ".jpg";
    console.log(filepath);
    await downloadImage(imgUrl, filepath)
    const readableStreamForFile = fs.createReadStream(filepath);
    const options = {
      pinataMetadata: {
        name: Date.now().toString() + ".jpg"      
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    console.log(options)
    const res = await pinata.pinFileToIPFS(readableStreamForFile, options)
  
    fs.rmSync(filepath);
    return `${process.env.GATEWAY_URL}/ipfs/${res.IpfsHash}`; 
  } catch (error) {
    console.log(error);
    throw error
  }  
}

export const uploadImageFromFile = async (filepath: string) => {
  const readableStreamForFile = fs.createReadStream(filepath);
    const options = {
      pinataMetadata: {
        name: Date.now().toString() + ".png"      
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    console.log(options)
    const res = await pinata.pinFileToIPFS(readableStreamForFile, options)
  
    fs.rmSync(filepath);
    return `${process.env.GATEWAY_URL}/ipfs/${res.IpfsHash}`; 
}