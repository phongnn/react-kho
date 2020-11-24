import { Query, NormalizedType, Mutation } from "react-kho";
import { getUsers, addUser } from "./fakeApi";
import { User } from "./types";

const UserType = NormalizedType.register("User");

export const userListQuery = new Query(
  "UserList",
  () =>
    getUsers().then((users) =>
      users.map((u) => ({ ...u, __optimistic__: false }))
    ),
  {
    shape: [UserType]
  }
);

export const addUserMutation = new Mutation(
  "AddUser",
  (args: { user: User }) =>
    addUser(args.user).then((u) => ({ ...u, __optimistic__: false })),
  {
    resultShape: UserType,
    queryUpdates: {
      UserList: (currentValue, { mutationResult: newUserRef, optimistic }) => {
        return optimistic ? [...currentValue, newUserRef] : currentValue;
      }
    }
  }
);
