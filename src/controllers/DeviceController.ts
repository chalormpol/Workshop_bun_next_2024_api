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
  list: async ({ query }: { query: { page: number; pageSize: number } }) => {
    try {
      const page = parseInt(query.page.toString());
      const pageSize = parseInt(query.pageSize.toString());
      const totalRows = await prisma.device.count({
        where: {
          status: "active",
        },
      });

      const totalPages = Math.ceil(totalRows / pageSize);
      const devices = await prisma.device.findMany({
        where: {
          status: "active",
        },
        orderBy: {
          id: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return { message: "success", results: devices, totalPages: totalPages };
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
