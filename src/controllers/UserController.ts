import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const UserController = {
  signIn: async ({
    body,
    jwt,
  }: {
    body: { username: string; password: string };
    jwt: any;
  }) => {
    try {
      const user = await prisma.user.findUnique({
        select: {
          id: true,
          username: true,
          level: true,
        },
        where: {
          username: body.username,
          password: body.password,
          status: "active",
        },
      });

      if (!user) {
        return { message: "Invalid username or password" };
      }

      const now = Math.floor(Date.now() / 1000); // current time in seconds
      const exp = now + 3600; // 1 hour from now

      const token = await jwt.sign({
        ...user,
        exp, // ⬅️ ฝัง exp เข้าไปใน payload ด้วย
      });

      console.log(token);
      return { token: token, user: user };
    } catch (error) {
      return { message: error };
    }
  },
  update: async ({
    body,
    request,
    jwt,
  }: {
    body: {
      username: string;
      password: string;
    };
    request: any;
    jwt: any;
  }) => {
    try {
      const headers = request.headers.get("Authorization");
      const token = headers?.split(" ")[1];
      const payload = await jwt.verify(token);
      const id = payload.id;
      const oldUser = await prisma.user.findUnique({
        where: { id },
      });
      const newData = {
        username: body.username,
        password: body.password == "" ? oldUser?.password : body.password,
      };

      await prisma.user.update({
        where: { id },
        data: newData,
      });

      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  list: async () => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          level: true,
          Section: {
            select: {
              name: true,
              id: true,
              department: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
        where: {
          status: "active",
        },
        orderBy: {
          id: "desc",
        },
      });

      return { users: users };
    } catch (error) {
      return { message: error };
    }
  },
  create: async ({
    body,
  }: {
    body: {
      username: string;
      password: string;
      level: string;
      sectionId: number;
    };
  }) => {
    try {
      await prisma.user.create({
        data: body,
      });

      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  updateUser: async ({
    body,
    params,
  }: {
    body: {
      username: string;
      password: string;
      level: string;
      sectionId: number;
    };
    params: {
      id: string;
    };
  }) => {
    try {
      const oldUser = await prisma.user.findUnique({
        select: { password: true },
        where: { id: parseInt(params.id) },
      });

      const newPassword =
        body.password.trim().length === 0 ? oldUser?.password : body.password;

      const newData = {
        username: body.username,
        password: newPassword,
        level: body.level,
        sectionId: body.sectionId,
      };

      await prisma.user.update({
        where: { id: parseInt(params.id) },
        data: newData,
      });

      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  remove: async ({
    params,
  }: {
    params: {
      id: string;
    };
  }) => {
    try {
      await prisma.user.update({
        where: {
          id: parseInt(params.id),
        },
        data: {
          status: "inactive",
        },
      });

      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  listEngineer: async () => {
    try {
      const engineers = await prisma.user.findMany({
        where: {
          level: "engineer",
          status: "active",
        },
        orderBy: {
          username: "asc",
        },
      });
      return { engineers: engineers };
    } catch (error) {
      return { message: error };
    }
  },
  level: async ({ jwt, request }: { jwt: any; request: any }) => {
    try {
      const headers = request.headers.get("Authorization");
      const token = headers?.split(" ")[1];
      const payload = await jwt.verify(token);
      const id = payload.id;
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          level: true,
        },
      });

      return user?.level;
    } catch (error) {
      return { message: error };
    }
  },
};
