import satori, { SatoriOptions } from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { Book } from "../types";
import fs from "fs";
import { uploadImageFromFile } from "./ipfs";

export const generateBookImageOG = async (book: Book) => {
  const monoFontReg = await fetch(
    "https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf",
  );

  const monoFontBold = await fetch(
    "https://api.fontsource.org/v1/fonts/inter/latin-700-normal.ttf",
  );

  const ogOptions: SatoriOptions = {
    width: 1200,
    height: 630,
    // debug: true,
    embedFont: true,
    fonts: [
      {
        name: "Roboto Mono",
        data: await monoFontReg.arrayBuffer(),
        weight: 400,
        style: "normal",
      },
      {
        name: "Roboto Mono",
        data: await monoFontBold.arrayBuffer(),
        weight: 700,
        style: "normal",
      },
    ],
  };

  const markup = (): any => html`
  <div style="background: #181A1A; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div style="width: 250px; margin: auto;">
      <img style="width: 100%; margin: auto; height: auto;" src="${book.thumbnail}" />
      <h3 style="color: #fff; text-align: center;">${book.title}</h3>
    </div>
  </div>
  `;

  const svg = await satori(markup(), ogOptions);
  console.log({svg});
  const png = new Resvg(svg).render().asPng();
  console.log({png})
  const tempPath = "/tmp/image.png";
  fs.writeFileSync(tempPath, png);
  const url = await uploadImageFromFile(tempPath);
  console.log({ url });
  return url;
}