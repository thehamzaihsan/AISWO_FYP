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
    const lowerMessage = userMessage.toLowerCase();

    // Operational queries - handle locally (fast)
    if (this.isOperationalQuery(lowerMessage)) {
      return await this.handleOperationalQuery(lowerMessage);
    }

    // Environmental/recycling queries - use Mistral AI
    if (!this.client) {
      return "I'm currently in offline mode. I can help with bin status and assignments. Please set MISTRAL_API_KEY for environmental questions.";
    }

    try {
      const systemContext = this.getSystemContext();
      const prompt = `${systemContext}\n\nUser question: ${userMessage}\n\nProvide a helpful, concise response about waste management, recycling, or environmental topics.`;

      const response = await this.client.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are a helpful waste management and recycling assistant. Provide concise, practical advice.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Mistral API error:', error.message);
      return "I'm having trouble processing that request. Please try asking about bin status or assignments instead.";
    }
  }

  isOperationalQuery(message) {
    const operationalKeywords = [
      'status', 'bin', 'full', 'empty', 'weight', 'level', 'fill',
      'operator', 'assigned', 'who', 'which', 'all bins', 'show',
      'list', 'check', 'report', 'issue', 'problem'
    ];
    return operationalKeywords.some(keyword => message.includes(keyword));
  }

  async handleOperationalQuery(message) {
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

      if (bins.length === 0) {
        return "No bins found in the system.";
      }

      // 1. WHO IS OPERATING/ASSIGNED queries
      const whoOperatingMatch = message.match(/who\s+(?:is\s+)?(?:operating|assigned\s+to|manages?|handles?|responsible\s+for)\s+bin\s*(\d+)/i);
      if (whoOperatingMatch) {
        const binId = whoOperatingMatch[1];
        const fullBinId = `bin${binId}`;
        const bin = bins.find(b => b.id.toLowerCase() === fullBinId.toLowerCase());
        
        if (bin) {
          if (bin.assignedTo) {
            return `👤 ${bin.name || fullBinId} is currently assigned to ${bin.assignedTo}.`;
          } else {
            return `${bin.name || fullBinId} is not currently assigned to any operator.`;
          }
        }
        return `Sorry, I couldn't find information about ${fullBinId}.`;
      }

      // 2. WHICH BINS queries for operators (e.g., "which bins is John managing?" or "which bins does Jane handle")
      const whichBinsMatch = message.match(/(?:which|what)\s+bins?\s+(?:is|does|do|are)\s+(\w+)\s+(?:operating|managing|manage|handling|handle|assigned|responsible)/i);
      if (whichBinsMatch) {
        const operatorName = whichBinsMatch[1];
        return this.findBinsByOperator(bins, operatorName);
      }

      // 3. HOW MANY bins queries
      if (message.match(/how\s+many\s+bins?/i)) {
        if (message.match(/full|need.*empty|alert/i)) {
          return this.countFullBins(bins);
        }
        if (message.match(/empty|available|free/i)) {
          return this.countEmptyBins(bins);
        }
        if (message.match(/assigned|operator/i)) {
          return this.countAssignedBins(bins);
        }
        return `There are ${bins.length} bins in total in the system.`;
      }

      // 4. WHERE IS queries (location-based)
      const whereMatch = message.match(/where\s+is\s+bin\s*(\d+)/i);
      if (whereMatch) {
        const binId = whereMatch[1];
        const fullBinId = `bin${binId}`;
        const bin = bins.find(b => b.id.toLowerCase() === fullBinId.toLowerCase());
        
        if (bin) {
          return `📍 ${bin.name || fullBinId} is located at: ${bin.location || 'Location not specified'}`;
        }
        return `Sorry, I couldn't find information about ${fullBinId}.`;
      }

      // 5. COMPARISON queries FIRST (before IS BIN X FULL check)
      const compareMatch = message.match(/is\s+bin\s*(\d+)\s+(fuller|emptier|heavier|lighter)\s+than\s+bin\s*(\d+)/i);
      if (compareMatch) {
        return this.compareBins(bins, compareMatch[1], compareMatch[2], compareMatch[3]);
      }

      // 6. IS BIN X FULL/EMPTY queries
      const isBinFullMatch = message.match(/is\s+bin\s*(\d+)\s+(full|empty|available|blocked)/i);
      if (isBinFullMatch) {
        const binId = isBinFullMatch[1];
        const condition = isBinFullMatch[2].toLowerCase();
        const fullBinId = `bin${binId}`;
        const bin = bins.find(b => b.id.toLowerCase() === fullBinId.toLowerCase());
        
        if (bin) {
          return this.checkBinCondition(bin, condition);
        }
        return `Sorry, I couldn't find information about ${fullBinId}.`;
      }

      // 7. LIST OPERATORS or WHO ARE THE OPERATORS
      if (message.match(/(?:list|show|who\s+are)\s+(?:all\s+)?(?:the\s+)?operators?/i)) {
        return this.listOperators(bins);
      }

      // 8. EMPTIEST/FULLEST bin queries (single bin extremes)
      if (message.match(/(?:which|what).*(?:emptiest|fullest|most\s+full|most\s+empty)/i) && !message.match(/bins\s+/i)) {
        const isFull = message.match(/full/i);
        return this.findExtremeBin(bins, isFull);
      }

      // 9. NEEDS EMPTYING queries
      if (message.match(/(?:which|what)\s+bins?\s+(?:need|require).*(?:empty|attention|collection)/i)) {
        return this.formatFullBins(bins);
      }

      // 10. WEIGHT queries for specific bin (improve pattern matching)
      const weightMatch = message.match(/(?:what|how\s+much).*(?:weight|weigh)|(?:does|is)\s+bin\s*\d+\s+weigh/i);
      if (weightMatch && message.match(/bin\s*(\d+)/i)) {
        const binId = message.match(/bin\s*(\d+)/i)[1];
        const fullBinId = `bin${binId}`;
        const bin = bins.find(b => b.id.toLowerCase() === fullBinId.toLowerCase());
        
        if (bin) {
          return `⚖️ ${bin.name || fullBinId} currently weighs ${(bin.weightKg || 0).toFixed(2)} kg (${(bin.fillPct || 0).toFixed(1)}% full)`;
        }
        return `Sorry, I couldn't find information about ${fullBinId}.`;
      }

      // 11. Specific bin queries (before general queries)
      const binMatch = message.match(/bin\s*(\d+)/i);
      if (binMatch && !message.match(/bins\s+/i)) {
        const binId = binMatch[1];
        const fullBinId = `bin${binId}`;
        const bin = bins.find(b => b.id.toLowerCase() === fullBinId.toLowerCase());
        
        if (bin) {
          return this.formatSingleBinStatus(bin);
        }
        return `Sorry, I couldn't find information about ${fullBinId}.`;
      }

      // 12. Full bins alert queries (BEFORE general status - must mention "full" explicitly)
      if (message.match(/(?:show|display|list).*(?:full\s+bins?|bins?.*full)/i) || message.includes('alert')) {
        return this.formatFullBins(bins);
      }

      // 13. General status queries (last resort for "show", "list", "all")
      if (message.match(/(?:all|show\s+all|list\s+all|my\s+bins|what\s+bins|status)/i)) {
        return this.formatAllBinsStatus(bins);
      }

      // Default: show all bins
      return this.formatAllBinsStatus(bins);
    } catch (error) {
      console.error('Error handling operational query:', error);
      return "I'm having trouble accessing bin data right now. Please try again.";
    }
  }

  formatAllBinsStatus(bins) {
    if (!bins || bins.length === 0) {
      return "No bins found in the system.";
    }

    let response = `📊 Current status for all bins:\n\n`;
    bins.forEach(bin => {
      const fillLevel = bin.fillPct || 0;
      const weight = bin.weightKg || 0;
      const status = this.getStatusEmoji(bin.status);
      
      response += `🗑️ ${bin.name || bin.id}:\n`;
      response += `   Fill: ${fillLevel.toFixed(1)}% | Weight: ${weight.toFixed(2)}kg\n`;
      response += `   Status: ${bin.status} ${status}\n`;
      if (bin.assignedTo) {
        response += `   Assigned: ${bin.assignedTo}\n`;
      }
      response += '\n';
    });

    return response.trim();
  }

  formatFullBins(bins) {
    const fullBins = bins.filter(bin => (bin.fillPct || 0) >= 80);
    
    if (fullBins.length === 0) {
      return "✅ All bins are below 80% capacity. No immediate action needed.";
    }

    let response = `⚠️ ${fullBins.length} bin(s) need attention:\n\n`;
    fullBins.forEach(bin => {
      response += `🗑️ ${bin.name || bin.id}: ${(bin.fillPct || 0).toFixed(1)}% full\n`;
      if (bin.assignedTo) {
        response += `   Operator: ${bin.assignedTo}\n`;
      }
    });

    return response.trim();
  }

  formatSingleBinStatus(bin) {
    const fillLevel = bin.fillPct || 0;
    const weight = bin.weightKg || 0;
    const status = this.getStatusEmoji(bin.status);
    
    let response = `🗑️ Status for ${bin.name || bin.id}:\n\n`;
    response += `📊 Fill Level: ${fillLevel.toFixed(1)}%\n`;
    response += `⚖️ Weight: ${weight.toFixed(2)} kg\n`;
    response += `📍 Status: ${bin.status} ${status}\n`;
    response += `📍 Location: ${bin.location || 'Not specified'}\n`;
    
    if (bin.assignedTo) {
      response += `👤 Assigned to: ${bin.assignedTo}\n`;
    }
    
    if (bin.isBlocked) {
      response += `⚠️ BLOCKED - Needs immediate attention!\n`;
    }

    return response.trim();
  }

  findBinsByOperator(bins, operatorName) {
    const operatorBins = bins.filter(bin => 
      bin.assignedTo && bin.assignedTo.toLowerCase().includes(operatorName.toLowerCase())
    );

    if (operatorBins.length === 0) {
      return `No bins are currently assigned to an operator matching "${operatorName}".`;
    }

    let response = `👤 Bins assigned to ${operatorName}:\n\n`;
    operatorBins.forEach(bin => {
      response += `🗑️ ${bin.name || bin.id}: ${(bin.fillPct || 0).toFixed(1)}% full, ${bin.status}\n`;
    });
    return response.trim();
  }

  countFullBins(bins) {
    const fullBins = bins.filter(bin => (bin.fillPct || 0) >= 80);
    return `⚠️ ${fullBins.length} bin(s) are 80% full or more and need emptying.`;
  }

  countEmptyBins(bins) {
    const emptyBins = bins.filter(bin => (bin.fillPct || 0) < 20);
    return `✅ ${emptyBins.length} bin(s) are less than 20% full (available for use).`;
  }

  countAssignedBins(bins) {
    const assignedBins = bins.filter(bin => bin.assignedTo);
    const unassignedBins = bins.length - assignedBins.length;
    return `📊 ${assignedBins.length} bin(s) are assigned to operators, ${unassignedBins} are unassigned.`;
  }

  checkBinCondition(bin, condition) {
    const fillLevel = bin.fillPct || 0;
    const binName = bin.name || bin.id;

    switch(condition) {
      case 'full':
        if (fillLevel >= 80) {
          return `🔴 Yes, ${binName} is full (${fillLevel.toFixed(1)}% capacity). It needs emptying.`;
        }
        return `✅ No, ${binName} is not full (${fillLevel.toFixed(1)}% capacity).`;
      
      case 'empty':
        if (fillLevel < 20) {
          return `✅ Yes, ${binName} is mostly empty (${fillLevel.toFixed(1)}% full).`;
        }
        return `📊 No, ${binName} is ${fillLevel.toFixed(1)}% full.`;
      
      case 'available':
        if (fillLevel < 50) {
          return `✅ Yes, ${binName} is available (${fillLevel.toFixed(1)}% full).`;
        }
        return `⚠️ ${binName} is ${fillLevel.toFixed(1)}% full - getting full.`;
      
      case 'blocked':
        if (bin.isBlocked) {
          return `🚫 Yes, ${binName} is blocked and needs immediate attention!`;
        }
        return `✅ No, ${binName} is not blocked.`;
      
      default:
        return this.formatSingleBinStatus(bin);
    }
  }

  listOperators(bins) {
    const operators = [...new Set(bins.filter(bin => bin.assignedTo).map(bin => bin.assignedTo))];
    
    if (operators.length === 0) {
      return "No operators are currently assigned to any bins.";
    }

    let response = `👥 Active operators (${operators.length}):\n\n`;
    operators.forEach(operator => {
      const operatorBins = bins.filter(bin => bin.assignedTo === operator);
      response += `👤 ${operator}: ${operatorBins.length} bin(s)\n`;
    });
    return response.trim();
  }

  findExtremeBin(bins, findFullest) {
    if (bins.length === 0) {
      return "No bins found in the system.";
    }

    const sortedBins = [...bins].sort((a, b) => {
      const fillA = a.fillPct || 0;
      const fillB = b.fillPct || 0;
      return findFullest ? fillB - fillA : fillA - fillB;
    });

    const extremeBin = sortedBins[0];
    const fillLevel = extremeBin.fillPct || 0;
    const binName = extremeBin.name || extremeBin.id;

    if (findFullest) {
      return `🔴 ${binName} is the fullest at ${fillLevel.toFixed(1)}% capacity (${(extremeBin.weightKg || 0).toFixed(2)} kg).`;
    } else {
      return `✅ ${binName} is the emptiest at ${fillLevel.toFixed(1)}% capacity (${(extremeBin.weightKg || 0).toFixed(2)} kg).`;
    }
  }

  compareBins(bins, binId1, comparison, binId2) {
    const bin1 = bins.find(b => b.id.toLowerCase() === `bin${binId1}`.toLowerCase());
    const bin2 = bins.find(b => b.id.toLowerCase() === `bin${binId2}`.toLowerCase());

    if (!bin1 || !bin2) {
      return `Sorry, I couldn't find information about one or both bins.`;
    }

    const fill1 = bin1.fillPct || 0;
    const fill2 = bin2.fillPct || 0;
    const weight1 = bin1.weightKg || 0;
    const weight2 = bin2.weightKg || 0;

    const name1 = bin1.name || bin1.id;
    const name2 = bin2.name || bin2.id;

    switch(comparison.toLowerCase()) {
      case 'fuller':
        if (fill1 > fill2) {
          return `✅ Yes, ${name1} (${fill1.toFixed(1)}%) is fuller than ${name2} (${fill2.toFixed(1)}%).`;
        } else if (fill1 < fill2) {
          return `❌ No, ${name1} (${fill1.toFixed(1)}%) is less full than ${name2} (${fill2.toFixed(1)}%).`;
        } else {
          return `📊 ${name1} and ${name2} are equally full at ${fill1.toFixed(1)}%.`;
        }
      
      case 'emptier':
        if (fill1 < fill2) {
          return `✅ Yes, ${name1} (${fill1.toFixed(1)}%) is emptier than ${name2} (${fill2.toFixed(1)}%).`;
        } else if (fill1 > fill2) {
          return `❌ No, ${name1} (${fill1.toFixed(1)}%) is fuller than ${name2} (${fill2.toFixed(1)}%).`;
        } else {
          return `📊 ${name1} and ${name2} are equally full at ${fill1.toFixed(1)}%.`;
        }
      
      case 'heavier':
        if (weight1 > weight2) {
          return `✅ Yes, ${name1} (${weight1.toFixed(2)}kg) is heavier than ${name2} (${weight2.toFixed(2)}kg).`;
        } else if (weight1 < weight2) {
          return `❌ No, ${name1} (${weight1.toFixed(2)}kg) is lighter than ${name2} (${weight2.toFixed(2)}kg).`;
        } else {
          return `📊 ${name1} and ${name2} weigh the same at ${weight1.toFixed(2)}kg.`;
        }
      
      case 'lighter':
        if (weight1 < weight2) {
          return `✅ Yes, ${name1} (${weight1.toFixed(2)}kg) is lighter than ${name2} (${weight2.toFixed(2)}kg).`;
        } else if (weight1 > weight2) {
          return `❌ No, ${name1} (${weight1.toFixed(2)}kg) is heavier than ${name2} (${weight2.toFixed(2)}kg).`;
        } else {
          return `📊 ${name1} and ${name2} weigh the same at ${weight1.toFixed(2)}kg.`;
        }
      
      default:
        return `📊 ${name1}: ${fill1.toFixed(1)}% (${weight1.toFixed(2)}kg)\n${name2}: ${fill2.toFixed(1)}% (${weight2.toFixed(2)}kg)`;
    }
  }

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

  getSystemContext() {
    return `You are a smart waste management assistant. Help users with:
    - Recycling best practices
    - Waste reduction tips
    - Environmental impact of waste
    - Composting guidance
    - Sustainable waste management
    
    Keep responses concise and practical.`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = SmartBinChatbot;
