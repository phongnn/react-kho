export interface Article {
  slug: string
  title: string
}

export interface Feed {
  articles: Article[];
  articlesCount: number
}
