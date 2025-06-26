import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const RepairRecordController = {
  list: async () => {
    try {
      const repairRecords = await prisma.repairRecord.findMany({
        include: {
          device: true,
          user: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      let list = [];

      for (const repairRecord of repairRecords) {
        if (repairRecord.engineerId) {
          const engineer = await prisma.user.findUnique({
            select: {
              username: true,
            },
            where: {
              id: repairRecord.engineerId,
            },
          });
          list.push({ ...repairRecord, engineer });
        } else {
          list.push(repairRecord);
        }
      }

      return { repairRecords: list };
    } catch (error) {
      return { message: error };
    }
  },
  create: async ({
    body,
    request,
    jwt,
  }: {
    body: {
      customerName: string;
      customerPhone: string;
      deviceName: string;
      deviceId?: number;
      deviceBarcode: string;
      deviceSerial: string;
      problem: string;
      solving: string;
      expireDate?: Date;
    };
    request: any;
    jwt: any;
  }) => {
    try {
      const { deviceId, ...restBody } = body;
      const row = await prisma.repairRecord.create({
        data: {
          ...restBody,
          device: deviceId
            ? {
                connect: {
                  id: deviceId,
                },
              }
            : undefined,
        },
      });

      return { message: "success", row: row };
    } catch (error) {
      console.error(error);
      return { message: error };
    }
  },
  update: async ({
    body,
    params,
  }: {
    body: {
      customerName: string;
      customerPhone: string;
      deviceName: string;
      deviceId?: number;
      deviceBarcode: string;
      deviceSerial: string;
      problem: string;
      solving: string;
      expireDate?: Date;
    };
    params: { id: string };
  }) => {
    try {
      const { deviceId, ...restBody } = body;
      await prisma.repairRecord.update({
        where: {
          id: parseInt(params.id),
        },
        data: {
          ...restBody,
          device: deviceId
            ? {
                connect: {
                  id: deviceId,
                },
              }
            : undefined,
        },
      });
      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  remove: async ({ params }: { params: { id: string } }) => {
    try {
      await prisma.repairRecord.update({
        where: {
          id: parseInt(params.id),
        },
        data: {
          status: "cancel",
        },
      });
      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  updateStatus: async ({
    params,
    body,
  }: {
    params: { id: string };
    body: {
      status: string;
      solving: string;
      engineerId: number;
    };
  }) => {
    try {
      const row = await prisma.repairRecord.update({
        where: {
          id: parseInt(params.id),
        },
        data: body,
      });
      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  receive: async ({
    body,
  }: {
    body: {
      id: number;
      amount: number;
    };
  }) => {
    try {
      const row = await prisma.repairRecord.update({
        where: { id: body.id },
        data: {
          amount: body.amount,
          payDate: new Date(),
          status: "complete", // ลูกค้ามารับอุปกรณ์เเล้ว
        },
      });
      return { message: "success" };
    } catch (error) {
      return { message: error };
    }
  },
  report: async ({
    params,
  }: {
    params: {
      startDate: Date;
      endDate: Date;
    };
  }) => {
    try {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);

      startDate.setHours(0, 0, 0, 0); // เวลา 00:00:00.000
      endDate.setHours(23, 59, 59, 999); // เวลา 23:59:59.999

      const repairRecords = await prisma.repairRecord.findMany({
        where: {
          payDate: {
            gte: startDate,
            lte: endDate,
          },
          status: "completed",
        },
      });
      return repairRecords;
    } catch (error) {
      return { message: error };
    }
  },
  dashboard: async () => {
    try {
      const totalRepairRecord = await prisma.repairRecord.count();
      const totalRepairRecordComplete = await prisma.repairRecord.count({
        where: {
          status: "completed",
        },
      });
      const totalRepairRecordNotComplete = await prisma.repairRecord.count({
        where: {
          status: {
            not: "completed",
          },
        },
      });
      const totalAmount = await prisma.repairRecord.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "completed",
        },
      });
      return {
        totalRepairRecord: totalRepairRecord,
        totalRepairRecordComplete: totalRepairRecordComplete,
        totalRepairRecordNotComplete: totalRepairRecordNotComplete,
        totalAmount: totalAmount._sum.amount || 0,
      };
    } catch (error) {
      return { message: error };
    }
  },
};
