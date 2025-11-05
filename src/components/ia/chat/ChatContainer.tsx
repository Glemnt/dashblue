import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContainerProps {
  isTVMode: boolean;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  quickReplies?: string[];
}

const ChatContainer = ({ 
  isTVMode, 
  messages, 
  onSendMessage, 
  isTyping = false,
  quickReplies = [
    'Por que estou atrasado na meta?',
    'Como posso acelerar os fechamentos?',
    'Qual a previsão para o fim do mês?',
    'Quem é o melhor SDR/Closer?'
  ]
}: ChatContainerProps) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const textSize = isTVMode ? 'text-xl' : 'text-base';
  const avatarSize = isTVMode ? 'w-16 h-16' : 'w-10 h-10';

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <ScrollArea 
          ref={scrollRef}
          className="flex-1 p-6"
          style={{ minHeight: isTVMode ? '600px' : '500px' }}
        >
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className={`font-bold mb-2 transition-all ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
                  Olá! Como posso ajudar?
                </h3>
                <p className={`text-muted-foreground transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Pergunte sobre suas métricas, peça análises ou simule cenários
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className={avatarSize}>
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div 
                    className={`rounded-lg p-4 transition-all ${textSize} ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-muted-foreground transition-all ${isTVMode ? 'text-base' : 'text-xs'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                    
                    {msg.role === 'assistant' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy(msg.content, idx)}
                        className={isTVMode ? 'scale-125' : ''}
                      >
                        {copiedId === idx ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {msg.role === 'user' && (
                  <Avatar className={avatarSize}>
                    <AvatarFallback className="bg-green-600 text-white text-xl">
                      👤
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-3">
                <Avatar className={avatarSize}>
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    🤖
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className={`text-muted-foreground transition-all ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                    Assistente está pensando...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Quick replies */}
        <div className="border-t p-4 bg-muted/50">
          <p className={`text-muted-foreground mb-3 transition-all ${isTVMode ? 'text-lg' : 'text-xs'}`}>
            💡 Sugestões rápidas:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size={isTVMode ? 'lg' : 'sm'}
                onClick={() => setInput(q)}
                className={`transition-all ${isTVMode ? 'text-lg' : 'text-xs'}`}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Input area */}
        <div className="border-t p-4 flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite sua pergunta..."
            className={`flex-1 resize-none transition-all ${isTVMode ? 'text-xl min-h-[120px]' : 'text-base'}`}
            rows={isTVMode ? 3 : 2}
            maxLength={500}
          />
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`h-full transition-all ${isTVMode ? 'px-8' : 'px-4'}`}
            >
              <Send className={isTVMode ? 'w-6 h-6' : 'w-4 h-4'} />
            </Button>
            <span className={`text-muted-foreground text-center transition-all ${isTVMode ? 'text-base' : 'text-xs'}`}>
              {input.length}/500
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatContainer;
