import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';
import "../styles/Chat.css";
import iconFuria from "../assets/Furia_Esports_logo.png";
import logoFuria from "../assets/original-519eba43b5e06c4036ad54fe2b6e496f.jpg";
import tigerIcon from "../assets/tiger.png";
import addFriend from "../assets/person_add_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.png"
import closeAddFriend from "../assets/close_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.png"
import { io, Socket } from "socket.io-client";

interface Message {
  id?: string;
  text: string;
  isBot: boolean;
  isLoading?: boolean;
  sender?: string;
  senderName?: string;
  recipient?: string;
  isError?: boolean;
  timestamp?: Date;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  online?: boolean;
  lastSeen?: string;
  avatar?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeChat, setActiveChat] = useState<{ type: 'bot' | 'friend'; id?: string }>({ type: 'bot' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFriendsMenu, setShowFriendsMenu] = useState(!isMobile);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [friendAddActive, setFriendAddActive] = useState(false);
  const [emailFriend, setEmailFriend] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentUserId] = useState(localStorage.getItem('userId') || "1");

  // Detecta mudança de tamanho de tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Se mudou para desktop e menu está fechado, abre
      if (!mobile && !showFriendsMenu) {
        setShowFriendsMenu(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showFriendsMenu]);

  // Carrega conversas ao iniciar
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await api.get(`/friends/${currentUserId}/conversations`);
        const friendsList = response.data.map((friend: any) => ({
          id: friend.id.toString(),
          name: friend.name,
          email: friend.email,
          avatar: tigerIcon,
          online: friend.online || false,
          lastSeen: friend.lastSeen
        }));
        setFriends(friendsList);
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
      }
    };

    loadConversations();
  }, [currentUserId]);

  // Configura WebSocket
  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      query: { userId: currentUserId },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socketRef.current.on('connect', () => {
      setSocketError(null);
      console.log('Conectado ao servidor de chat');
    });

    socketRef.current.on('connect_error', (error) => {
      setSocketError("Erro na conexão com o chat. Tentando reconectar...");
      console.error("Erro de conexão:", error);
    });

    socketRef.current.on('newMessage', (message) => {
      if ((activeChat.type === 'friend' && activeChat.id === message.senderId) || 
          (activeChat.type === 'bot' && message.senderId === '0')) {
        setMessages(prev => [...prev, {
          id: message.id,
          text: message.content,
          isBot: false,
          sender: message.senderId,
          senderName: message.senderName,
          timestamp: new Date(message.timestamp)
        }]);
      }
    });

    socketRef.current.on('friendStatusChanged', ({ userId, online, lastSeen }) => {
      setFriends(prev => prev.map(friend => 
        friend.id === userId.toString() 
          ? { ...friend, online, lastSeen } 
          : friend
      ));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId, activeChat]);

  // Carrega mensagens quando muda de chat
  useEffect(() => {
    if (activeChat.type === 'friend' && activeChat.id) {
      loadMessages(activeChat.id);
    } else if (activeChat.type === 'bot') {
      loadBotMessages();
    }
  }, [activeChat]);

  const loadMessages = async (friendId: string) => {
    try {
      const response = await api.get(`/messages/${currentUserId}/${friendId}`);
      const formattedMessages = response.data.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        isBot: false,
        sender: msg.senderId.toString(),
        senderName: msg.senderName,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages([
        {
          text: `Conversa com ${friends.find(f => f.id === friendId)?.name || friendId}`,
          isBot: true,
          timestamp: new Date()
        },
        ...formattedMessages
      ]);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      setMessages([{
        text: `Conversa com ${friends.find(f => f.id === friendId)?.name || friendId}`,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  };

  const loadBotMessages = async () => {
    try {
      const response = await api.get(`/messages/${currentUserId}/bot`);
      setMessages([
        {
          text: "🔥 SEJA BEM-VINDO AO FURIABOT! Aqui a gente não fala de CS:GO... a gente GRITA!",
          isBot: true,
          timestamp: new Date()
        },
        ...response.data.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          isBot: msg.isBot,
          sender: msg.senderId.toString(),
          timestamp: new Date(msg.timestamp)
        }))
      ]);
    } catch (error) {
      console.error("Erro ao carregar mensagens do bot:", error);
      setMessages([{
        text: "🔥 SEJA BEM-VINDO AO FURIABOT! Aqui a gente não fala de CS:GO... a gente GRITA!",
        isBot: true,
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      text: inputMessage,
      isBot: false,
      sender: currentUserId,
      recipient: activeChat.type === 'friend' ? activeChat.id : undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      if (activeChat.type === 'bot') {
        const loadingMessageId = Date.now().toString();
        setMessages(prev => [...prev, { 
          id: loadingMessageId,
          text: "", 
          isBot: true, 
          isLoading: true, 
          timestamp: new Date() 
        }]);

        const response = await fetch("http://localhost:3000/furia/quest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            mensagem: inputMessage,
            userId: currentUserId 
          }),
        });

        if (!response.ok) throw new Error("Erro na resposta da API");

        const data = await response.json();
        
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== loadingMessageId),
          { 
            text: data.resposta, 
            isBot: true, 
            timestamp: new Date() 
          }
        ]);
      } else if (activeChat.id && socketRef.current) {
        const response = await socketRef.current.emitWithAck('sendMessage', {
          senderId: currentUserId,
          receiverId: activeChat.id,
          content: inputMessage
        });

        if (response?.success) {
          setMessages(prev => prev.map(msg => 
            msg.text === inputMessage && !msg.id 
              ? { ...msg, id: response.messageId, timestamp: new Date(response.timestamp) }
              : msg
          ));
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [...prev, {
        text: "ERRO: Não foi possível enviar a mensagem",
        isBot: true,
        isError: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAddFriendMenu = () => {
    setFriendAddActive(!friendAddActive);
    setSearchResults([]);
    setEmailFriend("");
  };

  const handleSearchUser = async (email: string) => {
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.get(`/friends/search?email=${encodeURIComponent(email)}&userId=${currentUserId}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Erro na busca:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStartConversation = async (email: string) => {
    try {
      const response = await api.post(`/friends/${currentUserId}/start-conversation`, { 
        email: email.toLowerCase().trim() 
      });
      
      if (response.data.success) {
        const newFriend = {
          id: response.data.friend.id.toString(),
          name: response.data.friend.name,
          email: response.data.friend.email,
          avatar: tigerIcon,
          online: response.data.friend.online || false,
          lastSeen: response.data.friend.lastSeen
        };

        if (!friends.some(f => f.id === newFriend.id)) {
          setFriends(prev => [...prev, newFriend]);
        }
        
        setEmailFriend('');
        setFriendAddActive(false);
        handleFriendClick(newFriend.id);
      }
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      alert("Erro ao iniciar conversa");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate("/login");
  };

  const handleFriendClick = (friendId: string) => {
    setActiveChat({ type: 'friend', id: friendId });
    if (isMobile) {
      setShowFriendsMenu(false);
    }
  };
  
  const handleBotClick = () => {
    setActiveChat({ type: 'bot' });
    if (isMobile) {
      setShowFriendsMenu(false);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Online agora';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Online agora';
    if (diffMinutes < 60) return `Online há ${diffMinutes} min`;
    if (diffMinutes < 1440) return `Online há ${Math.floor(diffMinutes / 60)} h`;
    
    return `Visto em ${lastSeenDate.toLocaleDateString()}`;
  };

  // Rolagem automática para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      {socketError && (
        <div className="connection-error">
          {socketError}
        </div>
      )}
      
      <header className="chat-header">
        <div>
          <img src={logoFuria} alt="FURIA Logo" className="header-logo" />
          <button 
            onClick={() => setShowFriendsMenu(!showFriendsMenu)} 
            className="menu-toggle"
          >
            {showFriendsMenu ? "Ocultar Amigos" : "Amigos"}
          </button>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </header>

      <div className="chat-layout">
        <div className={`friends-menu ${showFriendsMenu ? 'show' : ''}`}>
          <div className="friends-header">
            <h3>Amigos Furiosos</h3>
            <button className="add-friend-button" onClick={toggleAddFriendMenu}>
            {friendAddActive ? <img src={closeAddFriend} alt="closeAddFriend" /> : <img src={addFriend} alt="addFriend" />}
            </button>
          </div>
          
          <div className={`friend-add ${friendAddActive ? 'open' : ''}`}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleStartConversation(emailFriend);
            }}>
              <h3>Adicionar amigo</h3>
              <input 
                type="email" 
                placeholder="Insira o email" 
                value={emailFriend}
                onChange={(e) => {
                  setEmailFriend(e.target.value);
                  handleSearchUser(e.target.value);
                }}
                id="input-add-friend"
              />
              
              {searchLoading && <div className="loading">Buscando...</div>}
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div key={user.id} className="search-result-item">
                      <img 
                        src={user.avatar || tigerIcon} 
                        alt={user.name} 
                        className="search-avatar"
                      />
                      <div className="search-user-info">
                        <span>{user.name}</span>
                        <small>{user.email}</small>
                        <small>{user.online ? 'Online' : formatLastSeen(user.lastSeen)}</small>
                      </div>
                      <button 
                        type="button"
                        className="add-button"
                        onClick={async () => {
                          await handleStartConversation(user.email);
                        }}
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                type="submit" 
                className="add-friend-button"
                disabled={searchLoading}
              >
                {searchLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
          </div>
          
          <div className="friends-list">
            <div 
              className={`friend-item ${activeChat.type === 'bot' ? 'active' : ''}`}
              onClick={handleBotClick}
            >
              <div className="friend-avatar">
                <img src={iconFuria} alt="FURIA Bot" />
              </div>
              <div className="friend-info">
                <span className="friend-name">Furia IA</span>
                <span className="friend-status online">Online</span>
              </div>
            </div>
            
            {friends.map((friend) => (
              <div 
                key={friend.id}
                className={`friend-item ${activeChat.type === 'friend' && activeChat.id === friend.id ? 'active' : ''}`}
                onClick={() => handleFriendClick(friend.id)}
              >
                <div className="friend-avatar">
                  <img src={friend.avatar} alt={friend.name} />
                  {friend.online && <span className="online-badge"></span>}
                </div>
                <div className="friend-info">
                  <span className="friend-name">{friend.name}</span>
                  {friend.online ? (
                    <span className="friend-status online">Online</span>
                  ) : (
                    <span className="friend-status offline">
                      {formatLastSeen(friend.lastSeen)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isMobile && showFriendsMenu && (
          <div 
            className="menu-overlay"
            onClick={() => setShowFriendsMenu(false)}
          />
        )}

        <div className="chat-content">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`message ${message.isBot ? "bot" : "user"} ${
                  message.sender && message.sender !== currentUserId ? 'friend' : ''
                } ${message.isError ? 'error' : ''}`}
              >
                {message.isBot ? (
                  <div className="message-avatar">
                    <img src={iconFuria} alt="Bot Avatar" />
                  </div>
                ) : message.sender && message.sender !== currentUserId ? (
                  <div className="message-avatar">
                    <img src={friends.find(f => f.id === message.sender)?.avatar || iconFuria} alt="Friend Avatar" />
                  </div>
                ) : null}
                <div className="message-content">
                  {message.isLoading ? (
                    <div className="loading-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  ) : (
                    <>
                      {message.senderName && message.sender !== currentUserId && (
                        <div className="message-sender">{message.senderName}</div>
                      )}
                      {message.text}
                      {message.timestamp && (
                        <span className="message-timestamp">
                          {formatTime(message.timestamp)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <form onSubmit={handleSendMessage} className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  activeChat.type === 'bot' 
                    ? "Pergunte sobre a FURIA..." 
                    : `Mensagem para ${friends.find(f => f.id === activeChat.id)?.name || 'amigo'}`
                }
                disabled={isLoading}
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;