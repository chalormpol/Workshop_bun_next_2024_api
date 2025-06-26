import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { UserController } from "./controllers/UserController";
import { DeviceController } from "./controllers/DeviceController";
import { SectionController } from "./controllers/SectionController";
import { DepartmentController } from "./controllers/DepartmentController";
import { RepairRecordController } from "./controllers/RepairRecordController";
import { CompanyController } from "./controllers/CompanyController";

// middleware for check token
const checkSignIn = async ({
  jwt,
  request,
  set,
}: {
  jwt: any;
  request: any;
  set: any;
}) => {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    set.status = 401;
    return { message: "Unauthorized" };
  }

  const payload = await jwt.verify(token, "secret");

  if (!payload) {
    set.status = 401;
    return { message: "Unauthorized" };
  }
};

const app = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: "secret",
    })
  )
  .use(cors())

  .get("/", () => "Hello Elysia")
  .post("/api/user/signin", UserController.signIn)
  .put("/api/user/update", UserController.update)
  .get("/api/user/list", UserController.list)
  .post("/api/user/create", UserController.create)
  .put("/api/user/updateUser/:id", UserController.updateUser)
  .delete("/api/user/remove/:id", UserController.remove)
  .get("/api/user/listEngineer", UserController.listEngineer)

  //
  // Company
  //
  .get("/api/company/info", CompanyController.info, {
    beforeHandle: checkSignIn,
  })
  .put("/api/company/update", CompanyController.update)

  //
  // Repair Record
  //
  .get("/api/repair-record/list", RepairRecordController.list)
  .post("/api/repair-record/create", RepairRecordController.create)
  .put("/api/repair-record/update/:id", RepairRecordController.update)
  .delete("/api/repair-record/remove/:id", RepairRecordController.remove)
  .put(
    "/api/repair-record/updateStatus/:id",
    RepairRecordController.updateStatus
  )
  .put("/api/repair-record/receive", RepairRecordController.receive)
  .get("/api/income/report/:startDate/:endDate", RepairRecordController.report) // รายรับรวมตามวันที่
  .get("/api/repair-record/dashboard", RepairRecordController.dashboard) // รายรับรวมตามวันที่

  //
  // Department and Section
  //
  .get("/api/department/list", DepartmentController.list)
  .get(
    "/api/section/listByDepartment/:departmentId",
    SectionController.listByDepartment
  )

  //
  // Device
  //
  .post("/api/device/create", DeviceController.create)
  .get("/api/device/list", DeviceController.list)
  .put("/api/device/update/:id", DeviceController.update)
  .delete("/api/device/remove/:id", DeviceController.remove)

  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
