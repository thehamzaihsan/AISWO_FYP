const { Mistral } = require('@mistralai/mistralai');

class SmartBinChatbot {
  constructor(binService) {
    this.binService = binService;
    
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey || apiKey === 'your_mistral_api_key_here') {
      console.warn('⚠️ Warning: MISTRAL_API_KEY not set in .env file');
      this.client = null;
    } else {
      this.client = new Mistral({ apiKey });
      console.log('✅ Mistral AI initialized');
    }

    this.conversationHistory = [];
  }

  async chat(userMessage) {
    // If no API key, provide fallback message
    if (!this.client) {
      return "I'm currently in offline mode. Please set MISTRAL_API_KEY in your .env file to enable AI-powered assistance.";
    }

    try {
      // Get current system context with all bin and operator data
      const systemContext = await this.getSystemContext();
      
      const response = await this.client.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemContext },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3, // Lower temperature for more consistent, factual responses
        maxTokens: 800
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Mistral API error:', error.message);
      return "I'm having trouble processing that request right now. Please try again in a moment.";
    }
  }

  async getSystemContext() {
    try {
      const binsData = await this.binService.getAllBins();
      
      // Handle if bins is an object (key-value pairs)
      let bins = [];
      if (Array.isArray(binsData)) {
        bins = binsData;
      } else if (typeof binsData === 'object' && binsData !== null) {
        // Convert object to array
        bins = Object.keys(binsData).map(id => ({
          id,
          ...binsData[id]
        }));
      }

      // Extract operators from bin assignments
      const operators = this.extractOperators(bins);
      
      // Build comprehensive system prompt
      return `You are an intelligent waste management assistant for the AISWO Smart Bin Monitoring System.

CURRENT SYSTEM DATA:
${this.formatBinsForAI(bins)}

${this.formatOperatorsForAI(operators)}

SYSTEM STATISTICS:
- Total Bins: ${bins.length}
- Critical (>80% full): ${bins.filter(b => (b.fillPct || 0) > 80).length}
- Warning (60-80% full): ${bins.filter(b => (b.fillPct || 0) > 60 && (b.fillPct || 0) <= 80).length}
- Normal (<60% full): ${bins.filter(b => (b.fillPct || 0) <= 60).length}
- Assigned Bins: ${bins.filter(b => b.assignedTo).length}
- Unassigned Bins: ${bins.filter(b => !b.assignedTo).length}

YOUR CAPABILITIES:

1. **Operational Queries** - Answer questions about:
   - Bin status, fill levels, weights, and locations
   - Operator assignments and responsibilities
   - System statistics and alerts
   - Bin comparisons and recommendations
   - Which bins need emptying
   - Specific bin details

2. **Environmental Guidance** - Provide advice on:
   - Recycling best practices and guidelines
   - Waste reduction strategies
   - Composting techniques
   - Sustainability and environmental impact
   - Proper waste segregation
   - Hazardous waste handling

RESPONSE GUIDELINES:
- Be concise, clear, and actionable
- Use emojis for visual clarity: 🗑️ (bins), 📊 (stats), ⚠️ (warnings), ✅ (good), 🔴 (critical), 👤 (operators), 📍 (location)
- When discussing bins, always include: fill %, weight (kg), and status
- For operator queries, list assigned bins with their current status
- Provide specific data from the system when available
- Suggest actions when bins are critical or need attention
- Keep responses under 200 words unless detailed explanation is needed
- Format lists clearly with line breaks
- Use proper capitalization for bin names and operator names

IMPORTANT NOTES:
- All data shown above is real-time from the system
- Fill percentages above 80% are CRITICAL and need immediate attention
- Fill percentages 60-80% are WARNING level
- Fill percentages below 60% are NORMAL
- Always prioritize accuracy over speculation
- If you don't have specific data, say so clearly`;
    } catch (error) {
      console.error('Error building system context:', error);
      return `You are a helpful waste management assistant. Provide practical advice on waste management, recycling, and environmental topics. Keep responses concise and actionable.`;
    }
  }

  formatBinsForAI(bins) {
    if (!bins || bins.length === 0) {
      return "No bins currently in the system.";
    }

    let formatted = "BINS:\n";
    bins.forEach(bin => {
      const fillLevel = bin.fillPct || 0;
      const weight = bin.weightKg || 0;
      const status = bin.status || 'Unknown';
      const location = bin.location || 'Location not specified';
      const assignedTo = bin.assignedTo || 'Unassigned';
      const name = bin.name || bin.id;
      
      // Determine status emoji
      let statusEmoji = '✅';
      if (fillLevel > 80) statusEmoji = '🔴';
      else if (fillLevel > 60) statusEmoji = '⚠️';
      
      formatted += `  ${statusEmoji} ${name.toUpperCase()}: ${fillLevel.toFixed(1)}% full, ${weight.toFixed(2)}kg, Status: ${status}\n`;
      formatted += `     Location: ${location}\n`;
      formatted += `     Assigned to: ${assignedTo}\n`;
    });

    return formatted;
  }

  formatOperatorsForAI(operators) {
    if (!operators || operators.length === 0) {
      return "OPERATORS:\n  No operators currently assigned.";
    }

    let formatted = "OPERATORS:\n";
    operators.forEach(op => {
      formatted += `  👤 ${op.name}: ${op.bins.length} bin(s) assigned\n`;
      if (op.bins.length > 0) {
        formatted += `     Bins: ${op.bins.join(', ')}\n`;
      }
    });

    return formatted;
  }

  extractOperators(bins) {
    const operatorMap = new Map();
    
    bins.forEach(bin => {
      if (bin.assignedTo && bin.assignedTo !== 'Unassigned') {
        if (!operatorMap.has(bin.assignedTo)) {
          operatorMap.set(bin.assignedTo, {
            name: bin.assignedTo,
            bins: []
          });
        }
        operatorMap.get(bin.assignedTo).bins.push(bin.name || bin.id);
      }
    });

    return Array.from(operatorMap.values());
  }

  // Keep helper methods for potential fallback or direct data access
  getStatusEmoji(status) {
    const statusMap = {
      'Normal': '✅',
      'OK': '✅',
      'Warning': '⚠️',
      'NEEDS_EMPTYING': '🔴',
      'Full': '🔴',
      'Blocked': '🚫'
    };
    return statusMap[status] || '📊';
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = SmartBinChatbot;
