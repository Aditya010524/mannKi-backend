export interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  profilePic: string;
  coverPhoto: string;
  followers: string[];
  following: string[];
  location?: string;
  website?: string;
  createdAt: string;
}

export interface Tweet {
  id: string;
  content: string;
  user: User;
  likes: string[];
  retweets: string[];
  comments: Comment[];
  createdAt: string;
  media?: string[];
  mentions?: string[];
  hashtags?: string[];
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  createdAt: string;
  likes: string[];
}

export interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'comment' | 'follow' | 'mention';
  sender: User;
  recipient: string;
  relatedTweet?: Tweet;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: User;
  recipient: User;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}