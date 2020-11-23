import { Query, NormalizedType } from "react-kho";
import { getFeed } from "./fakeApi";

const ArticleType = NormalizedType.register("Article", { keyFields: ["slug"] });

export const feedQuery = new Query(
  "InfiniteFeed",
  (args: { limit: number; offset: number }) => getFeed(args.limit, args.offset),
  {
    shape: {
      articles: [ArticleType]
    },
    queryUpdates: {
      InfiniteFeed: (
        currentValue,
        { queryArgs, relatedQueryArgs, relatedQueryResult }
      ) => {
        return queryArgs.offset === relatedQueryArgs.offset
          ? currentValue
          : {
              ...currentValue,
              articlesCount: relatedQueryResult.articlesCount
            };
      }
    }
  }
);
