const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with API key from environment (fallback to demo key for local testing)
const GEMINI_KEY =
  process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_FALLBACK || "AIzaSyBfQtDjaMbZ-idzA1CEhZe7UczdkJLRcZg";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

class SmartBinChatbot {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.conversationHistory = new Map(); // Store conversations per user
  }

  /**
   * Main chat function - handles user messages and returns AI responses
   */
  async chat(userId, message, context = {}) {
    try {
      // Get conversation history for this user
      const history = this.conversationHistory.get(userId) || [];

      // Try to answer using structured system data first
      const structuredResponse = this.tryStructuredResponse(message, context);

      let response;
      if (structuredResponse) {
        response = structuredResponse;
      } else {
        // Build context from current bin data
        const systemContext = this.buildSystemContext(context);

        // Create the prompt with context
        const prompt = `You are a helpful AI assistant for the AISWO Smart Bin Monitoring System.
You help employees and operators with bin status, reporting issues, system support, and environmental best practices.

CURRENT SYSTEM STATUS:
${systemContext}

CONVERSATION HISTORY:
${history.slice(-4).map(h => `${h.role}: ${h.message}`).join('\n')}

USER QUESTION: ${message}

INSTRUCTIONS:
- Be helpful, friendly, and concise.
- If asked about bin status, use the system data provided above.
- If asked about waste management, recycling, segregation, or environmental tips, give practical, evidence-based guidance (mention dry vs wet waste, plastic reduction, composting, etc.).
- Encourage proper recycling habits and sustainable actions.
- Use emojis occasionally to keep responses friendly (🗑️ for bins, 🌱 for green tips, ♻️ for recycling, ⚠️ for alerts, ✅ for OK).
- Keep responses under 120 words unless a detailed explanation is truly needed.
- If you are unsure or data is missing, say so honestly and suggest the next best action.

RESPONSE:`;

        // Get response from Gemini AI
        const result = await this.model.generateContent(prompt);
        response = result.response.text();
      }

      // Update conversation history
      history.push(
        { role: 'user', message: message, timestamp: new Date() },
        { role: 'assistant', message: response, timestamp: new Date() }
      );
      
      // Keep only last 10 messages to avoid memory issues
      this.conversationHistory.set(userId, history.slice(-10));

      return {
        response,
        timestamp: new Date(),
        conversationId: userId
      };

    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback response if Gemini fails
      return {
        response: "I'm having trouble connecting right now. Please try again or contact support. 🔧",
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Build context string with current bin data for AI to reference
   */
  buildSystemContext(context) {
    let contextText = '';
    
    // Add bin information
    if (context.bins) {
      contextText += '📊 BIN STATUS:\n';
      Object.entries(context.bins).forEach(([id, bin]) => {
        contextText += `- ${id}: ${bin.fillPct}% full (${bin.weightKg}kg), Status: ${bin.status}`;
        if (bin.location) contextText += `, Location: ${bin.location}`;
        if (bin.name) contextText += `, Name: ${bin.name}`;
        contextText += '\n';
      });
    }

    // Add operator information
    if (context.operators) {
      contextText += '\n👷 OPERATORS:\n';
      Object.entries(context.operators).forEach(([id, op]) => {
        contextText += `- ${op.name}: Assigned to ${op.assignedBins ? op.assignedBins.join(', ') : 'none'}\n`;
      });
    }

    // Add weather information
    if (context.weather) {
      contextText += `\n🌤️ WEATHER: ${context.weather.description}, ${context.weather.temp}°C\n`;
    }

    // Add recent alerts
    if (context.recentAlerts && context.recentAlerts.length > 0) {
      contextText += '\n⚠️ RECENT ALERTS:\n';
      context.recentAlerts.slice(0, 3).forEach(alert => {
        contextText += `- ${alert.binId}: ${alert.message} (${alert.time})\n`;
      });
    }

    return contextText || 'No system data available at the moment.';
  }

  /**
   * Attempt to respond using only current system data (no AI call needed)
   */
  tryStructuredResponse(message, context = {}) {
    const text = (message || '').trim();
    if (!text) return null;

    const lower = text.toLowerCase();
    const bins = context.bins || {};
    const operators = context.operators || {};

    // 1. Bin-specific queries (status, fill level, weight)
    const binMatch = lower.match(/bin\s?(\d+)/);
    if (
      binMatch &&
      (lower.includes('status') ||
        lower.includes('fill') ||
        lower.includes('level') ||
        lower.includes('weight') ||
        lower.includes('how') ||
        lower.includes('condition'))
    ) {
      const binId = `bin${binMatch[1]}`;
      const bin = bins[binId];
      if (bin) {
        return this.buildBinStatusResponse(binId, bin);
      }
      return `I don't have live data for ${binId} right now. Please make sure it's registered in the system.`;
    }

    // 2. Request for all bins / dashboard overview
    if (
      lower.includes('all bins') ||
      lower.includes('overall') ||
      lower.includes('dashboard') ||
      (lower.includes('status') && lower.includes('bins')) ||
      lower.includes('summary')
    ) {
      return this.buildBinOverviewResponse(bins);
    }

    // 3. Which bins are full / urgent
    if (
      lower.includes('full') ||
      lower.includes('nearly full') ||
      lower.includes('almost full') ||
      lower.includes('overflow')
    ) {
      return this.buildFullBinsResponse(bins);
    }

    // 4. Operator or assignment questions
    if (lower.includes('operator') || lower.includes('assigned') || lower.includes('who handles')) {
      return this.buildOperatorResponse(lower, operators, bins);
    }

    // 5. Short help / capability prompt
    if (lower.includes('help') || lower.includes('what can you do') || lower.includes('capabilities')) {
      return this.buildHelpResponse();
    }

    // 6. Issue reporting instructions
    if (lower.includes('report') || lower.includes('issue') || lower.includes('problem')) {
      return this.buildReportGuidance(binMatch);
    }

    return null;
  }

  buildBinStatusResponse(binId, bin) {
    const lines = [
      `🗑️ Status for ${binId.toUpperCase()}:`,
      `• Fill Level: ${bin.fillPct ?? 'N/A'}%`,
      `• Weight: ${bin.weightKg ?? 'N/A'} kg`,
      `• Condition: ${bin.status || 'Unknown'}`,
    ];
    if (bin.location) {
      lines.push(`• Location: ${bin.location}`);
    }
    if (bin.lastFetched || bin.updatedAt) {
      lines.push(`• Updated: ${new Date(bin.lastFetched || bin.updatedAt).toLocaleTimeString()}`);
    }
    return lines.join('\n');
  }

  buildBinOverviewResponse(bins) {
    const binEntries = Object.entries(bins);
    if (!binEntries.length) {
      return "I don't see any bins in the system right now.";
    }

    const full = binEntries.filter(([_, bin]) => (bin.fillPct || 0) >= 80);
    const warning = binEntries.filter(
      ([_, bin]) => (bin.fillPct || 0) >= 60 && (bin.fillPct || 0) < 80
    );
    const normal = binEntries.length - full.length - warning.length;

    const lines = [
      `📊 Current bin overview (${binEntries.length} total):`,
      `• Critical (80%+): ${full.length}`,
      `• Warning (60-79%): ${warning.length}`,
      `• Normal (<60%): ${normal}`,
      '',
    ];

    full.forEach(([id, bin]) => {
      lines.push(`⚠️ ${id.toUpperCase()} – ${bin.fillPct}% (${bin.location || 'No location'})`);
    });
    if (warning.length) {
      lines.push('');
      warning.forEach(([id, bin]) => {
        lines.push(`⚡ ${id.toUpperCase()} – ${bin.fillPct}% (${bin.location || 'No location'})`);
      });
    }
    if (!full.length && !warning.length) {
      lines.push('✅ All bins are within safe limits right now.');
    }
    return lines.join('\n');
  }

  buildFullBinsResponse(bins) {
    const fullBins = Object.entries(bins)
      .filter(([_, bin]) => (bin.fillPct || 0) >= 80)
      .map(([id, bin]) => `${id.toUpperCase()} – ${bin.fillPct}% (${bin.location || 'No location'})`);

    if (!fullBins.length) {
      return '✅ Great news! No bins are above 80% fill level at the moment.';
    }

    return ['⚠️ Bins needing attention:', ...fullBins.map((line) => `• ${line}`)].join('\n');
  }

  buildOperatorResponse(lowerMessage, operators, bins) {
    const entries = Object.entries(operators);
    if (!entries.length) {
      return "I don't have operator assignments stored right now.";
    }

    // Specific "who handles binX?"
    const binMatch = lowerMessage.match(/bin\s?(\d+)/);
    if (binMatch) {
      const binId = `bin${binMatch[1]}`;
      const operator = entries.find(([, op]) => (op.assignedBins || []).includes(binId));
      if (operator) {
        const [operatorId, op] = operator;
        return `👷 ${op.name} (${operatorId}) handles ${binId.toUpperCase()}. Contact: ${op.email || 'N/A'}.`;
      }
      return `I couldn't find an operator assigned to ${binId.toUpperCase()} yet.`;
    }

    const lines = ['👷 Operator assignments:'];
    entries.forEach(([operatorId, op]) => {
      const assigned = (op.assignedBins || []).length
        ? op.assignedBins.map((id) => id.toUpperCase()).join(', ')
        : 'No bins';
      lines.push(`• ${op.name} (${operatorId}) → ${assigned}`);
    });
    return lines.join('\n');
  }

  buildHelpResponse() {
    return [
      '🤖 I can help with:',
      '• Checking a bin: "Status of bin2"',
      '• Listing full bins: "Which bins are almost full?"',
      '• Getting an overview: "Show all bin status"',
      '• Finding assignments: "Who handles bin3?"',
      '• Reporting issues: "Report issue with bin2 lid damaged"',
      '',
      'Ask away! I always respond using the latest data in the system.',
    ].join('\n');
  }

  buildReportGuidance(binMatch) {
    if (!binMatch) {
      return '🛠️ To report an issue, mention the bin id (e.g., "report issue with bin2 lid broken") and I will log it for the admin.';
    }
    const binId = `bin${binMatch[1]}`.toUpperCase();
    return [
      `🛠️ Got it — to log an issue for ${binId}, please provide a short description like:`,
      `"Report issue with ${binId} lid jammed" or use the issue form in your dashboard.`,
      'I will pass the details to the admin team immediately.',
    ].join('\n');
  }

  /**
   * Handle specific bin queries (fallback if AI doesn't understand)
   */
  handleBinQuery(query, bins) {
    const lowerQuery = query.toLowerCase();

    // Which bins are full/almost full?
    if (lowerQuery.includes('full') || lowerQuery.includes('almost')) {
      const fullBins = Object.entries(bins)
        .filter(([_, bin]) => bin.fillPct >= 80)
        .map(([id, bin]) => `${id} (${bin.fillPct}%)`);
      
      if (fullBins.length === 0) {
        return "✅ Good news! No bins are full right now. All bins are below 80% capacity.";
      }
      return `⚠️ These bins need attention:\n${fullBins.join('\n')}`;
    }

    // Specific bin status
    const binMatch = lowerQuery.match(/bin(\d+)/);
    if (binMatch) {
      const binId = `bin${binMatch[1]}`;
      const bin = bins[binId];
      if (bin) {
        return `🗑️ ${binId}:\n- Fill Level: ${bin.fillPct}%\n- Weight: ${bin.weightKg}kg\n- Status: ${bin.status}\n- Location: ${bin.location || 'Unknown'}`;
      }
    }

    return null; // Let AI handle it
  }

  /**
   * Get conversation history for a user
   */
  getHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }

  /**
   * Clear conversation history for a user
   */
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
    return { message: 'Conversation history cleared' };
  }

  /**
   * Get chatbot statistics
   */
  getStats() {
    return {
      activeConversations: this.conversationHistory.size,
      totalMessages: Array.from(this.conversationHistory.values())
        .reduce((sum, history) => sum + history.length, 0)
    };
  }
}

// Export singleton instance
module.exports = new SmartBinChatbot();


