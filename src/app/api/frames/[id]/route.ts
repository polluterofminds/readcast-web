import { NextRequest, NextResponse } from "next/server";
import { addToLibrary, getBooksById, getReviewsById, updateReview } from "../../../../../utils/db";
import { generateBookImageOG } from "../../../../../utils/imageGenerator";
import { Review } from "../../../../../types";
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const client = getSSLHubRpcClient("hub-grpc.pinata.cloud");

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const slug = params.id;
    console.log(slug)
    //  Now let's get the book data from the id
    const review: Review = await getReviewsById(slug);
    if (!review) {
      console.log("Could not find review")
      return NextResponse.json({
        error: "Could not find review"
      }, {
        status: 400,
        statusText: "Could not find review"
      })
    }

    if (!review.books) {
      console.log("Could not find book")
      return NextResponse.json({
        error: "Could not find book"
      }, {
        status: 400,
        statusText: "Could not find book"
      })
    }


    const imgUrl = await generateBookImageOG(review.books);
    console.log(imgUrl)
    if (!imgUrl) {
      console.log("no image")
      return NextResponse.json({
        error: "No image generated"
      }, {
        status: 400,
        statusText: "No image generated"
      })
    }

    //  Then we'll send back the html template with the correct image
    const GET_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
 <head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta http-equiv="X-UA-Compatible" content="ie=edge">
   <meta property="fc:frame:image" content="${imgUrl}" />
   <meta property="fc:frame:image:aspect_ratio" content="1:1" />
   <meta property="fc:frame:button:1" content="Add to ReadCast library" />
   <meta property="fc:frame:button:2" content="Upvote review" />
   <meta property="og:title" content="${review.books.title}" />
   <meta property="og:image" content="${imgUrl}" />
   <meta property="fc:frame" content="vNext" />        
 <title>${review.books.title}</title>
 </head>
 <body style="background: #181A1A; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh;">
   <div style="width: 250px; margin: auto;">
     <img style="width: 100%; margin: auto; height: auto;" src="${imgUrl}" />
     <h3 style="color: #fff; text-align: center;">${review.books.title}</h3>
   </div>
 </body>
</html>`

    return new Response(GET_TEMPLATE, {
      status: 200,
    });
  } catch (error) {
    console.log("Frame error")
    console.log(error);
    return NextResponse.json({
      error: "Server error"
    }, {
      status: 500,
      statusText: "Server error"
    })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const slug = params.id;
    //  First let's verify the data
    const body = await request.json();
    console.log(body);
    const { trustedData, untrustedData } = body;
    const frameMessage = Message.decode(Buffer.from(trustedData?.messageBytes || '', 'hex'));
    const result = await client.validateMessage(frameMessage);

    if (!result.isOk() || !result.value.valid) {
      console.log("Unauthorized");
      return NextResponse.json({
        error: "Unauthorized"
      }, {
        status: 401,
        statusText: "Unauthorized"
      })
    }

    //  Now let's get the book data from the id
    const review: Review = await getReviewsById(slug);
    if (!review) {
      console.log("Could not find review")
      return NextResponse.json({
        error: "Could not find review"
      }, {
        status: 400,
        statusText: "Could not find review"
      })
    }

    if (!review.books) {
      console.log("Could not find book")
      return NextResponse.json({
        error: "Could not find book"
      }, {
        status: 400,
        statusText: "Could not find book"
      })
    }

    const imgUrl = await generateBookImageOG(review.books);

    if (!imgUrl) {
      console.log("no image")
      return NextResponse.json({
        error: "No image generated"
      }, {
        status: 400,
        statusText: "No image generated"
      })
    }

    let addToLibraryText = "";
    let upvoteReviewText = "";

    if (untrustedData.buttonIndex === 1) {
      try {
        await addToLibrary(review.books, untrustedData.fid, { status: "tbr" });
        addToLibraryText = "Added, see it in ReadCast!"
      } catch (error) {
        console.log("FID: ", untrustedData.fid);
        console.log(error);
        addToLibraryText = "Trouble adding to library"
      }
    } else if (untrustedData.buttonIndex === 2) {
      try {
        await updateReview({
          id: review.id as string,
          weight: review.weight ? review.weight + 1 : 1
        })
        upvoteReviewText = "Review upvoted!"
      } catch (error) {
        console.log("Error upvoting")
        console.log(error);
        upvoteReviewText = "Trouble upvoting"
      }
    } else {
      console.log("Invalid button index");
      return NextResponse.json({
        error: "Invalid button index"
      }, {
        status: 400,
        statusText: "Invalid button index"
      })
    }

    //  Then we'll send back the html template with the correct image
    const POST_TEMPLATE = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <meta property="fc:frame:image" content="https://readcast.mypinata.cloud/ipfs/QmSx5HNEgXTBXyQeNNELf9dnBVEvFD6i5naF3vTZXFe2Ex" />        
        <meta property="fc:frame:button:1" content="${addToLibraryText}" />
        <meta property="fc:frame:button:2" content="${upvoteReviewText}" />
        <meta property="og:image" content="https://readcast.mypinata.cloud/ipfs/QmSx5HNEgXTBXyQeNNELf9dnBVEvFD6i5naF3vTZXFe2Ex" />
        <meta property="og:title" content="${review.books.title}" />
        <meta property="fc:frame" content="vNext" />        
      <title></title>
      </head>
      <body style="background: #181A1A; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh;">
        <div style="width: 250px; margin: auto;">
          <img style="width: 100%; margin: auto; height: auto;" src="https://readcast.mypinata.cloud/ipfs/QmSx5HNEgXTBXyQeNNELf9dnBVEvFD6i5naF3vTZXFe2Ex" />
          <h3 style="color: #fff; text-align: center;">${review.books.title}</h3>
        </div>
      </body>
    </html>`

    return new Response(POST_TEMPLATE, {
      status: 200,
    });
  } catch (error) {
    console.log("Frame error")
    console.log(error);
    return NextResponse.json({
      error: "Server error"
    }, {
      status: 500,
      statusText: "Server error"
    })
  }
}