export interface Review {
  id?: string;
  title: string;
  review: string;
  fid: number;
  timestamp: Date;
  stars?: number;
  hash?: string;
  thread_hash?: string;
  parent_hash?: string;
  book_uuid: string;
  books?: Book;
  weight?: number;
}

export interface OptionalReview {
  id: string;
  title?: string;
  review?: string;
  fid?: number;
  timestamp?: Date;
  stars?: number;
  hash?: string;
  thread_hash?: string;
  parent_hash?: string;
  book_uuid?: string;
  books?: Book;
  weight?: number;
}

export interface Book {
  id?: string;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  reviews?: number;
  categories?: string;
  title_author_key: string;
}

export interface User {
  fid: number;
  username?: string | null;
  pfp?: string | null;
  bio?: string;
  display_name?: string;
  signer_id?: string;
  custody_address?: string;
  active_status?: string;
}

export interface Library {
  book_id_fid_key: string;
  fid: number;
  book_id: string;
  status?: string;
  book_type?: string;
  date_completed?: Date;
}

export interface Details {
  status: string;
  bookFormat?: string;
  dateCompleted?: Date
}

export interface NeynarAuthor {
  object: string;
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
      mentioned_profiles?: string[]
    }
  }
  follower_count: number;
  following_count: number;
  verifications?: string[];
  active_status: string;
}

export interface NeynarReactions {
  likes: [{
    fid: number;
    fname: string;
  }],
  recasts: [{
    fid: number;
    fname: string;
  }]
}

export interface NeynarCast {
  object: string;
  hash: string;
  thread_hash: string;
  parent_hash?: string;
  parent_url: string;
  root_parent_url: string;
  parent_author: {
    fid?: number 
  }
  author: NeynarAuthor;
  text: string;
  timestamp: Date;
  embeds: any[];
  reactions: NeynarReactions;
  replies: {
    count: number;
  }
  mentioned_profiles: string[];
}

export interface NeynarCasts {
  casts: NeynarCast[];
  next: {
    cursor?: string;
  }
}

export type UserBySigner = {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid: number
}