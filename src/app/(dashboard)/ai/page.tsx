"use client";

import * as React from "react";
import {
  Sparkles,
  Brain,
  Mail,
  Megaphone,
  MessageSquare,
  BarChart3,
  Send,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Cpu,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  getBusinessInsightsAction,
  composeEmailAction,
  generateMarketingAction,
  chatWithBusinessAction,
  getAIUsageAction,
} from "@/actions/ai";

export default function AIPage() {
  // Insights
  const [insights, setInsights] = React.useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = React.useState(false);

  // Email
  const [emailForm, setEmailForm] = React.useState({
    recipientType: "supplier" as "supplier" | "customer",
    recipientName: "",
    purpose: "",
    tone: "professional" as "professional" | "friendly" | "urgent" | "concise",
    details: "",
  });
  const [emailDraft, setEmailDraft] = React.useState<string | null>(null);
  const [emailLoading, setEmailLoading] = React.useState(false);

  // Marketing
  const [mktForm, setMktForm] = React.useState({
    platform: "whatsapp" as "facebook" | "instagram" | "whatsapp" | "flyer",
    campaignGoal: "",
    productName: "",
    discountOffer: "",
    additionalNotes: "",
  });
  const [mktContent, setMktContent] = React.useState<string | null>(null);
  const [mktLoading, setMktLoading] = React.useState(false);

  // Chat
  const [chatMessages, setChatMessages] = React.useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I'm your SmartBiz AI business advisor. Ask me anything about your store performance, inventory, profits, or business strategy." },
  ]);
  const [chatInput, setChatInput] = React.useState("");
  const [chatLoading, setChatLoading] = React.useState(false);

  // Usage
  const [usage, setUsage] = React.useState<any[]>([]);
  const [usageLoading, setUsageLoading] = React.useState(false);

  // Copy state
  const [copied, setCopied] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsights = async () => {
    setInsightsLoading(true);
    setError(null);
    try {
      const res = await getBusinessInsightsAction();
      if (res.success) {
        setInsights(typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2));
      } else {
        setError(res.message);
      }
    } catch { setError("Failed to generate insights."); } finally { setInsightsLoading(false); }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    try {
      const res = await composeEmailAction(emailForm);
      if (res.success) {
        setEmailDraft(typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2));
      } else { setError(res.message); }
    } catch { setError("Failed to draft email."); } finally { setEmailLoading(false); }
  };

  const handleMarketing = async (e: React.FormEvent) => {
    e.preventDefault();
    setMktLoading(true);
    setError(null);
    try {
      const res = await generateMarketingAction(mktForm);
      if (res.success) {
        setMktContent(typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2));
      } else { setError(res.message); }
    } catch { setError("Failed to generate marketing content."); } finally { setMktLoading(false); }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const question = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: question }]);
    setChatInput("");
    setChatLoading(true);
    setError(null);

    try {
      const res = await chatWithBusinessAction(question);
      if (res.success) {
        const answer = typeof res.data === "string" ? res.data : (res.data as any)?.response || JSON.stringify(res.data);
        setChatMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", content: `I couldn't process that: ${res.message}. Make sure your OpenAI API key is configured.` }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally { setChatLoading(false); }
  };

  const loadUsage = async () => {
    setUsageLoading(true);
    try {
      const res = await getAIUsageAction();
      if (res.success && res.data) setUsage(res.data as any[]);
    } catch {} finally { setUsageLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Business Suite" description="OpenAI-powered executive insights, email composer, marketing writer, and business chatbot.">
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          <Sparkles className="h-3 w-3 mr-1" />OpenAI Powered
        </Badge>
      </PageHeader>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4" /><span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">×</button>
        </div>
      )}

      <Tabs defaultValue="insights">
        <TabsList className="flex-wrap">
          <TabsTrigger value="insights"><Brain className="h-3.5 w-3.5 mr-1.5" />Insights</TabsTrigger>
          <TabsTrigger value="email"><Mail className="h-3.5 w-3.5 mr-1.5" />Email Writer</TabsTrigger>
          <TabsTrigger value="marketing"><Megaphone className="h-3.5 w-3.5 mr-1.5" />Marketing</TabsTrigger>
          <TabsTrigger value="chat"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Chat</TabsTrigger>
          <TabsTrigger value="usage"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Usage</TabsTrigger>
        </TabsList>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50/30 to-white shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Brain className="h-5 w-5 text-purple-600" />Executive Business Intelligence</CardTitle>
              <CardDescription className="text-xs">AI analyzes your real revenue, COGS, margins, stock levels, and customer data to provide actionable recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleInsights} disabled={insightsLoading} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                {insightsLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="h-4 w-4" />Generate Executive Analysis</>}
              </Button>
              {insights && (
                <div className="relative">
                  <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{insights}</div>
                  <button type="button" onClick={() => handleCopy(insights)} className="absolute top-2 right-2 p-1.5 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-slate-700">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMAIL TAB */}
        <TabsContent value="email">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader><CardTitle className="text-base">Compose Business Email</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleEmail} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Recipient Type</label>
                      <Select value={emailForm.recipientType} onChange={(e) => setEmailForm((p) => ({ ...p, recipientType: e.target.value as any }))}>
                        <option value="supplier">Supplier</option><option value="customer">Customer</option>
                      </Select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Tone</label>
                      <Select value={emailForm.tone} onChange={(e) => setEmailForm((p) => ({ ...p, tone: e.target.value as any }))}>
                        <option value="professional">Professional</option><option value="friendly">Friendly</option><option value="urgent">Urgent</option><option value="concise">Concise</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Recipient Name</label><Input value={emailForm.recipientName} onChange={(e) => setEmailForm((p) => ({ ...p, recipientName: e.target.value }))} placeholder="Nimal & Co Trading" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Purpose</label><Input value={emailForm.purpose} onChange={(e) => setEmailForm((p) => ({ ...p, purpose: e.target.value }))} placeholder="Request bulk tea price quote for Q4" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Additional Details</label><Textarea value={emailForm.details} onChange={(e) => setEmailForm((p) => ({ ...p, details: e.target.value }))} placeholder="We need 500 units of Ceylon Tea..." rows={3} /></div>
                  <Button type="submit" disabled={emailLoading} className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold gap-2 w-full shadow-xs">
                    {emailLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Drafting...</> : <><Mail className="h-4 w-4" />Generate Email Draft</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {emailDraft && (
              <Card className="border-slate-300 dark:border-slate-800 shadow-xs bg-slate-50 dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Generated Draft</CardTitle>
                  <button type="button" onClick={() => handleCopy(emailDraft)} className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </CardHeader>
                <CardContent><div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{emailDraft}</div></CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* MARKETING TAB */}
        <TabsContent value="marketing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader><CardTitle className="text-base">Marketing Content Generator</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleMarketing} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Platform</label>
                      <Select value={mktForm.platform} onChange={(e) => setMktForm((p) => ({ ...p, platform: e.target.value as any }))}>
                        <option value="whatsapp">WhatsApp</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="flyer">Print Flyer</option>
                      </Select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Product Name</label><Input value={mktForm.productName} onChange={(e) => setMktForm((p) => ({ ...p, productName: e.target.value }))} placeholder="Ceylon Tea 500g" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Campaign Goal</label><Input value={mktForm.campaignGoal} onChange={(e) => setMktForm((p) => ({ ...p, campaignGoal: e.target.value }))} placeholder="Drive weekend foot traffic to store" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Discount / Offer</label><Input value={mktForm.discountOffer} onChange={(e) => setMktForm((p) => ({ ...p, discountOffer: e.target.value }))} placeholder="Buy 3, Get 1 Free" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Additional Notes</label><Textarea value={mktForm.additionalNotes} onChange={(e) => setMktForm((p) => ({ ...p, additionalNotes: e.target.value }))} rows={2} /></div>
                  <Button type="submit" disabled={mktLoading} className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold gap-2 w-full shadow-xs">
                    {mktLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Megaphone className="h-4 w-4" />Generate Marketing Copy</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {mktContent && (
              <Card className="border-green-200 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Generated Copy</CardTitle>
                  <button type="button" onClick={() => handleCopy(mktContent)} className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </CardHeader>
                <CardContent><div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{mktContent}</div></CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* CHAT TAB */}
        <TabsContent value="chat">
          <Card className="border-slate-200 shadow-xs h-[600px] flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-5 w-5 text-purple-600" />Business AI Chatbot</CardTitle>
              <CardDescription className="text-xs">Ask questions about your revenue, stock, customers, and strategy</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-black text-white dark:bg-white dark:text-black font-semibold rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}>
                      {msg.role === "assistant" && <Sparkles className="h-3 w-3 text-purple-500 mb-1 inline mr-1" />}
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-600 rounded-xl rounded-bl-sm p-3 text-sm flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" /><span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChat} className="flex gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="What was my best selling product last week?"
                  className="flex-1"
                  disabled={chatLoading}
                />
                <Button type="submit" disabled={chatLoading || !chatInput.trim()} className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold px-4 shadow-xs">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USAGE TAB */}
        <TabsContent value="usage">
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle className="text-base">AI Token Usage & Costs</CardTitle><CardDescription className="text-xs">Every OpenAI API call is logged with token counts and estimated cost</CardDescription></div>
              <Button variant="outline" size="sm" onClick={loadUsage} className="gap-1.5"><Cpu className="h-3.5 w-3.5" />Load Usage</Button>
            </CardHeader>
            <CardContent>
              {usage.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Cpu className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p>No AI usage recorded yet. Generate an insight or send a chat to see usage here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <tr><th className="pb-2">Feature</th><th className="pb-2">Model</th><th className="pb-2 text-right">Input Tokens</th><th className="pb-2 text-right">Output Tokens</th><th className="pb-2 text-right">Est. Cost</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usage.map((u: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 font-medium text-slate-700">{u.feature}</td>
                          <td className="py-2.5 text-slate-500 font-mono">{u.model}</td>
                          <td className="py-2.5 text-right text-slate-600">{u.inputTokens?.toLocaleString()}</td>
                          <td className="py-2.5 text-right text-slate-600">{u.outputTokens?.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">${Number(u.estimatedCost || 0).toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
