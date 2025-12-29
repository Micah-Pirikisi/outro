// src/lib/prisma.js
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { adapter } from "../../prisma.config.js";

const prisma = new PrismaClient({ adapter });

export default prisma;
