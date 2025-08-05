import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const dayjs = require("dayjs");

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
          status: "complete",
        },
      });
      return repairRecords;
    } catch (error) {
      return { message: error };
    }
  },
  dashboard: async (req: any) => {
    const url = new URL(req.url);
    const year = Number(url.searchParams.get("year"));
    const month = Number(url.searchParams.get("month"));

    try {
      const totalRepairRecord = await prisma.repairRecord.count();
      const totalRepairRecordComplete = await prisma.repairRecord.count({
        where: {
          status: "complete",
        },
      });
      const totalRepairRecordNotComplete = await prisma.repairRecord.count({
        where: {
          status: {
            not: "complete",
          },
        },
      });
      const totalAmount = await prisma.repairRecord.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "complete",
        },
      });

      ///
      /// list for income perdays
      ///
      const listIncomePerDays = [];
      const totalDaysInMonthAndYear = new Date(year, month, 0).getDate();

      for (let i = 1; i <= totalDaysInMonthAndYear; i++) {
        let startDate = new Date(year + "-" + month + "-" + i);
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(year + "-" + month + "-" + i);
        endDate.setHours(23, 59, 59, 999);

        const totalIncome = await prisma.repairRecord.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            payDate: {
              gte: startDate,
              lte: endDate,
            },
            status: "complete",
          },
        });

        listIncomePerDays.push({
          date: i,
          amount: totalIncome._sum.amount ?? 0,
        });
      }

      return {
        totalRepairRecord: totalRepairRecord,
        totalRepairRecordComplete: totalRepairRecordComplete,
        totalRepairRecordNotComplete: totalRepairRecordNotComplete,
        totalAmount: totalAmount._sum.amount || 0,
        listIncomePerDays: listIncomePerDays,
      };
    } catch (error) {
      return { message: error };
    }
  },
  //
  // รายได้ รายเดือน
  //
  incomePerMonth: async ({
    query,
  }: {
    query: {
      year: string;
    };
  }) => {
    try {
      const year = parseInt(query.year);
      let listIncomePerMonth = [];

      for (let i = 1; i <= 12; i++) {
        const totalDaysInMonth = dayjs(year + "-" + i + "-01").daysInMonth();
        let startDate = new Date(year + "-" + i + "-01");
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(year + "-" + i + "-" + totalDaysInMonth);
        endDate.setHours(23, 59, 59, 999);

        const totalIncome = await prisma.repairRecord.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            payDate: {
              gte: startDate,
              lte: endDate,
            },
            status: "complete",
          },
        });

        listIncomePerMonth.push({
          month: i,
          amount: totalIncome._sum.amount ?? 0,
        });
      }

      return listIncomePerMonth;
    } catch (error) {
      return error;
    }
  },
};
