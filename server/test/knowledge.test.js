import test from 'node:test';
import assert from 'node:assert/strict';
import { searchKnowledgeBase } from '../src/tools/knowledgeRetriever.js';

test('Knowledge Retriever - Query Matching 50/30/20 Rule', () => {
  const result = searchKnowledgeBase({
    query: 'What is the 50/30/20 budgeting rule for Indian salaries?',
    limit: 2
  });

  assert.equal(result.success, true);
  assert.ok(result.count >= 1);
  assert.ok(result.results.length >= 1);

  const topMatch = result.results[0];
  assert.equal(topMatch.doc_id, 'KB-001');
  assert.match(topMatch.title, /50\/30\/20/);
  assert.ok(topMatch.relevance_score > 2.0);
  assert.ok(topMatch.snippet.length > 20);
});

test('Knowledge Retriever - Query Matching Emergency Fund', () => {
  const result = searchKnowledgeBase({
    query: 'How much emergency fund should I keep in liquid mutual funds or fixed deposits?',
    limit: 1
  });

  assert.equal(result.success, true);
  assert.equal(result.count, 1);
  assert.equal(result.results[0].doc_id, 'KB-002');
  assert.match(result.results[0].title, /Emergency Fund/);
});

test('Knowledge Retriever - Query Matching UPI Safety & Helpline 1930', () => {
  const result = searchKnowledgeBase({
    query: 'UPI payment fraud qr code scam cybercrime',
    limit: 1
  });

  assert.equal(result.success, true);
  assert.equal(result.count, 1);
  assert.equal(result.results[0].doc_id, 'KB-003');
  assert.match(result.results[0].title, /UPI Safety/);
});

test('Knowledge Retriever - Unmatched Query Returns Truthful No Result Message', () => {
  const result = searchKnowledgeBase({
    query: 'astronomy black holes quantum gravitation physics',
    limit: 3
  });

  assert.equal(result.success, true);
  assert.equal(result.count, 0);
  assert.equal(result.results.length, 0);
  assert.match(result.message, /No sufficiently relevant local source was found/);
});

test('Knowledge Retriever - Empty or Whitespace Query', () => {
  const result = searchKnowledgeBase({ query: '    ' });
  assert.equal(result.success, true);
  assert.equal(result.count, 0);
  assert.match(result.message, /Empty query/);
});
