// TODO unify this interface names/comments

export interface ITodo {
  id?: string,
  title: string,
  description: string,
  completed?: boolean,
};

// TODO use Partial for updates
export interface ITodoModel extends ITodo {
  id: string
};

export interface IUser {
  id?: string,
  name: string,
};

export interface IUserModel extends IUser {
  id: string
};
