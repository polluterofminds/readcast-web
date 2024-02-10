import Image from "next/image";

export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col m-auto justify-center align-center">
      <Image className="m-auto" height={300} width={300} src="/ReadCastLogoSmall.png" alt="ReadCast Logo" />
    </div>
  );
}
