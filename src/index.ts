import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { config } from "dotenv";
config(); // โหลด .env
if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in .env file");
}

import { UserController } from "./controllers/UserController";
import { DeviceController } from "./controllers/DeviceController";
import { SectionController } from "./controllers/SectionController";
import { DepartmentController } from "./controllers/DepartmentController";
import { RepairRecordController } from "./controllers/RepairRecordController";
import { CompanyController } from "./controllers/CompanyController";

// ✅ Middleware from Elysia
const checkSignIn = async ({
  jwt,
  request,
  set,
}: {
  jwt: any;
  request: any;
  set: any;
}) => {
  const token = request.headers.get("Authorization")?.split(" ")[1]; //Bearer token "Bearer 123ldaskfjh213432d"

  if (!token) {
    set.status = 401;
    return { message: "Unauthorized" };
  }

  try {
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
  } catch (err: any) {
    set.status = 401;

    if (err.message === "jwt expired") {
      return { message: "Token expired" };
    }

    return { message: "Invalid token" };
  }
};

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "1h",
    })
  )

  // ✅ Logging
  .onRequest(({ request, set }) => {
    console.log(
      `[${new Date().toISOString()}] [${request.method}:${set.status}] ${
        request.url
      }`
    );
  })

  // 🌐 Public route
  .get("/", () => "Hello Elysia")
  .post("/api/user/signin", UserController.signIn)

  // 👤 User
  .put("/api/user/update", UserController.update)
  .get("/api/user/list", UserController.list)
  .post("/api/user/create", UserController.create)
  .put("/api/user/updateUser/:id", UserController.updateUser)
  .delete("/api/user/remove/:id", UserController.remove)
  .get("/api/user/listEngineer", UserController.listEngineer)
  .get("/api/user/level", UserController.level)

  // 🏢 Company
  .get("/api/company/info", CompanyController.info, {
    beforeHandle: checkSignIn,
  })
  .put("/api/company/update", CompanyController.update)

  // 🛠️ Repair Record
  .get("/api/repair-record/list", RepairRecordController.list)
  .post("/api/repair-record/create", RepairRecordController.create)
  .put("/api/repair-record/update/:id", RepairRecordController.update)
  .delete("/api/repair-record/remove/:id", RepairRecordController.remove)
  .put(
    "/api/repair-record/updateStatus/:id",
    RepairRecordController.updateStatus
  )
  .put("/api/repair-record/receive", RepairRecordController.receive)
  .get("/api/income/report/:startDate/:endDate", RepairRecordController.report)
  .get("/api/repair-record/dashboard", RepairRecordController.dashboard)
  .get(
    "/api/repair-record/income-per-month",
    RepairRecordController.incomePerMonth
  )

  // 🏬 Department and Section
  .get("/api/department/list", DepartmentController.list)
  .get(
    "/api/section/listByDepartment/:departmentId",
    SectionController.listByDepartment
  )

  // 📱 Device
  .post("/api/device/create", DeviceController.create)
  .get("/api/device/list", DeviceController.list)
  .put("/api/device/update/:id", DeviceController.update)
  .delete("/api/device/remove/:id", DeviceController.remove)

  // ✅ Start server LAST
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
