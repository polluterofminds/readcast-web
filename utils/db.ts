
import { createClient } from '@supabase/supabase-js'
import { Book, Details, Library, OptionalReview, Review, User, UserBySigner } from '../types';

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

export const updateUserWithSigner = async (user: User, signer_id: string) => {
  const { error } = await supabase
    .from('users')
    .upsert({ ...user, signer_id }, { onConflict: 'fid' })

  if (error) {
    throw error;
  }
}

export const getUserBySigner = async (signer: string) => {
  try {
    if (signer === process.env.APP_REVIEWER_PASSWORD) {
      return {
        fid: parseInt(process.env.APP_REVIEWER_FID || "0", 10),
        signer_uuid: "0",
        public_key: "0",
        status: "0",
        signer_approval_url: "0"
      }
    }

    const res: any = await fetch(`https://api.neynar.com/v2/farcaster/signer?signer_uuid=${signer}`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'api_key': process.env.NEYNAR_KEY || ""
      }
    })

    const userData: UserBySigner = await res.json();
    console.log(userData);
    return userData;
  } catch (error) {

  }
}

export const addReview = async (review: Review) => {
  const { error } = await supabase
    .from('reviews')
    .upsert(review, { onConflict: 'review' })

  if (error) {
    console.log("REVIEW ERROR")
    console.log(error);
    throw error;
  }
}

export const addBook = async (book: Book) => {
  const { data: bookData, error } = await supabase
    .from('books')
    .upsert(book, { onConflict: 'title_author_key' })
    .select()
  if (error) {
    throw error;
  }
  return bookData[0]
}

export const updateBook = async (updatedBook: Book) => {
  const { error } = await supabase
    .from('books')
    .update(updatedBook)
    .eq("id", updatedBook.id)

  if (error) {
    throw error;
  }
}

export const addUser = async (user: User) => {
  const { error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'fid' })
  if (error) {
    console.log("Adding user error")
    console.log(error);
    throw error;
  }
}

export const findUser = async (fid: number) => {
  const { data, error } = await supabase
    .from('users')
    .select(`*`)
    .eq("fid", fid)

  if (error) {
    throw error;
  }

  return data;
}

export const getReviews = async (start: number = 0) => {
  const end = 50 + start;
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, books(title, author, description, thumbnail)`)
    .order('timestamp', { ascending: false })
    .range(start, end)

  if (error) {
    throw error;
  }

  return data;
}

export const getReviewsById = async (id: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, books(title, author, description, thumbnail)`)
    .eq("id", id);

  if (error) {
    throw error;
  }

  return data[0];
}

export const updateReview = async (updates: OptionalReview) => {

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', updates.id)
    .select()

    if(error) {
      console.log("Error updating review weight")
    }
}

export const getBooks = async (start: number = 0) => {
  const end = 50 + start;
  const { data, error } = await supabase
    .from('books')
    .select(`*, reviews(count)`)
    .range(start, end)

  if (error) {
    throw error;
  }

  return data;
}

export const getTrendingBooks = async () => {
  //  Trending means more than 3 review, limited to 10 most recent
  const { data, error } = await supabase
    .from('books_with_review_count')
    .select(`*`)
    .gt("reviews", 3)
    .order('reviews', { ascending: false })
    .limit(10)

  if (error) {
    throw error;
  }

  return data;
}

export const getNewestReviews = async () => {
  const { data, error } = await supabase
    .from('books_with_review_count')
    .select(`*`)
    .gte("reviews", 1)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    throw error;
  }

  return data;
}

export const getFictionBooks = async () => {
  const { data, error } = await supabase
    .from('books_with_review_count')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
    .eq("categories", "Fiction")


  if (error) {
    throw error;
  }

  return data;
}

export const getBooksByTitle = async (title: string) => {
  const words = title.split(" ");
  console.log("Searching for: ", title)
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .textSearch('title', `'${words.join("' & '")}'`)
    .order('created_at', { ascending: false })


  if (error) {
    console.log({ error })
    throw error;
  }

  return data;
}

export const getBooksById = async (id: string) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq("id", id);


  if (error) {
    console.log({ error })
    throw error;
  }

  return data[0];
}

export const getBooksByCategory = async (category: string) => {
  if (category === "Newest") {
    const { data, error } = await supabase
      .from('books_with_review_count')
      .select(`*`)
      .limit(50)
      .gte("reviews", 1)
      .order('created_at', { ascending: false })
    if (error) {
      throw error;
    }
    return data;
  } else if (category === "Trending") {
    const { data, error } = await supabase
      .from('books_with_review_count')
      .select(`*`)
      .gt("reviews", 1)
      .order('reviews', { ascending: false })
    if (error) {
      throw error;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from('books_with_review_count')
      .select(`*`)
      .eq("categories", category)
      .order('created_at', { ascending: false })

    if (error) {
      throw error;
    }
    return data;
  }
}

export const getReviewsForBook = async (title: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, users(id, fid, username, pfp, bio, display_name)`)
    .eq("title", title)
    .order('timestamp', { ascending: false })

  if (error) {
    throw error;
  }

  return data;
}

export const addToLibrary = async (book: Book, fid: number, details?: Details) => {
  //  Need to check if book is already in the db/add it
  const bookData: Book = {
    title: book.title,
    author: book.author,
    description: book.description,
    thumbnail: book.thumbnail,
    categories: book.categories,
    title_author_key: `${book.title}-${book.author}`
  }

  const bookResult = await addBook(bookData);
  console.log("Upsert book")
  const payload: Library = {
    fid,
    book_id: bookResult.id,
    book_type: details?.bookFormat || "paperback",
    date_completed: details?.dateCompleted,
    book_id_fid_key: `${book.id!}-${fid}`
  }

  if (details && details.status) {
    payload["status"] = details.status;
  }

  const { data, error } = await supabase
    .from('library')
    .upsert(payload, { onConflict: "book_id_fid_key" })
    .select()
  if (error) {
    throw error;
  }

  return data
}

export const updateLibraryStatus = async (id: string, fid: number, details: Details, book: Book) => {
  console.log(details)
  const { data, error } = await supabase
    .from('library')
    .update({
      status: details.status,
      book_type: details?.bookFormat,
      date_completed: details?.dateCompleted,
    })
    .eq('id', id)
    .select()

  if (error) {
    throw error;
  }

  return data
}

export const loadLibrary = async (fid: number) => {
  const { data, error } = await supabase
    .from('library')
    .select(`*, books(*)`)
    .eq("fid", fid)
    .order('created_at', { ascending: false })

  if (error) {
    throw error;
  }

  return data;
}

export const getBookFromLibrary = async (bookId: string, fid: number) => {
  const { data, error } = await supabase
    .from('library')
    .select(`*, books(*)`)
    .eq("fid", fid)
    .eq("book_id", bookId)

  if (error) {
    throw error;
  }
  if (!data || data.length === 0) {
    return null;
  } else {
    return data[0];
  }
}

export const removeBookFromLibrary = async (id: string, fid: number) => {
  const { data, error } = await supabase
    .from('library')
    .delete()
    .eq("fid", fid)
    .eq("id", id)

  if (error) {
    throw error;
  }
  console.log({ data })
  return data;
}

export const addCorrection = async (bookId: string, corrections: any, fid: number, correctionText?: string) => {
  const payload = {
    submitted_by: fid,
    book_id: bookId,
    corrections,
    correction_text: correctionText
  }
  const { data, error } = await supabase
    .from('corrections')
    .insert([payload])
    .select()
  if (error) {
    throw error;
  }

  return data
}

export const addTestFlighters = async (user: User) => {
  const { data, error } = await supabase
    .from('test_flight_testers')
    .insert([user])
    .select()
  if (error) {
    throw error;
  }

  return data
}