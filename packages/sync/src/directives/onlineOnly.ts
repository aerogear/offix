import { SchemaDirectiveVisitor } from "graphql-tools";
import { defaultFieldResolver, GraphQLField } from "graphql";

export class OnlineOnlyDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function(root, args, context, info) {
      console.log(root, args, context, info);
      const newContext = { ...context, onlineOnly: true };
      context = newContext;
      resolve.apply(this);
    };
  }
}
