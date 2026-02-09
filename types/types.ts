export type Tweet = {
  id: string;
  name: string;
  username: string;
  time: string;
  text: string;
  image?: string;
  video?: string;
  likes: number;
  retweets: number;
  comments: number;
  liked?: boolean;
  avatar: string;
};
