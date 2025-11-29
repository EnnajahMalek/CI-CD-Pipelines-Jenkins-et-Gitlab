const request=require("supertest");const app=require("../src/index");
test("GET /",( )=>request(app).get("/").then(r=>{expect(r.status).toBe(200);}));