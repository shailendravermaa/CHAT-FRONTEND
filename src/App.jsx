import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LucideHeart, LucideMessageCircle, LucideMessageSquare, LucideSend } from "lucide-react";





const initialMessages = [
  {
    id: "1",
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Software Engineer",
    },
    content:
      "Has anyone gone through the system design interview at Tech Corp recently? I'm preparing for one next week and would appreciate any tips.",
    timestamp: "2 hours ago",
    likes: 5,
    replies: 3,
    
  },
  {
    id: "2",
    user: {
      name: "Jamie Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Senior Developer",
    },
    content:
      "I just had one last month! They asked me to design a distributed cache system. Focus on scalability, data consistency, and failure handling. Make sure to clarify requirements before diving into the solution.",
    timestamp: "1 hour ago",
    likes: 8,
    replies: 1,
    
  },
];

// Main ForumPage component
export default function ForumPage() {
  // State for the list of messages and the new message input
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  
  // Refs for scrolling to the latest message and managing the Socket.IO connection
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Effect to establish Socket.IO connection and set up message listener
  useEffect(() => {
    // Connect to the Socket.IO server
    socketRef.current = io("https://socketproject-production.up.railway.app");
    
    // Listen for incoming "user-message" events from the server
    socketRef.current.on("user-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socketRef.current.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return; // Prevent sending empty messages

    // Create a full message object with user details
    const message = {
      id: Date.now().toString(), // Unique ID based on timestamp
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Member",
      },
      content: newMessage,
      timestamp: "Just now",
      likes: 0,
      replies: 0,
      tags: [],
    };

    // Emit the message to the server via Socket.IO
    socketRef.current.emit("user-message", message);
    
    // Clear the input field
    setNewMessage("");
    // Note: We don't add the message to state locally; it will be added when the server broadcasts it back
  };

  // Function to handle liking a message (local state update)
  const handleLike = (id) => {
    setMessages(messages.map((msg) =>
      msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg
    ));
  };

  // Effect to scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // JSX rendering the forum interface
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Common Q&A Forum</h1>
        <p className="text-muted-foreground">Ask questions, share answers, and collaborate with other candidates</p>
      </div>

      <div className="flex flex-col h-[calc(100vh-300px)]">
        {/* Messages display area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-6">
          {messages.length > 0 ? (
            messages.map((message) => (
              <Card key={message.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={message.user.avatar} alt={message.user.name} />
                        <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{message.user.name}</CardTitle>
                        <CardDescription>
                          {message.user.role} • {message.timestamp}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
               
                <CardFooter className="pt-0 flex justify-between">
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleLike(message.id)}
                    >
                      <LucideHeart className="mr-1 h-4 w-4" />
                      {message.likes}
                    </Button>
                    
                  </div>
                  
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <LucideMessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input area */}
        <Card className="sticky bottom-0">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[80px] flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                className="self-end"
                onClick={handleSendMessage}
                disabled={newMessage.trim() === ""}
              >
                <LucideSend className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}