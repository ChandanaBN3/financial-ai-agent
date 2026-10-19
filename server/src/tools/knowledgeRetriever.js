import { Repository } from '../db/repository.js';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'in', 'at', 'of', 'on', 'and', 'or', 'to', 'for', 'with',
  'how', 'what', 'when', 'where', 'why', 'who', 'can', 'should', 'i', 'my', 'me',
  'do', 'does', 'did', 'be', 'are', 'was', 'were', 'about', 'from', 'this', 'that'
]);

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Local Keyword & Relevance Knowledge Retriever
 * Deterministic term-matching across verified local educational documents.
 */
export function searchKnowledgeBase(params = {}, repository = null) {
  const { query, limit = 3, min_score = 1.5 } = typeof params === 'string' ? { query: params } : params;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return {
      success: true,
      query: '',
      count: 0,
      results: [],
      message: 'Empty query provided. Please provide keywords to search the local knowledge base.'
    };
  }

  const repo = repository || new Repository();
  repo.seedInitialDataIfEmpty();
  const docs = repo.getAllKnowledgeDocs();

  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return {
      success: true,
      query,
      count: 0,
      results: [],
      message: 'Query contained only stop words or common punctuation.'
    };
  }

  const scoredDocs = [];

  for (const doc of docs) {
    let score = 0;
    const titleTokens = tokenize(doc.title);
    const contentTokens = tokenize(doc.content);
    const tags = (doc.tags || '').toLowerCase().split(',').map(t => t.trim());

    // Score based on query tokens
    for (const token of queryTokens) {
      // 1. Tag exact match (Highest relevance boost)
      if (tags.some(tag => tag === token || tag.includes(token))) {
        score += 3.0;
      }

      // 2. Title matches (High weight)
      const titleMatches = titleTokens.filter(t => t === token || t.includes(token)).length;
      score += titleMatches * 2.5;

      // 3. Content frequency (Standard TF)
      const contentMatches = contentTokens.filter(t => t === token || t.includes(token)).length;
      if (contentMatches > 0) {
        score += Math.min(contentMatches * 0.5, 3.0); // cap to prevent single-token domination
      }
    }

    if (score >= min_score) {
      // Extract most relevant snippet around matching keywords
      const snippet = extractSnippet(doc.content, queryTokens);
      scoredDocs.push({
        doc_id: doc.doc_id,
        title: doc.title,
        category: doc.category,
        relevance_score: Number(score.toFixed(2)),
        matched_tags: tags.filter(t => queryTokens.some(qt => t.includes(qt))),
        snippet,
        full_content: doc.content
      });
    }
  }

  // Sort by highest relevance score
  scoredDocs.sort((a, b) => b.relevance_score - a.relevance_score);

  const finalResults = scoredDocs.slice(0, Number(limit));

  if (finalResults.length === 0) {
    return {
      success: true,
      query,
      count: 0,
      results: [],
      message: `No sufficiently relevant local source was found for query: "${query}".`
    };
  }

  return {
    success: true,
    query,
    count: finalResults.length,
    results: finalResults,
    message: `Retrieved ${finalResults.length} relevant knowledge source(s).`
  };
}

function extractSnippet(content, tokens, maxLength = 220) {
  if (!content) return '';
  const lowerContent = content.toLowerCase();

  let firstIndex = -1;
  for (const token of tokens) {
    const idx = lowerContent.indexOf(token);
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
      firstIndex = idx;
    }
  }

  if (firstIndex === -1) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, firstIndex - 40);
  const end = Math.min(content.length, start + maxLength);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < content.length ? '...' : '';

  return prefix + content.slice(start, end).replace(/\s+/g, ' ').trim() + suffix;
}
