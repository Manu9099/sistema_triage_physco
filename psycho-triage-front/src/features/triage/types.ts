export type TriageRequest = {
  age: number;
  phq9Answers: number[];
  gad7Answers: number[];
  suicidalIdeation: boolean;
  selfHarmHistory: boolean;
  functionalImpairment: boolean;
  substanceUse: boolean;
  socialSupportLevel: number;
};

export type TriageResult = {
  phq9Score: number;
  gad7Score: number;
  urgencyLevel: string;
  clinicalProfile: string;
  summary: string;
  recommendation: string;
};

export type TriageListItem = {
  id: number;
  age: number;
  phq9Score: number;
  gad7Score: number;
  urgencyLevel: string;
  clinicalProfile: string;
  createdAt: string;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type HistoryFilters = {
  urgencyLevel: string;
  clinicalProfile: string;
  searchTerm: string;
  sortBy: string;
  sortDirection: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type StepKey = "general" | "phq9" | "gad7" | "risk" | "review";

export type StepItem = {
  key: StepKey;
  title: string;
  description: string;
};