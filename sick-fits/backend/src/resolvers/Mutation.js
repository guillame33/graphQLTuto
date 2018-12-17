const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged to do that!");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // This is how we create a relationship between the item and the user
          user: { connect: { id: ctx.request.userId } },
          ...args
        }
      },
      info
    );
    return item;
  },
  async updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    const item = await ctx.db.mutation.updateItem(
      {
        data: {
          ...updates
        },
        where: {
          id: args.id
        }
      },
      info
    );
    return item;
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
    // Check if we have the permission
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );
    if (!ownsItem && hasPermissions) {
      throw new Error("You don't have permission to do that");
    }
    return ctx.db.mutation.deleteItem({ where });
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      { data: { ...args, password, permissions: { set: ["USER"] } } },
      info
    );
    // create JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set the cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // check pass correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid password");
    }
    // generate token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set the cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye" };
  },
  async requestReset(parent, args, ctx, info) {
    // Check if its a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error("No User");
    }
    // Set a reset token ans expiry
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    // Email the reset link
    const mailRes = await transport.sendMail({
      from: "me@me.com",
      to: user.email,
      subject: "Your pass reset token",
      html: makeANiceEmail(
        `Your password reset token is here! \n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click Here</a>`
      )
    });
    return { message: "Sent!" };
  },
  async resetPassword(parent, args, ctx, info) {
    // check pass
    if (args.password !== args.confirmPassword) {
      throw new Error("Password don't match!");
    }
    // legit reset token
    // check expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("This token is either invalid or expired!");
    }
    // hash new pass
    const password = await bcrypt.hash(args.password, 10);
    // save new pass
    const updateUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // generate jwt
    const token = jwt.sign({ userId: updateUser.id }, process.env.APP_SECRET);
    // set the jwt cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // return new user
    return updateUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    // Check logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in!");
    }
    // query the user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );
    // check
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    // update the user
    return ctx.db.mutation.updateUser(
      {
        data: { permissions: { set: args.permissions } },
        where: { id: args.userId }
      },
      info
    );
  }
};

module.exports = Mutations;
