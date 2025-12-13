export enum Section {
  VOCABULARY = 'Vocabulary',
  GRAMMAR = 'Grammar'
}

export enum GrammarArea {
  TENSES = 'Tenses & Future Forms',
  ARTICLES_QUANTIFIERS = 'Articles & Quantifiers',
  ADJECTIVES_ADVERBS = 'Adjectives & Adverbs',
  PREPOSITIONS = 'Prepositions',
  MODALS = 'Modals',
  GERUNDS_INFINITIVES = 'Gerunds & Infinitives',
  CONDITIONALS = 'Conditionals & Wishes',
  RELATIVE_CLAUSES = 'Relative Clauses',
  PASSIVE_VOICE = 'Passive Voice',
  CONNECTORS = 'Connectors & Discourse',
  WORD_FORMATION = 'Word Formation'
}

export interface Question {
  id: string;
  text: string;
  options: { [key: string]: string };
  correctOption: string;
  section: Section;
  grammarArea?: GrammarArea; // Only for grammar questions
  explanation?: string;
}

export interface TestState {
  status: 'intro' | 'active' | 'finished';
  timerEnabled: boolean;
  timeRemaining: number; // in seconds
  answers: { [questionId: string]: string };
  extensionsUsed: number;
  studentName: string;
}