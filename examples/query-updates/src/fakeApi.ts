import { Feed } from "./types";

const articles = [...Array(13)].map((_, index) => ({
  slug: `s${index}`,
  title: `Article #${index + 1}`
}));

const addArticle = () => {
  articles.push({
    slug: `s${articles.length}`,
    title: `New article #${articles.length + 1}`
  });
  if (articles.length < 30) {
    setTimeout(addArticle, 1000);
  }
};
setTimeout(addArticle, 1000);

export async function getFeed(limit: number, offset: number) {
  return new Promise<Feed>((resolve) =>
    setTimeout(() => {
      const selectedArticles = articles.slice(offset, offset + limit);
      resolve({ articles: selectedArticles, articlesCount: articles.length });
    }, 1500)
  );
}
