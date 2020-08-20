// TODO unify this interface names/comments

export interface ITodo {
  _id?: string,
  title: string,
  description: string,
  completed?: boolean,
};

// TODO use Partial for updates
export interface ITodoModel extends ITodo {
  _id: string
};

export interface IUser {
  _id?: string,
  name: string,
};

export interface IUserModel extends IUser {
  _id: string
};
