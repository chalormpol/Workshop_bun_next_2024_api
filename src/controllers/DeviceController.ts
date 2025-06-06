// CRUD Device
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export const DeviceController = {
  create: async ({
    body,
  }: {
    body: {
      name: string;
      barcode: string;
      serial: string;
      expireDate: Date;
      remark: string;
    };
  }) => {
    try {
      await prisma.device.create({
        data: body,
      });

      return { message: "success" };
    } catch (error) {
      return error;
    }
  },
  list: async () => {
    try {
      const devices = await prisma.device.findMany({
        where: {
          status: "active",
        },
        orderBy: {
          id: "desc",
        },
      });

      return { message: "success", devices };
    } catch (error) {
      return error;
    }
  },
  update: async ({
    body,
    params,
  }: {
    body: {
      name: string;
      barcode: string;
      serial: string;
      expireDate: Date;
      remark: string;
    };
    params: {
      id: string;
    };
  }) => {
    try {
      await prisma.device.update({
        where: { id: parseInt(params.id) },
        data: body,
      });

      return { message: "success" };
    } catch (error) {
      return error;
    }
  },
  remove: async ({ params }: { params: { id: string } }) => {
    try {
      await prisma.device.update({
        where: { id: parseInt(params.id) },
        data: { status: "inactive" },
      });
      return { message: "success" };
    } catch (error) {
      return error;
    }
  },
};
