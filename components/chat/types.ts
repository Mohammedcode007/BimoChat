import { MessageItem } from "@/redux/slices/messageSlice";
import React from "react";

export type RelationshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "blocked_by_me"
  | "blocked_me";

export type ProfileUser = {
  _id: string;
  username: string;
  atUsername?: string;
  bio?: string;
  country?: string;
  city?: string;
  avatar?: string;
  coverImage?: string;
  dateOfBirth?: string;
  followersCount?: number;
  followingCount?: number;
  totalLikesReceived?: number;
  profileViews?: number;
  isOnline?: boolean;
  lastSeen?: string;
  isVerified?: boolean;
  tags?: string[];
  relationshipStatus?: RelationshipStatus;
  isFollowing?: boolean;
};

export type SearchResultItem = {
  _id: string;
  chat: string;
  sender:
    | string
    | {
        _id: string;
        username?: string;
        avatar?: string;
      };
  content: string;
  type: string;
  media?: any;
  replyTo?: any;
  createdAt: string;
  updatedAt: string;
};

export type ReplyState =
  | {
      _id: string;
      content?: string;
      type?: string;
      sender?: string;
      media?: any;
    }
  | null;

export type MediaSendingState = Record<string, "uploading" | "sending">;

export type MessageBubbleProps = {
  item: MessageItem;
  currentUserId?: string;
  isDark: boolean;

  inputSearchValue: string;
  highlightedMessageIds: Set<string>;
  selectedSearchMessageId: string | null;

  mediaSendingState: MediaSendingState;

  onLongPress: (item: MessageItem) => void;
  onCopy: (item: MessageItem) => void;
  onImagePreview: (uri: string) => void;
  onJoinRoom: (roomId: string) => void;

  renderReplyBlock: (item: any, isMe: boolean) => React.ReactNode;

  renderHighlightedText: (
    content: string,
    query: string,
    isMe: boolean,
    isActiveResult: boolean
  ) => React.ReactNode;
};