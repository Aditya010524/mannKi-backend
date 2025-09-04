// import { io, Socket } from 'socket.io-client';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_BASE_URL from '@/config/api';

// class SocketService {
//   private socket: Socket | null = null;
//   private isConnected = false;

//   async connect(): Promise<void> {
//     if (this.socket?.connected) return;

//     try {
//       // const token = await AsyncStorage.getItem('authToken');
      
//       //  if //(!token) {
//       //   console.warn('No auth token found, cannot connect to socket');
//       //   return;
//       // }

//       // Convert API URL to socket URL (remove /api)
//       const socketURL = API_BASE_URL.replace('/api', '');
      
//       this.socket = io(socketURL, {
//         auth: {
//           // token,
//         },
//         transports: ['websocket'],
//         forceNew: true,
//       });

//       this.socket.on('connect', () => {
//         console.log('✅ Socket connected');
//         this.isConnected = true;
//       });

//       this.socket.on('disconnect', () => {
//         console.log('❌ Socket disconnected');
//         this.isConnected = false;
//       });

//       this.socket.on('connect_error', (error) => {
//         console.error('❌ Socket connection error:', error);
//         this.isConnected = false;
//       });

//     } catch (error) {
//       console.error('Failed to connect socket:', error);
//     }
//   }

//   disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       this.isConnected = false;
//       console.log('🔌 Socket disconnected manually');
//     }
//   }

//   // Tweet events
//   onNewTweet(callback: (tweet: any) => void): void {
//     this.socket?.on('new_tweet', callback);
//   }

//   onTweetLiked(callback: (data: { tweetId: string; userId: string; likesCount: number; liked: boolean }) => void): void {
//     this.socket?.on('tweet_liked', callback);
//   }

//   onTweetRetweeted(callback: (data: { tweetId: string; userId: string; retweetsCount: number; retweeted: boolean }) => void): void {
//     this.socket?.on('tweet_retweeted', callback);
//   }

//   onTweetCommented(callback: (data: { tweetId: string; comment: any }) => void): void {
//     this.socket?.on('tweet_commented', callback);
//   }

//   // Notification events
//   onNewNotification(callback: (notification: any) => void): void {
//     this.socket?.on('new_notification', callback);
//   }

//   onNotificationRead(callback: (notificationId: string) => void): void {
//     this.socket?.on('notification_read', callback);
//   }

//   // Message events
//   onNewMessage(callback: (message: any) => void): void {
//     this.socket?.on('new_message', callback);
//   }

//   onMessageRead(callback: (data: { conversationId: string; messageId: string }) => void): void {
//     this.socket?.on('message_read', callback);
//   }

//   onUserOnline(callback: (userId: string) => void): void {
//     this.socket?.on('user_online', callback);
//   }

//   onUserOffline(callback: (userId: string) => void): void {
//     this.socket?.on('user_offline', callback);
//   }

//   onUserTyping(callback: (data: { userId: string; username: string }) => void): void {
//     this.socket?.on('user_typing', callback);
//   }

//   onUserStopTyping(callback: (data: { userId: string }) => void): void {
//     this.socket?.on('user_stop_typing', callback);
//   }

//   // Emit events
//   joinRoom(roomId: string): void {
//     this.socket?.emit('join_room', roomId);
//   }

//   leaveRoom(roomId: string): void {
//     this.socket?.emit('leave_room', roomId);
//   }

//   sendMessage(data: { recipientId: string; content: string }): void {
//     this.socket?.emit('send_message', data);
//   }

//   markMessageAsRead(messageId: string): void {
//     this.socket?.emit('mark_message_read', messageId);
//   }

//   startTyping(conversationId: string): void {
//     this.socket?.emit('typing_start', { conversationId });
//   }

//   stopTyping(conversationId: string): void {
//     this.socket?.emit('typing_stop', { conversationId });
//   }

//   setUserOnline(): void {
//     this.socket?.emit('user_online');
//   }

//   // Remove event listeners
//   off(event: string): void {
//     this.socket?.off(event);
//   }

//   get connected(): boolean {
//     return this.isConnected && this.socket?.connected === true;
//   }
// }

// export const socketService = new SocketService();
// export default socketService;




// untill backend not ready 
// socketService.ts
import { io, Socket } from "socket.io-client";
import API_BASE_URL from "@/config/api";

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    // Temporarily disable socket since backend not ready
    console.log("⚠️ Socket connection skipped (backend not ready)");
    return;

    // If backend is ready, uncomment below:
    /*
    if (this.socket?.connected) return;

    try {
      const socketURL = API_BASE_URL.replace("/api", "");
      this.socket = io(socketURL, {
        transports: ["websocket"],
        forceNew: true,
        reconnection: false,
      });

      this.socket.on("connect", () => {
        console.log("✅ Socket connected");
        this.isConnected = true;
      });

      this.socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.warn("⚠️ Socket connection failed:", error.message);
        this.isConnected = false;
        this.socket?.disconnect();
        this.socket = null;
      });
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
    */
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
    console.log("🔌 Socket disconnected manually");
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  emit(event: string, data?: any): void {
    if (!this.connected) {
      console.log(`⚠️ Skipped emit(${event}) - socket not connected`);
      return;
    }
    this.socket?.emit(event, data);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

export const socketService = new SocketService();
export default socketService;
