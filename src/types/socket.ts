export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export interface SocketMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  attachments?: any[];
  status: MessageStatus;
  createdAt: Date;
}
