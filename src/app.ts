import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Car, Customer, Order } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
app.use(express.json());

// cadastrar veículo
app.post("/car", async (req: Request, res: Response) => {
  const { model, year, customerId } = req.body;

  // create car
  const car = await prisma.car.create({
    data: {
      model: model,
      year: year,
      customerId: customerId,
    },
  });
  res.json(car);
});

// cadastrar usuário
app.post("/customer", async (req: Request, res: Response) => {
  const { name, email, number } = req.body;

  // create customer
  const customer = await prisma.customer.create({
    data: {
      name: name,
      email: email,
      number: number,
    },
  });
  res.json(customer);
});

// Rota alugar veículo
app.post("/rent", async (req: Request, res: Response) => {
  const { carId, customerId, startDate, endDate } = req.body;

  // checar disponibilidade
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { orders: true },
  });
  if (!car) {
    return res.status(404).json({ message: "ocorreu um erro" });
  }
  if (car.orders.some((order) => order.status === "RENTED")) {
    return res.status(400).json({ message: "carro indiponivel" });
  }

  // criar pedidp
  const order = await prisma.order.create({
    data: {
      carId: car.id,
      customerId: customerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "RENTED",
    },
  });
  res.json(order);
});

// devolver um veículo
app.post("/return", async (req: Request, res: Response) => {
  const { carId, customerId, endDate } = req.body;

  // checar serviço
  const order = await prisma.order.findFirst({
    where: {
      carId: carId,
      customerId: customerId,
      status: "RENTED",
    },
  });
  if (!order) {
    return res.status(404).json({ message: "ocorreu um erro" });
  }

  // ATT ordem
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      endDate: new Date(endDate),
      status: "RETURNED",
    },
  });
  res.json(updatedOrder);
});

// editar um usuário
app.put("/customer/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, number } = req.body;

  // update customer
  const updatedCustomer = await prisma.customer.update({
    where: { id: Number(id) },
    data: {
      name: name,
      email: email,
      number: number,
    },
  });
  res.json(updatedCustomer);
});
app.get("/customers", async (req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({
    include: { cars: true, orders: true },
  });
  res.json(customers);
});

// Rota para excluir um veículo
app.delete("/car/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  // check if car exists
  const car = await prisma.car.findUnique({
    where: { id: Number(id) },
  });
  if (!car) {
    return res.status(404).json({ message: "ocorreu um erro" });
  }

  // delete car
  await prisma.car.delete({
    where: { id: Number(id) },
  });
  res.json({ message: "deletado" });
});

// Rota para editar um veículo
app.put("/car/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { model, year, customerId } = req.body;

  // update car
  const updatedCar = await prisma.car.update({
    where: { id: Number(id) },
    data: {
      model: model,
      year: year,
      customerId: customerId,
    },
  });
  res.json(updatedCar);
});

// Rota para excluir um usuário
app.delete("/customer/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  // delete customer
  await prisma.customer.delete({
    where: { id: Number(id) },
  });
  res.json({ message: "deletado" });
});

// Rota para editar um usuário
app.put("/customer/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, number } = req.body;

  // update customer
  const updatedCustomer = await prisma.customer.update({
    where: { id: Number(id) },
    data: {
      name: name,
      email: email,
      number: number,
    },
  });
  res.json(updatedCustomer);
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Porta ${PORT}`);
});
