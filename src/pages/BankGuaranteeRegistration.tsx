import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface BankGuaranteeData {
  applicant?: string;
  beneficiary?: string;
  guarantorBank?: string;
  underlyingTransactionReference?: string;
  guaranteeAmount?: string;
  currency?: string;
  expiryDate?: string;
  termsForDrawing?: string;
  formOfPresentation?: string;
  charges?: string;
  advisingBank?: string;
  governingRules?: string;
  additionalConditions?: string;
  completeness: number;
}

export default function BankGuaranteeRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your specialized assistant for bank guarantee registration. I\'ll help you register your bank guarantee requirements. Please provide details about the applicant, beneficiary, guarantee amount, expiry date, and any specific terms or conditions for the bank guarantee...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [guaranteeData, setGuaranteeData] = useState<BankGuaranteeData>({ completeness: 0 });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [showCompletionSheet, setShowCompletionSheet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveGuaranteeData = async (data: BankGuaranteeData) => {
    if (!user) {
      console.error('You must be logged in to save bank guarantee data');
      return;
    }

    try {
      console.log('Saving bank guarantee data', data);

      // Guard date parsing to avoid invalid date errors
      const parsedDate = data.expiryDate ? new Date(data.expiryDate) : null;
      const isoDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString().split('T')[0] : null;

      const guaranteeData = {
        applicant: data.applicant,
        beneficiary: data.beneficiary,
        guarantor_bank: data.guarantorBank,
        underlying_transaction_reference: data.underlyingTransactionReference,
        guarantee_amount: data.guaranteeAmount,
        currency: data.currency,
        expiry_date: isoDate,
        terms_for_drawing: data.termsForDrawing,
        form_of_presentation: data.formOfPresentation,
        charges: data.charges,
        advising_bank: data.advisingBank,
        governing_rules: data.governingRules,
        additional_conditions: data.additionalConditions,
        user_id: user.id
      };

      // Check for existing guarantee and handle upsert manually
      const { data: existingGuarantee, error: existsErr } = await supabase
        .from('bank_guarantees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existsErr) throw existsErr;

      let guaranteeError = null as unknown as { message?: string } | null;
      if (existingGuarantee?.id) {
        const { error } = await supabase
          .from('bank_guarantees')
          .update(guaranteeData)
          .eq('id', existingGuarantee.id);
        guaranteeError = error;
      } else {
        const { error } = await supabase
          .from('bank_guarantees')
          .insert(guaranteeData);
        guaranteeError = error;
      }

      if (guaranteeError) throw guaranteeError;

      setIsRegistrationComplete(true);
      setShowCompletionSheet(true);
      console.log('Bank guarantee registration completed successfully!');
    } catch (error: any) {
      console.error('Error saving bank guarantee data:', error);
    }
  };

  const analyzeMessage = (message: string): Partial<BankGuaranteeData> => {
    const extracted: Partial<BankGuaranteeData> = {};
    
    // Extract applicant
    if (message.toLowerCase().includes('applicant')) {
      const applicantMatch = message.match(/applicant[:\s]+([^.,\n]+)/i);
      if (applicantMatch) {
        extracted.applicant = applicantMatch[1]?.trim();
      }
    }

    // Extract beneficiary
    if (message.toLowerCase().includes('beneficiary')) {
      const beneficiaryMatch = message.match(/beneficiary[:\s]+([^.,\n]+)/i);
      if (beneficiaryMatch) {
        extracted.beneficiary = beneficiaryMatch[1]?.trim();
      }
    }

    // Extract guarantor bank
    if (message.toLowerCase().includes('guarantor') || message.toLowerCase().includes('issuing bank')) {
      const guarantorMatch = message.match(/(?:guarantor|issuing)\s+bank[:\s]+([^.,\n]+)/i);
      if (guarantorMatch) {
        extracted.guarantorBank = guarantorMatch[1]?.trim();
      }
    }

    // Extract transaction reference
    if (message.toLowerCase().includes('reference') || message.toLowerCase().includes('transaction')) {
      const refMatch = message.match(/(?:reference|transaction)[:\s]+([^.,\n]+)/i);
      if (refMatch) {
        extracted.underlyingTransactionReference = refMatch[1]?.trim();
      }
    }

    // Extract amounts and currency
    const amountMatch = message.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|m|billion|b|thousand|k)?\s*(USD|EUR|GBP|JPY|CAD|AUD|BRL|CNY|INR|AED|SAR)?/i);
    if (amountMatch) {
      extracted.guaranteeAmount = amountMatch[0];
      if (amountMatch[2]) {
        extracted.currency = amountMatch[2].toUpperCase();
      }
    }

    // Extract currency separately - more flexible pattern
    const currencyPatterns = [
      // Pattern 1: Currency mentioned with keywords
      /(?:currency|in|denominated in|payable in)[\s:]*([A-Z]{3}|USD|EUR|GBP|JPY|CAD|AUD|BRL|CNY|INR|AED|SAR|CHF|SEK|NOK|DKK)/i,
      // Pattern 2: Direct currency codes
      /\b(USD|EUR|GBP|JPY|CAD|AUD|BRL|CNY|INR|AED|SAR|CHF|SEK|NOK|DKK)\b/i,
      // Pattern 3: Currency names
      /\b(dollar|dollars|euro|euros|pound|pounds|yen|real|reais|yuan|rupee|rupees|dirham|riyal|franc|krona|krone)\b/i,
      // Pattern 4: Currency symbols context
      /\$\s*(?:US|USD|American)|€\s*(?:EUR|Euro)|£\s*(?:GBP|Sterling)|¥\s*(?:JPY|Yen)|R\$\s*(?:BRL|Real)/i
    ];
    
    for (const pattern of currencyPatterns) {
      const match = message.match(pattern);
      if (match && !extracted.currency) { // Only set if not already extracted
        let currency = match[1]?.toUpperCase();
        
        // Convert currency names to codes
        const currencyMap: { [key: string]: string } = {
          'DOLLAR': 'USD', 'DOLLARS': 'USD',
          'EURO': 'EUR', 'EUROS': 'EUR',
          'POUND': 'GBP', 'POUNDS': 'GBP',
          'YEN': 'JPY',
          'REAL': 'BRL', 'REAIS': 'BRL',
          'YUAN': 'CNY',
          'RUPEE': 'INR', 'RUPEES': 'INR',
          'DIRHAM': 'AED',
          'RIYAL': 'SAR',
          'FRANC': 'CHF',
          'KRONA': 'SEK',
          'KRONE': 'NOK'
        };
        
        if (currencyMap[currency]) {
          currency = currencyMap[currency];
        }
        
        extracted.currency = currency;
        break;
      }
    }

    // Extract expiry date
    const dateMatch = message.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
    if (dateMatch) {
      extracted.expiryDate = dateMatch[0];
    }

    // Extract terms for drawing
    if (message.toLowerCase().includes('terms') || message.toLowerCase().includes('drawing')) {
      const termsMatch = message.match(/(?:terms|drawing)[:\s]+([^.,\n]+)/i);
      if (termsMatch) {
        extracted.termsForDrawing = termsMatch[1]?.trim();
      }
    }

    // Extract charges
    if (message.toLowerCase().includes('charges') || message.toLowerCase().includes('fees')) {
      const chargesMatch = message.match(/(?:charges|fees)[:\s]+([^.,\n]+)/i);
      if (chargesMatch) {
        extracted.charges = chargesMatch[1]?.trim();
      }
    }

    // Extract form of presentation
    if (message.toLowerCase().includes('presentation') || message.toLowerCase().includes('document')) {
      const presentationMatch = message.match(/(?:presentation|document)[:\s]+([^.,\n]+)/i);
      if (presentationMatch) {
        extracted.formOfPresentation = presentationMatch[1]?.trim();
      }
    }

    // Extract advising bank
    if (message.toLowerCase().includes('advising bank') || message.toLowerCase().includes('correspondent bank')) {
      const advisingMatch = message.match(/(?:advising|correspondent)\s+bank[:\s]+([^.,\n]+)/i);
      if (advisingMatch) {
        extracted.advisingBank = advisingMatch[1]?.trim();
      }
    }

    // Extract governing rules
    if (message.toLowerCase().includes('rules') || message.toLowerCase().includes('urdg') || message.toLowerCase().includes('isp98')) {
      const rulesMatch = message.match(/(?:rules|urdg|isp98)[:\s]*([^.,\n]+)/i);
      if (rulesMatch) {
        extracted.governingRules = rulesMatch[0]?.trim();
      } else {
        extracted.governingRules = 'Mentioned';
      }
    }

    // Extract additional conditions
    if (message.toLowerCase().includes('condition') || message.toLowerCase().includes('additional') || message.toLowerCase().includes('special')) {
      const conditionsMatch = message.match(/(?:condition|additional|special)[:\s]*([^.,\n]+)/i);
      if (conditionsMatch) {
        extracted.additionalConditions = conditionsMatch[0]?.trim();
      } else {
        extracted.additionalConditions = 'Provided';
      }
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<BankGuaranteeData>, currentData: BankGuaranteeData): string => {
    const missingFields = [];
    
    if (!currentData.applicant && !userData.applicant) {
      missingFields.push('applicant details');
    }
    if (!currentData.beneficiary && !userData.beneficiary) {
      missingFields.push('beneficiary information');
    }
    if (!currentData.guarantorBank && !userData.guarantorBank) {
      missingFields.push('guarantor bank');
    }
    if (!currentData.underlyingTransactionReference && !userData.underlyingTransactionReference) {
      missingFields.push('transaction reference');
    }
    if (!currentData.guaranteeAmount && !userData.guaranteeAmount) {
      missingFields.push('guarantee amount');
    }
    if (!currentData.currency && !userData.currency) {
      missingFields.push('currency');
    }
    if (!currentData.expiryDate && !userData.expiryDate) {
      missingFields.push('expiry date');
    }
    if (!currentData.termsForDrawing && !userData.termsForDrawing) {
      missingFields.push('terms for drawing');
    }
    if (!currentData.formOfPresentation && !userData.formOfPresentation) {
      missingFields.push('form of presentation');
    }
    if (!currentData.charges && !userData.charges) {
      missingFields.push('charges');
    }
    if (!currentData.advisingBank && !userData.advisingBank) {
      missingFields.push('advising bank');
    }
    if (!currentData.governingRules && !userData.governingRules) {
      missingFields.push('governing rules');
    }
    if (!currentData.additionalConditions && !userData.additionalConditions) {
      missingFields.push('additional conditions');
    }

    if (Object.keys(userData).length > 0) {
      let response = "Great! I've captured ";
      const extractedItems = [];
      
      if (userData.applicant) extractedItems.push(`applicant: ${userData.applicant}`);
      if (userData.beneficiary) extractedItems.push(`beneficiary: ${userData.beneficiary}`);
      if (userData.guarantorBank) extractedItems.push(`guarantor bank: ${userData.guarantorBank}`);
      if (userData.guaranteeAmount) extractedItems.push(`amount: ${userData.guaranteeAmount}`);
      if (userData.currency) extractedItems.push(`currency: ${userData.currency}`);
      if (userData.expiryDate) extractedItems.push(`expiry: ${userData.expiryDate}`);
      if (userData.termsForDrawing) extractedItems.push(`terms: ${userData.termsForDrawing}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your bank guarantee registration, I still need: ${missingFields.slice(0, 2).join(' and ')}. `;
      } else {
        response += "\n\n✅ All required information collected! Your bank guarantee registration is complete.";
      }
      
      return response;
    }

    if (missingFields.length > 0) {
      return `To proceed with the bank guarantee registration, could you provide the ${missingFields[0]}?`;
    }

    return "Perfect! All bank guarantee information collected. Processing your registration.";
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

    setTimeout(async () => {
      const extractedData = analyzeMessage(currentMessage);
      const newGuaranteeData = { ...guaranteeData, ...extractedData };
      
      const totalFields = 13;
      let filledFields = 0;
      if (newGuaranteeData.applicant) filledFields++;
      if (newGuaranteeData.beneficiary) filledFields++;
      if (newGuaranteeData.guarantorBank) filledFields++;
      if (newGuaranteeData.underlyingTransactionReference) filledFields++;
      if (newGuaranteeData.guaranteeAmount) filledFields++;
      if (newGuaranteeData.currency) filledFields++;
      if (newGuaranteeData.expiryDate) filledFields++;
      if (newGuaranteeData.termsForDrawing) filledFields++;
      if (newGuaranteeData.formOfPresentation) filledFields++;
      if (newGuaranteeData.charges) filledFields++;
      if (newGuaranteeData.advisingBank) filledFields++;
      if (newGuaranteeData.governingRules) filledFields++;
      if (newGuaranteeData.additionalConditions) filledFields++;
      
      newGuaranteeData.completeness = Math.round((filledFields / totalFields) * 100);
      setGuaranteeData(newGuaranteeData);

      // If 100% complete, save to database
      if (newGuaranteeData.completeness === 100 && !isRegistrationComplete) {
        await saveGuaranteeData(newGuaranteeData);
        
        // Add completion message
        const completionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "🎉 Congratulations! Your bank guarantee registration is now complete and has been saved to our database. You can now access our platform with your guarantee details.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setIsTyping(false);
        return; // Don't show the regular AI response
      }

      const aiResponse = generateAIResponse(extractedData, guaranteeData);
      
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
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Bank Guarantee Registration</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-card border-0 shadow-soft">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Registration Progress
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Complete</span>
                  <span className="font-semibold">{guaranteeData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${guaranteeData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.applicant ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Applicant</span>
                  {guaranteeData.applicant && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.beneficiary ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Beneficiary</span>
                  {guaranteeData.beneficiary && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.guarantorBank ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Guarantor Bank</span>
                  {guaranteeData.guarantorBank && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.underlyingTransactionReference ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Transaction Reference</span>
                  {guaranteeData.underlyingTransactionReference && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.guaranteeAmount ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Guarantee Amount</span>
                  {guaranteeData.guaranteeAmount && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.currency ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Currency</span>
                  {guaranteeData.currency && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.expiryDate ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Expiry Date</span>
                  {guaranteeData.expiryDate && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.termsForDrawing ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Terms for Drawing</span>
                  {guaranteeData.termsForDrawing && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.formOfPresentation ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Form of Presentation</span>
                  {guaranteeData.formOfPresentation && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.charges ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Charges</span>
                  {guaranteeData.charges && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.advisingBank ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Advising Bank</span>
                  {guaranteeData.advisingBank && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.governingRules ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Governing Rules</span>
                  {guaranteeData.governingRules && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.additionalConditions ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Additional Conditions</span>
                  {guaranteeData.additionalConditions && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {guaranteeData.applicant && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Guarantee Details:</h4>
                  <div className="space-y-2 text-sm">
                    {guaranteeData.applicant && <div><strong>Applicant:</strong> {guaranteeData.applicant}</div>}
                    {guaranteeData.beneficiary && <div><strong>Beneficiary:</strong> {guaranteeData.beneficiary}</div>}
                    {guaranteeData.guarantorBank && <div><strong>Guarantor Bank:</strong> {guaranteeData.guarantorBank}</div>}
                    {guaranteeData.guaranteeAmount && <div><strong>Amount:</strong> {guaranteeData.guaranteeAmount}</div>}
                    {guaranteeData.currency && <div><strong>Currency:</strong> {guaranteeData.currency}</div>}
                    {guaranteeData.expiryDate && <div><strong>Expiry:</strong> {guaranteeData.expiryDate}</div>}
                    {guaranteeData.underlyingTransactionReference && <div><strong>Reference:</strong> {guaranteeData.underlyingTransactionReference}</div>}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[600px] bg-gradient-card border-0 shadow-soft flex flex-col">
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
                          <span className="text-sm font-medium text-primary">Banking AI</span>
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
                        <span className="text-sm font-medium text-primary">Banking AI</span>
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
                    placeholder={isRegistrationComplete ? "Registration completed!" : "Provide bank guarantee details (applicant, beneficiary, amount, etc.)..."}
                    className="flex-1"
                    disabled={isTyping || isRegistrationComplete}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isTyping || isRegistrationComplete}
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

        {/* Completion Sheet */}
        <Sheet open={showCompletionSheet} onOpenChange={setShowCompletionSheet}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Bank guarantee registration saved</SheetTitle>
              <SheetDescription>Here's a summary of your guarantee information.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2 text-sm">
              {guaranteeData.applicant && <div><strong>Applicant:</strong> {guaranteeData.applicant}</div>}
              {guaranteeData.beneficiary && <div><strong>Beneficiary:</strong> {guaranteeData.beneficiary}</div>}
              {guaranteeData.guarantorBank && <div><strong>Guarantor Bank:</strong> {guaranteeData.guarantorBank}</div>}
              {guaranteeData.underlyingTransactionReference && <div><strong>Transaction Reference:</strong> {guaranteeData.underlyingTransactionReference}</div>}
              {guaranteeData.guaranteeAmount && <div><strong>Guarantee Amount:</strong> {guaranteeData.guaranteeAmount}</div>}
              {guaranteeData.currency && <div><strong>Currency:</strong> {guaranteeData.currency}</div>}
              {guaranteeData.expiryDate && <div><strong>Expiry Date:</strong> {guaranteeData.expiryDate}</div>}
              {guaranteeData.termsForDrawing && <div><strong>Terms for Drawing:</strong> {guaranteeData.termsForDrawing}</div>}
              {guaranteeData.formOfPresentation && <div><strong>Form of Presentation:</strong> {guaranteeData.formOfPresentation}</div>}
              {guaranteeData.charges && <div><strong>Charges:</strong> {guaranteeData.charges}</div>}
              {guaranteeData.advisingBank && <div><strong>Advising Bank:</strong> {guaranteeData.advisingBank}</div>}
              {guaranteeData.governingRules && <div><strong>Governing Rules:</strong> {guaranteeData.governingRules}</div>}
              {guaranteeData.additionalConditions && <div><strong>Additional Conditions:</strong> {guaranteeData.additionalConditions}</div>}
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => setShowCompletionSheet(false)} className="bg-gradient-button text-white">Close</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Go to Home</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}