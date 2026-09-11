import { prisma } from "@/lib/prisma";
import { openai, DEFAULT_AI_MODEL, estimateTokenCost } from "@/lib/ai/openai";
import { FinanceService } from "@/services/finance.service";
import { AIFeature } from "@prisma/client";

export class AIService {
  /**
   * Helper: Record AI Usage and estimated cost in the database
   */
  private static async logUsage(
    businessId: string,
    userId: string,
    feature: AIFeature,
    model: string,
    inputTokens: number,
    outputTokens: number
  ) {
    try {
      const estimatedCost = estimateTokenCost(model, inputTokens, outputTokens);
      await prisma.aIUsage.create({
        data: {
          businessId,
          userId,
          feature,
          model,
          inputTokens,
          outputTokens,
          estimatedCost,
        },
      });
    } catch (err) {
      console.error("Failed to log AI usage:", err);
    }
  }

  /**
   * Controlled context aggregator: builds a minimal, structured summary of verified business data
   */
  private static async getVerifiedBusinessContext(businessId: string) {
    const metrics = await FinanceService.getDashboardMetrics(businessId);
    return {
      today: {
        revenue: metrics.today.revenue,
        cogs: metrics.today.cogs,
        grossProfit: metrics.today.grossProfit,
        expenses: metrics.today.expenses,
        netProfit: metrics.today.netProfit,
        salesCount: metrics.today.salesCount,
      },
      thisMonth: {
        revenue: metrics.thisMonth.revenue,
        cogs: metrics.thisMonth.cogs,
        grossProfit: metrics.thisMonth.grossProfit,
        expenses: metrics.thisMonth.expenses,
        netProfit: metrics.thisMonth.netProfit,
        salesCount: metrics.thisMonth.salesCount,
      },
      inventory: {
        totalProducts: metrics.inventory.totalProducts,
        lowStockItemsCount: metrics.inventory.lowStockCount,
        lowStockAlerts: metrics.inventory.lowStockProducts.map((p) => ({
          name: p.name,
          currentStock: p.stockQuantity,
          unit: p.unit,
        })),
      },
      topSellingProducts: metrics.topProducts.map((p) => ({
        name: p.name,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      })),
    };
  }

  /**
   * Feature 1: Business Insights Generator
   */
  static async generateBusinessInsights(businessId: string, userId: string) {
    const context = await this.getVerifiedBusinessContext(businessId);

    const systemPrompt = `You are a senior business intelligence and financial advisor for small and medium businesses.
Analyze the following verified business data and provide 3-5 high-impact, practical recommendations.
CRITICAL RULES:
- Never hallucinate or invent numbers. Base everything solely on the provided verified data.
- If revenue or sales are zero, suggest actionable steps to kickstart sales or optimize inventory.
- Distinguish between Gross Profit (Revenue - COGS) and Net Profit (Gross Profit - Expenses).
- Format your response strictly as valid JSON array of objects:
[
  { "type": "warning" | "opportunity" | "action" | "positive", "title": "Short title", "message": "Detailed actionable advice" }
]
Only output the JSON array. Do not wrap in markdown or commentary.`;

    const userPrompt = `Verified Business Data:\n${JSON.stringify(context, null, 2)}`;

    try {
      const completion = await openai.chat.completions.create({
        model: DEFAULT_AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      });

      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;
      await this.logUsage(businessId, userId, AIFeature.BUSINESS_INSIGHT, DEFAULT_AI_MODEL, inputTokens, outputTokens);

      const content = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : parsed.insights || [parsed];
    } catch {
      // Graceful fallback recommendations when offline or mock key
      return [
        {
          type: "action",
          title: "Optimize Inventory Levels",
          message: `You currently have ${context.inventory.lowStockItemsCount} item(s) running low on stock. Review purchase orders to prevent stockouts.`,
        },
        {
          type: "opportunity",
          title: "Revenue Growth",
          message: `Your top product is "${context.topSellingProducts[0]?.name || "N/A"}". Consider running a bundle promotion to increase average basket size.`,
        },
        {
          type: "warning",
          title: "Operating Cost Control",
          message: `This month's operating expenses are Rs. ${context.thisMonth.expenses}. Ensure operating costs remain below 30% of gross margin.`,
        },
      ];
    }
  }

  /**
   * Feature 2: Professional Business Email Composer
   */
  static async composeBusinessEmail(
    businessId: string,
    userId: string,
    params: {
      recipientType: "supplier" | "customer";
      recipientName: string;
      purpose: string;
      tone: "professional" | "friendly" | "urgent" | "concise";
      details: string;
    }
  ) {
    const systemPrompt = `You are an executive business communications specialist for SMEs.
Write a clear, polished, and ready-to-send email based on the user's intent.
Rules:
- The tone must be strictly ${params.tone}.
- The output must be JSON format: { "subject": "Email Subject", "body": "Email Body" }.
- The email must end with a placeholder signature for the merchant.
- Never output anything outside the JSON object.`;

    const userPrompt = `Recipient: ${params.recipientName} (${params.recipientType})
Purpose: ${params.purpose}
Key Details to include: ${params.details}`;

    try {
      const completion = await openai.chat.completions.create({
        model: DEFAULT_AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      });

      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;
      await this.logUsage(businessId, userId, AIFeature.EMAIL_GENERATOR, DEFAULT_AI_MODEL, inputTokens, outputTokens);

      const content = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        subject: `Regarding: ${params.purpose}`,
        body: `Dear ${params.recipientName},\n\nI am writing to you regarding ${params.purpose}.\n\n${params.details}\n\nPlease let us know if you have any questions or require additional details.\n\nBest regards,\nBusiness Management`,
      };
    }
  }

  /**
   * Feature 3: Marketing & Social Content Generator
   */
  static async generateMarketingContent(
    businessId: string,
    userId: string,
    params: {
      platform: "facebook" | "instagram" | "whatsapp" | "flyer";
      campaignGoal: string;
      productName?: string;
      discountOffer?: string;
      additionalNotes?: string;
    }
  ) {
    const systemPrompt = `You are a creative SME marketing strategist.
Craft engaging, high-conversion promotional copy tailored for ${params.platform}.
Format strictly as JSON:
{
  "headline": "Catchy headline",
  "caption": "Post content with appropriate emojis and formatting",
  "callToAction": "Direct action phrase",
  "hashtags": ["tag1", "tag2", "tag3"]
}`;

    const userPrompt = `Goal: ${params.campaignGoal}
Product: ${params.productName || "Featured Store Items"}
Offer/Discount: ${params.discountOffer || "Special Promotion"}
Additional Notes: ${params.additionalNotes || "None"}`;

    try {
      const completion = await openai.chat.completions.create({
        model: DEFAULT_AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;
      await this.logUsage(businessId, userId, AIFeature.MARKETING_GENERATOR, DEFAULT_AI_MODEL, inputTokens, outputTokens);

      const content = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        headline: `Special Offer on ${params.productName || "Our Products"}!`,
        caption: `Discover our quality selection at unbeatable prices. ${params.discountOffer ? `Enjoy ${params.discountOffer} for a limited time!` : "Visit us in-store today!"}`,
        callToAction: "Order today or visit our store!",
        hashtags: ["SmartBiz", "SpecialOffer", "ShopLocal", "Sale"],
      };
    }
  }

  /**
   * Feature 4: Invoice Explainer & Natural Language Summary
   */
  static async summarizeInvoice(
    businessId: string,
    userId: string,
    invoiceNumber: string
  ) {
    const sale = await prisma.sale.findFirst({
      where: { businessId, invoiceNumber },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!sale) {
      throw new Error(`Invoice ${invoiceNumber} not found.`);
    }

    const invoiceData = {
      invoiceNumber: sale.invoiceNumber,
      date: sale.createdAt.toISOString().split("T")[0],
      customer: sale.customer?.name || "Walk-in Customer",
      itemCount: sale.items.length,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discountAmount),
      tax: Number(sale.taxAmount),
      total: Number(sale.totalAmount),
      amountPaid: Number(sale.amountPaid),
      status: sale.status,
      items: sale.items.map((i) => ({
        product: i.product?.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitSellingPrice),
        subtotal: Number(i.subtotal),
      })),
    };

    const systemPrompt = `You are a financial clerk. Explain this invoice clearly in plain language so a customer or business owner can understand it at a glance. Mention quantities, prices, discounts, tax, and payment status. Output strictly JSON: { "summary": "...", "keyTakeaways": ["...", "..."] }`;

    try {
      const completion = await openai.chat.completions.create({
        model: DEFAULT_AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(invoiceData) },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;
      await this.logUsage(businessId, userId, AIFeature.INVOICE_SUMMARY, DEFAULT_AI_MODEL, inputTokens, outputTokens);

      const content = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        summary: `Invoice ${sale.invoiceNumber} contains ${sale.items.length} item(s) for a total of Rs. ${sale.totalAmount}. The payment status is ${sale.status}.`,
        keyTakeaways: [
          `Total Billed: Rs. ${sale.totalAmount}`,
          `Amount Paid: Rs. ${sale.amountPaid}`,
          `Status: ${sale.status}`,
        ],
      };
    }
  }

  /**
   * Feature 5: AI Business Chatbot (Query verified context only)
   */
  static async chatWithBusiness(
    businessId: string,
    userId: string,
    userQuestion: string
  ) {
    const context = await this.getVerifiedBusinessContext(businessId);

    const systemPrompt = `You are the SmartBiz Business Assistant.
You have access to the merchant's VERIFIED business metrics.
STRICT INSTRUCTIONS:
1. Answer accurately using ONLY the verified metrics provided.
2. If the user asks for data you do not have, state clearly: "I don't have enough recorded data in your SmartBiz records to answer that accurately."
3. Never invent sales, profits, costs, inventory, or customers.
4. Keep your response friendly, clear, and professional.`;

    const userPrompt = `Verified Business Data:\n${JSON.stringify(context, null, 2)}\n\nUser Question:\n${userQuestion}`;

    try {
      const completion = await openai.chat.completions.create({
        model: DEFAULT_AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      });

      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;
      await this.logUsage(businessId, userId, AIFeature.AI_CHAT, DEFAULT_AI_MODEL, inputTokens, outputTokens);

      return {
        question: userQuestion,
        answer: completion.choices[0]?.message?.content || "No response generated.",
      };
    } catch {
      return {
        question: userQuestion,
        answer: `Based on your recorded SmartBiz sales, your business has generated Rs. ${context.thisMonth.revenue} in revenue this month with a gross profit of Rs. ${context.thisMonth.grossProfit} and net profit of Rs. ${context.thisMonth.netProfit}.`,
      };
    }
  }

  /**
   * Fetch AI usage logs for business audit
   */
  static async getUsageHistory(businessId: string) {
    const [logs, aggregate] = await Promise.all([
      prisma.aIUsage.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.aIUsage.aggregate({
        where: { businessId },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          estimatedCost: true,
        },
        _count: { id: true },
      }),
    ]);

    return {
      logs,
      totals: {
        totalRequests: aggregate._count.id || 0,
        totalInputTokens: aggregate._sum.inputTokens || 0,
        totalOutputTokens: aggregate._sum.outputTokens || 0,
        totalEstimatedCost: aggregate._sum.estimatedCost
          ? Number(aggregate._sum.estimatedCost)
          : 0,
      },
    };
  }
}
