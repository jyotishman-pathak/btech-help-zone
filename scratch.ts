import prisma from "./lib/prisma.client";
async function main() {
    const test = await prisma.mockTest.findUnique({
        where: { id: "cmpeiggt00009w6k4zrainjl9" }
    });
    console.log(test);
}
main();
