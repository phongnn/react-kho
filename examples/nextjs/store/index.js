import { Query } from "react-kho";

import { fetchData } from "../api";

export const query = new Query("GetData", fetchData, {
  merge: (existingItems, newItems) => [...existingItems, ...newItems]
});
