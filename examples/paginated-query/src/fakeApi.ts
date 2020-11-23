import { Feed } from "./types"

const articles = [...Array(13)].map((_, index) => ({
  slug: `s${index}`,
  title: `Article #${index + 1}`
}));

export async function getFeed(limit: number, offset: number) {
  return new Promise<Feed>((resolve) =>
    setTimeout(() => {
      const selectedArticles = articles.slice(offset, offset + limit);
      resolve({ articles: selectedArticles, articlesCount: articles.length });
    }, 1500)
  );
}
