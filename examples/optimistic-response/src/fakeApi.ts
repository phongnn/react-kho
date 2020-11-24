import { User } from "./types";
import { guid } from "./helpers";

const users = [...Array(2)].map((_, index) => ({
  id: guid(),
  name: `User ${index + 1}`
}));

export async function getUsers() {
  return new Promise<User[]>((resolve) =>
    setTimeout(() => resolve(users), 500)
  );
}

export async function addUser(user: User) {
  return new Promise<User>((r) => setTimeout(() => r(user), 2000));
}
