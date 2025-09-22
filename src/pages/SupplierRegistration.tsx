import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface SupplierData {
  companyName?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  products?: string[];
  certifications?: string[];
  capacity?: string;
  experience?: string;
  completeness: number;
}

export default function SupplierRegistration() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! Sou seu assistente inteligente para cadastro de fornecedores. Vou te ajudar a registrar sua empresa de forma rápida e eficiente. Para começar, me conte um pouco sobre sua empresa - nome, produtos que oferece, onde está localizada...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supplierData, setSupplierData] = useState<SupplierData>({ completeness: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = (message: string): Partial<SupplierData> => {
    const extracted: Partial<SupplierData> = {};
    
    // Extract company name (basic pattern)
    const companyPatterns = [
      /(?:empresa|companhia|corporação|ltda|sa|eireli|mei)\s+([^.,\n]+)/i,
      /^([A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÇ][a-záéíóúâêîôûàèìòùç\s&]+)(?:\s+ltda|sa|eireli|mei)?/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.companyName = match[1]?.trim();
        break;
      }
    }

    // Extract CNPJ
    const cnpjMatch = message.match(/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/);
    if (cnpjMatch) {
      extracted.cnpj = cnpjMatch[1];
    }

    // Extract products
    const productKeywords = ['carne', 'frango', 'porco', 'beef', 'chicken', 'pork', 'proteína', 'açougue', 'frigorífico'];
    const foundProducts = productKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundProducts.length > 0) {
      extracted.products = foundProducts;
    }

    // Extract location
    const locationMatch = message.match(/(?:em|de|localizada|situada)\s+([^.,\n]+)/i);
    if (locationMatch) {
      extracted.address = locationMatch[1]?.trim();
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<SupplierData>, currentData: SupplierData): string => {
    const missingFields = [];
    
    if (!currentData.companyName && !userData.companyName) {
      missingFields.push('nome da empresa');
    }
    if (!currentData.cnpj && !userData.cnpj) {
      missingFields.push('CNPJ');
    }
    if (!currentData.address && !userData.address) {
      missingFields.push('endereço');
    }
    if (!currentData.phone) {
      missingFields.push('telefone');
    }
    if (!currentData.email) {
      missingFields.push('email');
    }
    if (!currentData.certifications || currentData.certifications.length === 0) {
      missingFields.push('certificações (SIF, ISO, etc.)');
    }
    if (!currentData.capacity) {
      missingFields.push('capacidade de produção');
    }

    // If we extracted new data
    if (Object.keys(userData).length > 0) {
      let response = "Perfeito! Consegui identificar ";
      const extractedItems = [];
      
      if (userData.companyName) extractedItems.push(`nome da empresa: ${userData.companyName}`);
      if (userData.cnpj) extractedItems.push(`CNPJ: ${userData.cnpj}`);
      if (userData.products) extractedItems.push(`produtos: ${userData.products.join(', ')}`);
      if (userData.address) extractedItems.push(`localização: ${userData.address}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nPara completar seu cadastro, preciso de mais algumas informações: ${missingFields.slice(0, 2).join(' e ')}. `;
        
        if (missingFields.includes('certificações (SIF, ISO, etc.)')) {
          response += "Vocês possuem certificações como SIF, ISO 22000 ou outras? ";
        } else if (missingFields.includes('capacidade de produção')) {
          response += "Qual é a capacidade mensal de produção de vocês? ";
        }
      } else {
        response += "\n\n🎉 Cadastro quase completo! Só preciso confirmar alguns detalhes finais.";
      }
      
      return response;
    }

    // No new data extracted
    if (missingFields.length > 0) {
      return `Entendi! Vou precisar de mais algumas informações para completar o cadastro. Pode me informar o ${missingFields[0]}?`;
    }

    return "Excelente! Todas as informações principais foram coletadas. Vou processar seu cadastro.";
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const extractedData = analyzeMessage(currentMessage);
      const newSupplierData = { ...supplierData, ...extractedData };
      
      // Calculate completeness
      const totalFields = 7; // companyName, cnpj, address, phone, email, certifications, capacity
      let filledFields = 0;
      if (newSupplierData.companyName) filledFields++;
      if (newSupplierData.cnpj) filledFields++;
      if (newSupplierData.address) filledFields++;
      if (newSupplierData.phone) filledFields++;
      if (newSupplierData.email) filledFields++;
      if (newSupplierData.certifications?.length) filledFields++;
      if (newSupplierData.capacity) filledFields++;
      
      newSupplierData.completeness = Math.round((filledFields / totalFields) * 100);
      
      setSupplierData(newSupplierData);

      const aiResponse = generateAIResponse(extractedData, supplierData);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Cadastro Inteligente de Fornecedores</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-card border-0 shadow-soft">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Progresso do Cadastro
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Completude</span>
                  <span className="font-semibold">{supplierData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${supplierData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.companyName ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Nome da Empresa</span>
                  {supplierData.companyName && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.cnpj ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">CNPJ</span>
                  {supplierData.cnpj && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.products?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Produtos</span>
                  {supplierData.products?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.address ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Localização</span>
                  {supplierData.address && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {supplierData.companyName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Dados Coletados:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Empresa:</strong> {supplierData.companyName}</div>
                    {supplierData.cnpj && <div><strong>CNPJ:</strong> {supplierData.cnpj}</div>}
                    {supplierData.address && <div><strong>Local:</strong> {supplierData.address}</div>}
                    {supplierData.products?.length && (
                      <div>
                        <strong>Produtos:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {supplierData.products.map((product, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] bg-gradient-card border-0 shadow-soft flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-primary">Assistente IA</span>
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-4'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center ai-glow">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-primary">Assistente IA</span>
                        <Clock className="h-4 w-4 text-muted-foreground animate-spin" />
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary text-secondary-foreground">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite as informações da sua empresa..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isTyping}
                    size="icon"
                    className="bg-gradient-button hover:opacity-90 text-white border-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}