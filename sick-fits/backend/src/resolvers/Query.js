const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  /* async items(parent, args, ctx, info) {
    const items = await ctx.db.query.items();
    return items;
  } */
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
  },
  async users(parent, args, ctx, info) {
    // Check if we are looged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in!");
    }
    // Check if the user has prmission to query all users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);

    // If they do, query all the users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in!");
    }
    const order = await ctx.db.query.order(
      {
        where: { id: args.id }
      },
      info
    );
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      "ADMIN"
    );
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("You cant see this.");
    }
  }
};

module.exports = Query;
