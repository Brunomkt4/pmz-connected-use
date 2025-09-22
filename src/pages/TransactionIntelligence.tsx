import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, TrendingUp, MapPin, DollarSign, Calendar } from "lucide-react";
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
}

interface Transaction {
  id: string;
  buyer: string;
  supplier: string;
  product: string;
  value: string;
  region: string;
  status: string;
  servicesNeeded: string[];
  timeline: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  opportunity: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "TX-2024-001",
    buyer: "Asia Pacific Foods Ltd",
    supplier: "Brazilian Beef Export Co",
    product: "Premium Beef Cuts - 500 tons",
    value: "$2.5M USD",
    region: "Asia",
    status: "Negotiating Terms",
    servicesNeeded: ["Bank Guarantee", "Letter of Credit", "Transport"],
    timeline: "30 days",
    riskLevel: "Medium",
    opportunity: "Performance Guarantee needed for $250K"
  },
  {
    id: "TX-2024-002", 
    buyer: "Shanghai Meat Distributors",
    supplier: "Argentina Premium Cattle",
    product: "Organic Beef - 200 tons",
    value: "$1.8M USD",
    region: "Asia",
    status: "Awaiting Financing",
    servicesNeeded: ["Bank Guarantee", "Certification"],
    timeline: "45 days",
    riskLevel: "Low",
    opportunity: "Payment Guarantee required for $180K"
  },
  {
    id: "TX-2024-003",
    buyer: "European Food Network",
    supplier: "US Chicken Processors Inc",
    product: "Frozen Chicken - 1000 tons",
    value: "$3.2M USD", 
    region: "Europe",
    status: "Contract Preparation",
    servicesNeeded: ["Transport", "Letter of Credit"],
    timeline: "60 days",
    riskLevel: "Low",
    opportunity: "Standby LC needed for $320K"
  }
];

export default function TransactionIntelligence() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to Transaction Intelligence! I\'m your AI assistant for identifying business opportunities. As a service provider, I can help you find transactions that need your services. Try asking: "Show me Asia transactions needing bank guarantees" or "Find European deals requiring transport services" or "What certifications are needed for US exports?"',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeQuery = (query: string): Transaction[] => {
    const lowerQuery = query.toLowerCase();
    
    return mockTransactions.filter(transaction => {
      // Filter by region
      const regionMatch = lowerQuery.includes('asia') ? transaction.region.toLowerCase().includes('asia') :
                         lowerQuery.includes('europe') ? transaction.region.toLowerCase().includes('europe') :
                         lowerQuery.includes('america') || lowerQuery.includes('us') ? transaction.region.toLowerCase().includes('america') :
                         true;

      // Filter by service needed
      const serviceMatch = lowerQuery.includes('bank guarantee') ? transaction.servicesNeeded.some(s => s.toLowerCase().includes('bank guarantee')) :
                          lowerQuery.includes('letter of credit') || lowerQuery.includes('lc') ? transaction.servicesNeeded.some(s => s.toLowerCase().includes('letter of credit')) :
                          lowerQuery.includes('transport') ? transaction.servicesNeeded.some(s => s.toLowerCase().includes('transport')) :
                          lowerQuery.includes('certification') ? transaction.servicesNeeded.some(s => s.toLowerCase().includes('certification')) :
                          true;

      // Filter by value range
      const valueMatch = lowerQuery.includes('high value') || lowerQuery.includes('large') ? parseFloat(transaction.value.replace(/[^0-9.]/g, '')) > 2 :
                         lowerQuery.includes('small') || lowerQuery.includes('low value') ? parseFloat(transaction.value.replace(/[^0-9.]/g, '')) < 2 :
                         true;

      return regionMatch && serviceMatch && valueMatch;
    });
  };

  const generateAIResponse = (query: string, results: Transaction[]): string => {
    const lowerQuery = query.toLowerCase();
    
    if (results.length === 0) {
      return "I couldn't find any transactions matching your criteria. Try broadening your search or check back later for new opportunities.";
    }

    let response = `Found ${results.length} transaction${results.length > 1 ? 's' : ''} matching your criteria:\n\n`;
    
    // Calculate total opportunity value
    const totalOpportunity = results.reduce((sum, t) => {
      const value = parseFloat(t.opportunity.replace(/[^0-9.]/g, ''));
      return sum + (value || 0);
    }, 0);

    if (totalOpportunity > 0) {
      response += `💰 Total opportunity value: $${totalOpportunity}K\n`;
    }

    // Identify service types needed
    const servicesNeeded = [...new Set(results.flatMap(t => t.servicesNeeded))];
    if (servicesNeeded.length > 0) {
      response += `🔧 Services in demand: ${servicesNeeded.join(', ')}\n`;
    }

    // Regional breakdown
    const regions = [...new Set(results.map(t => t.region))];
    response += `🌍 Active regions: ${regions.join(', ')}\n\n`;

    response += "💡 **Pro tip**: Click on any transaction card below to see detailed requirements and contact information for direct outreach.";

    return response;
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
    const query = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);
    setShowResults(false);

    setTimeout(() => {
      const results = analyzeQuery(query);
      setFilteredTransactions(results);
      
      const aiResponse = generateAIResponse(query, results);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setShowResults(true);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800'; 
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-6">
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
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Transaction Intelligence</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] bg-gradient-card border-0 shadow-soft flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-primary">Intelligence AI</span>
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
                    <div className="max-w-[90%]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center ai-glow">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-primary">Intelligence AI</span>
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

              <div className="p-6 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about transactions: 'Asia deals needing bank guarantees' or 'European transport opportunities'"
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

          {/* Transaction Results */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] bg-gradient-card border-0 shadow-soft">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Live Opportunities
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {showResults ? `${filteredTransactions.length} matches found` : 'Search for transactions'}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {showResults && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4 bg-background border border-border hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{transaction.buyer}</h4>
                            <p className="text-xs text-muted-foreground">{transaction.product}</p>
                          </div>
                          <Badge className={`text-xs ${getRiskColor(transaction.riskLevel)}`}>
                            {transaction.riskLevel}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-primary" />
                            <span>{transaction.value}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span>{transaction.region}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span>{transaction.timeline}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-primary" />
                            <span>{transaction.status}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium mb-1">Services Needed:</p>
                            <div className="flex flex-wrap gap-1">
                              {transaction.servicesNeeded.map((service, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-accent/10 p-2 rounded-lg">
                            <p className="text-xs font-medium text-accent mb-1">💡 Opportunity:</p>
                            <p className="text-xs">{transaction.opportunity}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : showResults ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">Use the chat to search for transaction opportunities that match your services.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}