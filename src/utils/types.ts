// Attachment types

export enum AttachmentType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

// Message types

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

// Friend types

export enum FriendStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

// Group privacy
export enum GroupPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
}
// Group member role
export enum GroupRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

// Socket events
export enum SocketEvents {
  // Connection Events
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',

  // User Status Events
  USER_STATUS = 'userStatus',
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',

  // Group Events
  JOIN_GROUP = 'joinGroup',
  LEAVE_GROUP = 'leaveGroup',
  GET_ONLINE_USERS = 'getOnlineUsers',
  ONLINE_USERS_RECEIVED = 'onlineUsersReceived',

  // Message Events
  CREATE_MESSAGE = 'createMessage',
  NEW_MESSAGE = 'newMessage',
  MESSAGE_HISTORY = 'messageHistory',
  MESSAGE_DELETED = 'messageDeleted',
  MESSAGE_UPDATED = 'messageUpdated',

  // Typing Events
  TYPING_START = 'typingStart',
  TYPING_STOP = 'typingStop',

  // Group Activity Events
  GROUP_UPDATED = 'groupUpdated',
  GROUP_DELETED = 'groupDeleted',
  MEMBER_ADDED = 'memberAdded',
  MEMBER_REMOVED = 'memberRemoved',
  MEMBER_ROLE_UPDATED = 'memberRoleUpdated',

  // Error Events
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'notFound',

  // System Events
  SYSTEM_MESSAGE = 'systemMessage',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnectAttempt',
  RECONNECT_ERROR = 'reconnectError',
  RECONNECT_FAILED = 'reconnectFailed',
}
